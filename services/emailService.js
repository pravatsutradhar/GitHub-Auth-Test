import nodemailer from 'nodemailer';

class EmailService {
	constructor() {
		this.transporter = null;
		this.initializeTransporter();
	}

	initializeTransporter() {
		// Use different transport based on environment
		if (process.env.SMTP_HOST) {
			// SMTP configuration
			this.transporter = nodemailer.createTransporter({
				host: process.env.SMTP_HOST,
				port: process.env.SMTP_PORT || 587,
				secure: process.env.SMTP_PORT == 465,
				auth: {
					user: process.env.SMTP_USER,
					pass: process.env.SMTP_PASS
				}
			});
		} else if (process.env.SENDGRID_API_KEY) {
			// SendGrid configuration
			this.transporter = nodemailer.createTransporter({
				service: 'SendGrid',
				auth: {
					user: 'apikey',
					pass: process.env.SENDGRID_API_KEY
				}
			});
		} else {
			// Development mode - use console logging
			this.transporter = {
				sendMail: async (options) => {
					console.log('📧 Email would be sent:');
					console.log('To:', options.to);
					console.log('Subject:', options.subject);
					console.log('Content:', options.text || options.html);
					return { messageId: 'dev-' + Date.now() };
				}
			};
		}
	}

	async sendTriageEmail(user, issue, repository) {
		try {
			const subject = `[${repository.fullName}] ${issue.title}`;
			const htmlContent = this.generateEmailHTML(user, issue, repository);
			const textContent = this.generateEmailText(user, issue, repository);

			const mailOptions = {
				from: process.env.MAIL_FROM || 'CodeTriage Clone <noreply@example.com>',
				to: user.email,
				subject,
				text: textContent,
				html: htmlContent
			};

			const result = await this.transporter.sendMail(mailOptions);
			console.log(`✅ Email sent to ${user.email} for issue #${issue.issueNumber}`);
			return result;
		} catch (error) {
			console.error(`❌ Failed to send email to ${user.email}:`, error.message);
			throw error;
		}
	}

	generateEmailHTML(user, issue, repository) {
		const difficultyEmoji = {
			beginner: '🟢',
			intermediate: '🟡',
			advanced: '🔴',
			unknown: '⚪'
		};

		const difficultyText = {
			beginner: 'Beginner',
			intermediate: 'Intermediate', 
			advanced: 'Advanced',
			unknown: 'Unknown'
		};

		return `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8">
				<title>CodeTriage - ${repository.fullName}</title>
				<style>
					body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
					.container { max-width: 600px; margin: 0 auto; padding: 20px; }
					.header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
					.issue-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
					.issue-meta { color: #666; font-size: 14px; margin-bottom: 15px; }
					.issue-body { background: #fff; padding: 15px; border: 1px solid #e1e4e8; border-radius: 6px; margin-bottom: 20px; }
					.labels { margin: 10px 0; }
					.label { display: inline-block; padding: 2px 8px; margin: 2px; background: #f1f8ff; color: #0366d6; border-radius: 12px; font-size: 12px; }
					.cta-button { display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
					.footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e4e8; font-size: 12px; color: #666; }
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1>🔧 CodeTriage</h1>
						<p>Hi ${user.username}! Here's an issue you might want to help with:</p>
					</div>
					
					<div class="issue-title">${issue.title}</div>
					
					<div class="issue-meta">
						<strong>Repository:</strong> ${repository.fullName}<br>
						<strong>Issue #${issue.issueNumber}</strong><br>
						<strong>Difficulty:</strong> ${difficultyEmoji[issue.difficulty]} ${difficultyText[issue.difficulty]}<br>
						<strong>Comments:</strong> ${issue.comments}<br>
						<strong>Updated:</strong> ${new Date(issue.lastUpdated).toLocaleDateString()}
					</div>
					
					${issue.labels && issue.labels.length > 0 ? `
						<div class="labels">
							<strong>Labels:</strong><br>
							${issue.labels.map(label => `<span class="label">${label}</span>`).join('')}
						</div>
					` : ''}
					
					${issue.body ? `
						<div class="issue-body">
							${issue.body.substring(0, 500)}${issue.body.length > 500 ? '...' : ''}
						</div>
					` : ''}
					
					<div style="text-align: center; margin: 30px 0;">
						<a href="${issue.htmlUrl}" class="cta-button">View Issue on GitHub</a>
					</div>
					
					<div class="footer">
						<p>You're receiving this because you subscribed to ${repository.fullName}.</p>
						<p>
							<a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscriptions">Manage Subscriptions</a> | 
							<a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/unsubscribe?token=UNSUBSCRIBE_TOKEN">Unsubscribe</a>
						</p>
					</div>
				</div>
			</body>
			</html>
		`;
	}

	generateEmailText(user, issue, repository) {
		return `
CodeTriage - ${repository.fullName}

Hi ${user.username}! Here's an issue you might want to help with:

${issue.title}

Repository: ${repository.fullName}
Issue #${issue.issueNumber}
Difficulty: ${issue.difficulty}
Comments: ${issue.comments}
Updated: ${new Date(issue.lastUpdated).toLocaleDateString()}

${issue.labels && issue.labels.length > 0 ? `Labels: ${issue.labels.join(', ')}\n` : ''}

${issue.body ? `${issue.body.substring(0, 500)}${issue.body.length > 500 ? '...' : ''}\n` : ''}

View Issue: ${issue.htmlUrl}

---
You're receiving this because you subscribed to ${repository.fullName}.
Manage subscriptions: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscriptions
		`.trim();
	}

	async testConnection() {
		try {
			await this.transporter.verify();
			console.log('✅ Email service connection verified');
			return true;
		} catch (error) {
			console.warn('⚠️  Email service connection failed:', error.message);
			return false;
		}
	}
}

export default new EmailService();

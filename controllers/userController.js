import User from '../models/User.js';

export const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-githubId -__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const {
      isPublic,
      emailFrequency,
      emailTimeOfDay,
      maxIssuesPerDay,
      skipIssuesWithPR,
      favoriteLanguages,
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        isPublic,
        emailFrequency,
        emailTimeOfDay,
        maxIssuesPerDay,
        skipIssuesWithPR,
        favoriteLanguages,
      },
      { new: true, runValidators: true }
    ).select('-githubId -__v');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

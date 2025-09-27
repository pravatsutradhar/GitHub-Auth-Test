@echo off
echo Starting MongoDB...
echo.
echo If you get an error, try running as Administrator
echo.
net start MongoDB
if %errorlevel% neq 0 (
    echo.
    echo MongoDB service not found. Trying alternative method...
    echo Make sure MongoDB is installed and the data directory exists.
    echo.
    mongod --dbpath C:\data\db
)
echo.
echo MongoDB should now be running on localhost:27017
pause

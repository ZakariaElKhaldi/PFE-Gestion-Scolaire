@echo off
echo Starting Database Reset Process...
cd ..
node db/reset-db.js
echo Reset complete! Press any key to exit...
pause > nul 
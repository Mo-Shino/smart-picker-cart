@echo off
title Smart Picker Cart Server
cd /d "%~dp0"
echo ===================================================
echo   Smart Picker Cart (ISEF Prototype)
echo ===================================================
echo Starting Node.js Server...
".tools\node\node.exe" server.js
pause

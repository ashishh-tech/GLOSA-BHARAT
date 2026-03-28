@echo off
title GLOSA-BHARAT Launcher
echo Starting GLOSA-BHARAT...
cd /d "%~dp0"

echo Starting Backend...
start "GLOSA Backend" cmd /k "cd backend && npm run dev"

echo Starting Frontend...
start "GLOSA Frontend" cmd /k "cd frontend && npm run dev"

echo Starting AI Service...
start "GLOSA AI Service" cmd /k "cd ai-service && python main.py"

echo GLOSA-BHARAT ecosystem services are starting in separate windows.
timeout /t 3

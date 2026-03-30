@echo off
title GLOSA-BHARAT Live Demo Launcher
color 0B

echo ========================================================
echo         GLOSA-BHARAT LIVE DEMO LAUNCHER
echo ========================================================
echo.
cd /d "%~dp0"

echo [1/4] Starting Node.js Backend...
start "GLOSA Backend" cmd /c "title GLOSA Backend && cd backend && npm run dev"

echo [2/4] Starting React Frontend...
start "GLOSA Frontend" cmd /c "title GLOSA Frontend && cd frontend && npm run dev"

echo [3/4] Starting FastAPI AI Service...
start "GLOSA AI Service" cmd /c "title GLOSA AI Service && cd ai-service && ..\.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000"

echo [4/4] Starting Cloudflare Tunnel (exposing frontend)...
if exist tunnel.err break > tunnel.err
start "Cloudflare Tunnel" /MIN cmd /c "cloudflared.exe tunnel --url http://localhost:3000 2> tunnel.err"

echo.
echo Waiting for tunnel connection...
timeout /t 6 >nul

echo.
echo ========================================================
echo                  LIVE DEMO IS READY!
echo ========================================================
echo.
echo Your public shareable link:
powershell -Command "$url = (Get-Content tunnel.err -Tail 30 | Select-String -Pattern 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' | Select-Object -First 1).Matches.Value; if ($url) { Write-Host $url -ForegroundColor Green; Start-Process $url } else { Write-Host 'URL not found yet. Check tunnel.err' -ForegroundColor Red }"
echo.
echo Close this window ONLY when you are done presenting.
echo (Closing this will leave the background windows open, which you can close manually)
echo ========================================================
pause

@echo off
echo Starting Architects Suite Microservices...

start "AI Service" cmd /k "cd services\ai-service && npm start"
start "Diagram Service" cmd /k "cd services\diagram-service && npm start"  
start "PPT Service" cmd /k "cd services\ppt-service && npm start"

timeout /t 3 /nobreak > nul

start "Frontend" cmd /k "npm run dev"

echo All services started!
pause
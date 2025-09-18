@echo off
echo Starting Architects Suite...

echo 1. Starting backend services...
start "Backend Services" cmd /k "docker-compose -f docker-compose.microservices.yml up --build"

echo 2. Waiting for services to start...
timeout /t 10 /nobreak > nul

echo 3. Starting frontend...
start "Frontend" cmd /k "npm run dev"

echo All services started!
echo Frontend: http://localhost:3000
echo AI Service: http://localhost:3001
echo Diagram Service: http://localhost:3002
echo PPT Service: http://localhost:3003

pause
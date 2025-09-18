@echo off
echo Installing dependencies...
cd services\ai-service && npm install
cd ..\diagram-service && npm install  
cd ..\ppt-service && npm install
cd ..\..

echo Starting services with Docker...
docker-compose -f docker-compose.simple.yml up --build

pause
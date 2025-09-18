@echo off
echo Starting Architects Suite with Docker...

echo Building and starting all services...
docker-compose -f docker-compose.dev.yml up --build

pause
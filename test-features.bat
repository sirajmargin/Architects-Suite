@echo off
echo Testing Architects Suite Features...

echo 1. Starting services...
docker-compose -f docker-compose.dev.yml up -d --build

echo 2. Waiting for services to start...
timeout /t 15 /nobreak > nul

echo 3. Testing service endpoints...
curl -s http://localhost:3000 > nul && echo "✓ Frontend: OK" || echo "✗ Frontend: FAILED"
curl -s http://localhost:3001 > nul && echo "✓ AI Service: OK" || echo "✗ AI Service: FAILED"
curl -s http://localhost:3002 > nul && echo "✓ Diagram Service: OK" || echo "✗ Diagram Service: FAILED"
curl -s http://localhost:3003 > nul && echo "✓ PPT Service: OK" || echo "✗ PPT Service: FAILED"

echo 4. Testing AI generation...
curl -X POST http://localhost:3001/generate -H "Content-Type: application/json" -d "{\"prompt\":\"microservices architecture\"}" > test_result.json
findstr "success" test_result.json > nul && echo "✓ AI Generation: OK" || echo "✗ AI Generation: FAILED"

echo 5. All tests completed!
echo Open http://localhost:3000 to test the UI

pause
@echo off
echo Demarrage des serveurs...

echo.
echo 1. Demarrage du serveur Laravel (Backend)...
cd "gestion-hospitaliere-backend"
start "Laravel Server" cmd /k "php artisan serve --host=127.0.0.1 --port=8000"

echo.
echo 2. Attente de 3 secondes...
timeout /t 3 /nobreak > nul

echo.
echo 3. Demarrage du serveur React (Frontend)...
cd "..\gestion-hospitaliere-frontend"
start "React Server" cmd /k "npm start"

echo.
echo Les serveurs sont en cours de demarrage...
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:3000
echo.
echo Appuyez sur une touche pour continuer...
pause > nul
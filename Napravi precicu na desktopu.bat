@echo off
chcp 65001 > nul
title Vozacki A - precica na desktopu
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "tools\napravi-precicu.ps1"
echo.
pause

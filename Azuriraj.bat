@echo off
chcp 65001 > nul
title Vozacki A - azuriranje
cd /d "%~dp0"

where git > nul 2>&1
if errorlevel 1 goto nemagit
if not exist ".git" goto nijeklon

echo Preuzimam najnoviju verziju sa GitHub-a...
echo.
git pull --ff-only
if errorlevel 1 (
  echo.
  echo Azuriranje nije uspelo. Najcesci razlog: menjao si fajlove lokalno.
  echo Resenje: preuzmi ZIP sa https://github.com/MilanMilojevic/vozacki-a
)
echo.
echo Napredak u ucenju NIJE diran - cuva se u pregledacu.
pause
exit /b

:nemagit
echo Git nije instaliran na ovom racunaru.
goto rucno

:nijeklon
echo Ova kopija nije preuzeta preko Git-a (samo je prekopirana).

:rucno
echo.
echo Rucno azuriranje:
echo   1. Otvori https://github.com/MilanMilojevic/vozacki-a
echo   2. Dugme "Code" - "Download ZIP"
echo   3. Raspakuj i prekopiraj preko ove fascikle
echo.
echo Napredak u ucenju ostaje netaknut - cuva se u pregledacu, ne u fajlovima.
echo Za svaki slucaj mozes ga izvesti dugmetom "Sacuvaj napredak (fajl)".
echo.
pause

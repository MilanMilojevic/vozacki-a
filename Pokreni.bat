@echo off
title Vozacki A
cd /d "%~dp0"
start "" http://localhost:8137
node serve.mjs

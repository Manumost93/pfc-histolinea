@echo off
setlocal

REM Ir a la raiz del repo (carpeta que contiene este script)
pushd %~dp0..

REM Iniciar backend y frontend en terminales separadas
start "HistoLinea Backend" cmd /k "scripts\run-backend.cmd"
start "HistoLinea Frontend" cmd /k "scripts\run-frontend.cmd"

popd
endlocal

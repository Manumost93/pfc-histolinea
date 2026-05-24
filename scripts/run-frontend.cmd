@echo off
setlocal

REM Ir a la raiz del repo (carpeta que contiene este script)
pushd %~dp0..

REM Instalar dependencias y arrancar frontend
cd frontend\histolinea-web
npm install
npm run dev

popd
endlocal

@echo off
setlocal

REM Ir a la raiz del repo (carpeta que contiene este script)
pushd %~dp0..

REM Si no existe la BD, no pasa nada
if exist histolinea.dev.db (
  del /f /q histolinea.dev.db
)

REM Recrear base de datos
 dotnet ef database update -p backend\src\Histolinea.Infrastructure -s backend\src\Histolinea.Api

popd
endlocal

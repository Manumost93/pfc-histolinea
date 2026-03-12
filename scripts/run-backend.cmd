@echo off
setlocal

REM Ir a la raiz del repo (carpeta que contiene este script)
pushd %~dp0..

REM Restaurar paquetes
 dotnet restore backend\Histolinea.sln

REM Aplicar migraciones EF (SQLite)
 dotnet ef database update -p backend\src\Histolinea.Infrastructure -s backend\src\Histolinea.Api

REM Ejecutar API
 dotnet run --project backend\src\Histolinea.Api

popd
endlocal

@echo off
setlocal

REM Ir a la raiz del repo (carpeta que contiene este script)
pushd %~dp0..

REM Usar dotnet instalado en Program Files cuando no esta en PATH
set "DOTNET_EXE=%ProgramFiles%\dotnet\dotnet.exe"
if exist "%DOTNET_EXE%" (
    set "DOTNET=%DOTNET_EXE%"
) else (
    set "DOTNET=dotnet"
)

REM Restaurar paquetes
"%DOTNET%" restore backend\Histolinea.sln

REM Aplicar migraciones EF (SQLite)
"%DOTNET%" ef database update -p backend\src\Histolinea.Infrastructure -s backend\src\Histolinea.Api

REM Ejecutar API
"%DOTNET%" run --project backend\src\Histolinea.Api

popd
endlocal

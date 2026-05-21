@echo off
REM Run local node bundled in ./node folder
set SCRIPT_DIR=%~dp0
"%SCRIPT_DIR%node\node.exe" %*
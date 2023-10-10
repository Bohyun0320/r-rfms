@echo off
echo [RFMS script]start DataProc script 
echo --------------remote---------------
cd PSTools
PsExec -i \\127.0.0.1 -u GEO-AI -p ai1q2w3e$R c:\R_RFMS\Process_MMS_Offline.exe %*
cd .. 
echo -----------------------------------
echo [RFMS script]finish script

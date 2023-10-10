echo [RFMS script]start DataProc script 
echo --------------remote---------------
cd PSTools
PsExec -i \\192.168.22.213 -u GEO-AI -p ai1q2w3e$R c:\R_RFMS\Process_MMS_Offline.exe %*
cd .. 
echo -----------------------------------
echo [RFMS script]finish script

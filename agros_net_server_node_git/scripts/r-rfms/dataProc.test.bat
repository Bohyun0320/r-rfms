@echo off
echo [RFMS script]start DataProc script 
echo --------------remote---------------
cd PSTools
PsExec -i \\192.168.219.113 -u ¿ì¸®Áý -p rudgns18! c:\R_RFMS\Process_MMS_Offline.exe %*
cd .. 
echo -----------------------------------
echo [RFMS script]finish script

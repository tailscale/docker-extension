@ECHO OFF

if [%1] == [where] (
    where tailscale.exe
) else if [%1] == [status] (
    %2 status --json	
) else if [%1] == [start] (
    start %2
)
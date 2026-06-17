$port = 5000
$pids = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique |
  Where-Object { $_ -and $_ -ne 0 }

if ($pids) {
  foreach ($procId in $pids) {
    try {
      Stop-Process -Id $procId -Force -ErrorAction Stop
      Write-Host "Killed PID $procId on port $port"
    } catch {
      Write-Host "Could not kill PID $procId"
    }
  }
  Start-Sleep -Milliseconds 800
} else {
  Write-Host "Port $port is free"
}

# Double-check
$remaining = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($remaining) {
  Write-Host "Warning: port $port may still be in use"
} else {
  Write-Host "Port $port ready"
}
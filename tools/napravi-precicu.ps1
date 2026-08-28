# Pravi precicu "Vozacki A" na radnoj povrsini koja pokrece Pokreni.bat
$ErrorActionPreference = 'Stop'
try {
  $koren = Split-Path -Parent $PSScriptRoot           # fascikla aplikacije (roditelj od tools\)
  $meta  = Join-Path $koren 'Pokreni.bat'
  if (-not (Test-Path $meta)) { throw "Nije pronadjen Pokreni.bat u: $koren" }

  $desktop = [Environment]::GetFolderPath('Desktop')
  $putanja = Join-Path $desktop 'Vozacki A.lnk'

  $s = (New-Object -ComObject WScript.Shell).CreateShortcut($putanja)
  $s.TargetPath        = $meta
  $s.WorkingDirectory  = $koren
  $s.IconLocation      = "$env:SystemRoot\System32\shell32.dll,14"
  $s.Description       = 'Vezbanje teorijskog ispita za A kategoriju'
  $s.Save()

  Write-Host ""
  Write-Host "Gotovo! Precica 'Vozacki A' je na radnoj povrsini." -ForegroundColor Green
} catch {
  Write-Host ""
  Write-Host "Precica nije napravljena: $($_.Exception.Message)" -ForegroundColor Yellow
  Write-Host "Rucno: desni klik na Pokreni.bat -> 'Prikazi jos opcija' -> 'Posalji na' -> 'Radna povrsina'."
}

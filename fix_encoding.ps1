$files = Get-ChildItem "C:\Users\ACER\.gemini\antigravity\scratch\upgb-promotion-exam\js\*.js"
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $content | Set-Content $file.FullName -Encoding utf8
    Write-Host "Converted $($file.Name) to UTF-8"
}

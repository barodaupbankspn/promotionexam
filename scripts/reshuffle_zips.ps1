$destDir = "C:\Users\ACER\.gemini\antigravity\scratch\upgb-promotion-exam\circulars"
$tempDir = Join-Path $destDir "temp_reshuffle"

# Create temp dir
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

# 1. Unzip ALL existing parts
$zipFiles = Get-ChildItem -Path $destDir -Filter "circulars_backup_part*.zip"
foreach ($zip in $zipFiles) {
    Write-Host "Extracting $($zip.Name)..."
    Expand-Archive -Path $zip.FullName -DestinationPath $tempDir -Force
    Remove-Item $zip.FullName -Force # Remove old zip
}

# 2. Re-zip into 5MB chunks
$files = Get-ChildItem -Path $tempDir -Recurse | Where-Object { ! $_.PSIsContainer } | Sort-Object Length -Descending

$part = 1
$currentSize = 0
$maxSize = 4.5MB # Safe margin below 5MB
$filesInPart = @()

foreach ($file in $files) {
    if (($currentSize + $file.Length) -gt $maxSize -and $filesInPart.Count -gt 0) {
        # Zip current batch
        $zipName = Join-Path $destDir "circulars_backup_part${part}.zip"
        Write-Host "Creating $zipName..."
        Compress-Archive -Path $filesInPart.FullName -DestinationPath $zipName -Force
        
        # Reset
        $part++
        $currentSize = 0
        $filesInPart = @()
    }
    
    $filesInPart += $file
    $currentSize += $file.Length
}

# Zip last batch
if ($filesInPart.Count -gt 0) {
    $zipName = Join-Path $destDir "circulars_backup_part${part}.zip"
    Write-Host "Creating $zipName..."
    Compress-Archive -Path $filesInPart.FullName -DestinationPath $zipName -Force
}

# Cleanup
Remove-Item -Path $tempDir -Recurse -Force
Write-Host "Done. Reshuffled into $part parts."

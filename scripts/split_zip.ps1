$sourceZip = "C:\Users\ACER\.gemini\antigravity\scratch\upgb-promotion-exam\circulars\circulars_backup.zip"
$destDir = "C:\Users\ACER\.gemini\antigravity\scratch\upgb-promotion-exam\circulars"
$tempDir = Join-Path $destDir "temp_extract"

# Create temp dir
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

# Extract
Expand-Archive -Path $sourceZip -DestinationPath $tempDir -Force

# Get files
$files = Get-ChildItem -Path $tempDir | Sort-Object Length -Descending
$part = 1
$currentSize = 0
$maxSize = 19MB 
$filesInPart = @()

foreach ($file in $files) {
    if (($currentSize + $file.Length) -gt $maxSize) {
        # Zip current batch
        $zipName = Join-Path $destDir "circulars_backup_part${part}.zip"
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
    Compress-Archive -Path $filesInPart.FullName -DestinationPath $zipName -Force
}

# Cleanup
Remove-Item -Path $tempDir -Recurse -Force
Remove-Item -Path $sourceZip -Force
Write-Host "Done. Created $part backup parts."

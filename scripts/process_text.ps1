$inputFile = "C:\Users\ACER\.gemini\antigravity\scratch\unused_circulars_backup\circulars_text.txt"
$outputFile = "C:\Users\ACER\.gemini\antigravity\scratch\upgb-promotion-exam\js\study_data.js"

$content = Get-Content -Path $inputFile -Raw -Encoding UTF8

# Define Chapter Titles to look for
$chapterTitles = @(
    "RETAIL LOAN SCHEMES",
    "CREDIT MONITORING",
    "BUSINESS CONTINUITY POLICY",
    "SALES & MARKETING",
    "WEALTH MANAGEMENT",
    "OTHER POLICIES",
    "OUTSOURCING POLICY FOR IT & CASH REMITTANCE",
    "GOVERNMENT BUSINESS & FINANCIAL INCLUSION",
    "PREVENTION, DESTRUCTION AND DOCUMENT HANDLING",
    "RETAIL LIABILITIES",
    "HR POLICIES- POSH & WHISTLEBLOWER",
    "MSME",
    "COMPLIANCE",
    "AUDIT & INSPECTION",
    "NPA MANAGEMNET", 
    "RISK MANAGEMENT",
    "PRIORITY SECTOR",
    "VIGILANCE",
    "EMERGING TRENDS IN BANKING",
    "BANKING TECHNOLOGY",
    "AWARENESS ABOUT BANKING",
    "LEGAL & STATUTORY PROVISIONS",
    "TEST YOUR KNOWLEDGE",
    "ANSWERS"
)

$chapters = @()
$currentChapter = @{
    id = "intro"
    title = "Introduction / Index"
    content = ""
}

# Split content by lines for easier processing
$lines = $content -split "`r?`n"
$foundFirst = $false

foreach ($line in $lines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    
    $trimmed = $line.Trim()
    $isTitle = $false
    
    foreach ($title in $chapterTitles) {
        if ($trimmed -like "*$title*") {
            $isTitle = $true
            # Start new chapter
            # Heuristic: Don't trigger on the Index page (lines 0-100 roughly)
            # We can check if we have already captured some content or if we are past a certain point
            # For simplicity, we assume titles in the body are what we want.
            # To avoid the Index, we can just skip the first occurrence if it's close to start?
            # Or just let it be. The Index listing itself is fine.
            # Better: The 'Index' section lists them with numbers. The headers in text are standalone.
            
            if ($chapters.Count -eq 0 -and -not $foundFirst) {
                 # First time? Might be index.
                 # Let's just create a new chapter whenever we see a title that matches exactly or close
            }
            
            # Simple Logic: If line is mostly just the title
            if ($trimmed.Length -lt ($title.Length + 10)) {
                if ($currentChapter.content.Length -gt 100) {
                    $chapters += $currentChapter
                }
                $currentChapter = @{
                    id = ($chapters.Count + 1)
                    title = $trimmed
                    content = ""
                }
                $foundFirst = $true
                break 
            }
        }
    }
    
    $currentChapter.content += "$trimmed <br> "
}

# Add last
$chapters += $currentChapter

# Serialize to JSON
# PowerShell's ConvertTo-Json can be finite with depth, but for this flat structure it is fine.
$json = $chapters | ConvertTo-Json -Depth 3 -Compress

# Wrap in JS
$jsContent = "window.studyMaterial = $json;"
Set-Content -Path $outputFile -Value $jsContent -Encoding UTF8

Write-Host "Processed $($chapters.Count) chapters."

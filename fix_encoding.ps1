$path = 'C:\Users\ACER\.gemini\antigravity\scratch\upgb-promotion-exam\js\questions.js'
$content = Get-Content $path -Raw -Encoding UTF8

# Replacements
$content = $content.Replace('â€¦', '...')
$content = $content.Replace('â€™', "'")
$content = $content.Replace('â€“', "-")
$content = $content.Replace('â€œ', '"')
$content = $content.Replace('â€', '"') # Covering closing quote if detected as just â€ in some encodings, but mostly â€” is emdash
$content = $content.Replace('â€˜', "'")

# Additional cleanup if needed
$content = $content.Replace('â€¦.', '....')

Set-Content $path -Value $content -Encoding UTF8
Write-Host "Fixed encoding issues in questions.js"

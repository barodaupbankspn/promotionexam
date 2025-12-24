$content = Get-Content 'C:\Users\ACER\.gemini\antigravity\scratch\upgb-promotion-exam\circulars\circulars_text.txt' -Encoding UTF8
$questions = @()
$answers = @{}

$capturingQuestions = $false
$capturingAnswers = $false

foreach ($line in $content) {
    if ($line -match 'Test Your Knowledge') {
        $capturingQuestions = $true
        $capturingAnswers = $false
        continue
    }
    if ($line -match 'ANSWERS' -and $capturingQuestions) {
        $capturingQuestions = $false
        $capturingAnswers = $true
        continue
    }

    if ($line -match '^(\d+)\.\s+(.*)') {
        $id = [int]$matches[1]
        $text = $matches[2]

        if ($capturingQuestions) {
            $questions += [PSCustomObject]@{
                id = $id
                question = $text
                answer = ""
            }
        } elseif ($capturingAnswers) {
            $answers[$id] = $text
        }
    } elseif ($capturingQuestions -and $questions.Count -gt 0 -and $line.Trim().Length -gt 0 -and $line -notmatch '^\d+$') {
         # Continuation of question text
         $questions[-1].question += " " + $line.Trim()
    }
}

# Combine
$finalList = @()
foreach ($q in $questions) {
    $ans = $answers[$q.id]
    if (-not $ans) { $ans = "Answer Key Missing" }
    
    $finalList += [PSCustomObject]@{
        id = $q.id
        question = $q.question
        answer = $ans
    }
}

# Convert to JSON lines manually to avoid external dependency issues if any, or just strictly format
$jsonParts = @()
foreach ($item in $finalList) {
    $q = $item.question -replace '"', '\"'
    $a = $item.answer -replace '"', '\"'
    $jsonParts += "{`"id`": $($item.id), `"question`": `"$q`", `"answer`": `"$a`"}"
}

$jsonString = "[" + ($jsonParts -join ",") + "]"
$jsContent = "window.examQuestions = $jsonString;"

$jsContent | Set-Content 'C:\Users\ACER\.gemini\antigravity\scratch\upgb-promotion-exam\js\questions.js' -Encoding UTF8

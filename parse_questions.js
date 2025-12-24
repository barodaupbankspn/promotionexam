const fs = require('fs');

try {
    const data = fs.readFileSync('C:/Users/ACER/.gemini/antigravity/scratch/upgb-promotion-exam/circulars/circulars_text.txt', 'utf8');
    const lines = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    const questions = [];
    const answers = {};

    let capturingQuestions = false;
    let capturingAnswers = false;

    // Regex to match "1. Question text" or "1. Answer text"
    const itemRegex = /^(\d+)\.\s+(.*)/;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Detect Start of Questions
        if (line.includes('Test Your Knowledge')) {
            capturingQuestions = true;
            capturingAnswers = false;
            continue;
        }

        // Detect Start of Answers
        if (line.includes('ANSWERS')) {
            capturingQuestions = false;
            capturingAnswers = true;
            continue;
        }

        const match = line.match(itemRegex);

        if (match) {
            const id = parseInt(match[1]);
            const text = match[2];

            if (capturingQuestions) {
                // If the previous line was also part of a question (multiline question), append it?
                // The regex handles the start. If a line doesn't match regex but we are in capturing mode, it might be continuation.
                // For simplicity, assuming one-liners or primary line starts with number.
                questions.push({ id, question: text });
            } else if (capturingAnswers) {
                answers[id] = text;
            }
        } else if (capturingQuestions && questions.length > 0) {
            // Append to last question if it looks like continuation and doesn't start with number
            // (Simple heuristic: if it contains words and not just numbers)
            if (!line.match(/^\d+$/) && !line.includes('111794')) {
                questions[questions.length - 1].question += " " + line;
            }
        }
    }

    // Merge Questions and Answers
    const combined = questions.map(q => ({
        id: q.id,
        question: q.question,
        answer: answers[q.id] || "Answer not found"
    }));

    // Output to JS file
    const outputContent = `window.examQuestions = ${JSON.stringify(combined, null, 4)};`;

    fs.writeFileSync('C:/Users/ACER/.gemini/antigravity/scratch/upgb-promotion-exam/js/questions.js', outputContent);
    console.log(`Successfully parsed ${combined.length} questions.`);

} catch (err) {
    console.error("Error parsing file:", err);
}

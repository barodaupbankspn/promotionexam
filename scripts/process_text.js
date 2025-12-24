const fs = require('fs');

const inputFile = 'C:/Users/ACER/.gemini/antigravity/scratch/upgb-promotion-exam/circulars/circulars_text.txt';
const outputFile = 'C:/Users/ACER/.gemini/antigravity/scratch/upgb-promotion-exam/js/study_data.js';

try {
    const data = fs.readFileSync(inputFile, 'utf8');
    const lines = data.split('\n').map(line => line.trim());

    const chapters = [];
    let currentChapter = {
        id: 'intro',
        title: 'Introduction / Index',
        content: ''
    };

    // Hardcoded chapters based on the Index in file (simplified for reliability)
    const chapterTitles = [
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
        "NPA MANAGEMNET", // Note spelling in source
        "RISK MANAGEMENT",
        "PRIORITY SECTOR", // partial match
        "VIGILANCE",
        "EMERGING TRENDS IN BANKING",
        "BANKING TECHNOLOGY",
        "AWARENESS ABOUT BANKING",
        "LEGAL & STATUTORY PROVISIONS",
        "TEST YOUR KNOWLEDGE",
        "ANSWERS"
    ];

    let foundFirstChapter = false;

    // Helper to check if a line looks like a chapter title
    function isChapterTitle(line) {
        // Remove common OCR noise or page numbers if strictly matching
        // But for now, simple includes check
        const normalized = line.toUpperCase();
        return chapterTitles.find(t => normalized.includes(t) && line.length < 100);
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;

        const matchedTitle = isChapterTitle(line);

        // Heuristic: If we find a chapter title, and we haven't seen it recently (avoid repeating headers on pages)
        // This is tricky with raw text. 
        // Better approach: The Index is at the start. We should skip the index first.
        // The text content starts after the index. 
        // Let's just dump everything into a "Full Study Material" if segmentation is too hard, 
        // BUT let's try to detect the start of "RETAIL LOAN SCHEMES".

        if (matchedTitle && i > 100) { // arbitrary skip for Index
            // Start new chapter
            if (currentChapter.content.length > 50) { // avoid empty chapters
                chapters.push(currentChapter);
            }
            currentChapter = {
                id: chapters.length + 1,
                title: matchedTitle,
                content: ''
            };
            foundFirstChapter = true;
        }

        currentChapter.content += line + '<br>';
    }

    // Push last chapter
    if (currentChapter.content.length > 0) {
        chapters.push(currentChapter);
    }

    // Convert to JS file format
    const jsContent = `window.studyMaterial = ${JSON.stringify(chapters, null, 4)};`;
    fs.writeFileSync(outputFile, jsContent);
    console.log(`Successfully processed ${chapters.length} chapters.`);

} catch (err) {
    console.error("Error processing text:", err);
}

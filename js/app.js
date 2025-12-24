// Main App Logic - Mock Test Edition
const App = {
    allQuestions: [],
    currentExamQuestions: [],
    currentIndex: 0,
    userAnswers: {}, // Stores questionId: selectedOption

    init: function () {
        if (window.examQuestions && window.examQuestions.length > 0) {
            this.allQuestions = window.examQuestions;
            this.renderHome();
        } else {
            console.error("Questions not loaded.");
            document.getElementById('loading').innerHTML = "<h2>Error loading questions.</h2>";
        }
    },

    renderHome: function () {
        const container = document.getElementById('app-container');
        document.getElementById('status-bar').style.display = 'none';

        container.innerHTML = `
            <div class="card fade-in">
                <h2>Welcome to PromExe 2025 Prep</h2>
                <div class="welcome-text">
                    <p>Based on the latest circulars and study material.</p>
                    <p><strong>${this.allQuestions.length}</strong> Total Questions in Bank</p>
                </div>
                <div class="btn-group" style="justify-content: center; flex-direction: column; gap: 1rem;">
                    <button class="start-btn" onclick="App.startMockTest()">Start Mock Test (20 Qs)</button>
                    <button class="btn btn-nav" onclick="App.renderCirculars()" style="background:var(--secondary-color);">Study Material / Circulars</button>
                    <!-- <button class="btn btn-nav" onclick="App.startPracticeMode()">Practice All Questions</button> -->
                </div>
            </div>
        `;
    },

    renderCirculars: function () {
        const container = document.getElementById('app-container');
        container.innerHTML = `
            <div class="card fade-in" style="max-width: 900px; text-align: left;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                    <h2>Study Material / Circulars</h2>
                    <button class="btn btn-nav" onclick="App.renderHome()">Back</button>
                </div>
                <div id="circular-list-container"></div>
            </div>
        `;
        if (window.circularsApp) {
            window.circularsApp.render();
        }
    },

    startMockTest: function () {
        // Select 20 random unique questions
        const shuffled = [...this.allQuestions].sort(() => 0.5 - Math.random());
        this.currentExamQuestions = shuffled.slice(0, 20).map(q => {
            return {
                ...q,
                options: this.generateOptions(q)
            };
        });

        this.currentIndex = 0;
        this.userAnswers = {};

        document.getElementById('status-bar').style.display = 'block';
        document.getElementById('q-total').innerText = 20;
        this.renderQuestion();
    },

    generateOptions: function (correctQ) {
        // 1. Identify Answer Type
        const type = this.detectType(correctQ.answer);

        // 2. Filter available distractors of the SAME type
        const similarQuestions = this.allQuestions.filter(q =>
            q.id !== correctQ.id &&
            q.answer !== correctQ.answer &&
            this.detectType(q.answer) === type
        );

        const distractors = new Set();

        // 3. Try to fill with similar types first
        while (distractors.size < 3 && similarQuestions.length > 0) {
            const randomIndex = Math.floor(Math.random() * similarQuestions.length);
            const picked = similarQuestions[randomIndex].answer;
            distractors.add(picked);
            // Remove to avoid picking again (though Set handles dups, this avoids wasted loops)
            similarQuestions.splice(randomIndex, 1);
        }

        // 4. Fallback: If not enough similar types, pick randoms (General Pool)
        if (distractors.size < 3) {
            const remaining = this.allQuestions.filter(q => q.id !== correctQ.id && q.answer !== correctQ.answer);
            while (distractors.size < 3) {
                const randomQ = remaining[Math.floor(Math.random() * remaining.length)];
                if (!distractors.has(randomQ.answer)) {
                    distractors.add(randomQ.answer);
                }
            }
        }

        const options = [correctQ.answer, ...distractors];

        // Shuffle Options
        return options.sort(() => 0.5 - Math.random());
    },

    detectType: function (text) {
        if (!text) return 'generic';
        const t = text.toLowerCase();

        // Percentages
        if (t.includes('%')) return 'percent';

        // Amounts / Currency
        if (t.includes('rs') || t.includes('lakh') || t.includes('crore') || t.includes('cr') || /^\d+(\.\d+)?$/.test(t)) return 'amount';

        // Time / Duration
        if (t.includes('day') || t.includes('month') || t.includes('year')) return 'time';

        // Acts / Sections / Laws
        if (t.includes('act') || t.includes('section') || t.includes('law')) return 'act';

        // Ratios
        if (t.includes(':')) return 'ratio';

        return 'generic';
    },

    renderQuestion: function () {
        const q = this.currentExamQuestions[this.currentIndex];
        const container = document.getElementById('app-container');

        document.getElementById('q-current').innerText = this.currentIndex + 1;

        const savedAnswer = this.userAnswers[q.id];

        let optionsHTML = '';
        q.options.forEach((opt, idx) => {
            const isChecked = savedAnswer === opt ? 'checked' : '';
            optionsHTML += `
                <label class="option-label">
                    <input type="radio" name="option" value="${opt}" onclick="App.selectOption(${q.id}, '${opt.replace(/'/g, "\\'")}')" ${isChecked}>
                    <span class="option-text">${opt}</span>
                </label>
            `;
        });

        container.innerHTML = `
            <div class="card">
                <div class="question-header">
                    <span>Question ${this.currentIndex + 1} of 20</span>
                </div>
                
                <div class="question-text">
                    ${q.question}
                </div>

                <div class="options-container" style="text-align:left; display:flex; flex-direction:column; gap:0.8rem;">
                    ${optionsHTML}
                </div>

                <div class="btn-group">
                    <button class="btn btn-nav" onclick="App.prevQuestion()" ${this.currentIndex === 0 ? 'disabled' : ''}>Previous</button>
                    ${this.currentIndex === 19
                ? `<button class="btn btn-reveal" style="background-color: var(--success);" onclick="App.submitExam()">Submit Exam</button>`
                : `<button class="btn btn-nav" onclick="App.nextQuestion()">Next</button>`
            }
                </div>
            </div>
        `;
    },

    selectOption: function (qId, answer) {
        this.userAnswers[qId] = answer;
    },

    nextQuestion: function () {
        if (this.currentIndex < 19) {
            this.currentIndex++;
            this.renderQuestion();
        }
    },

    prevQuestion: function () {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.renderQuestion();
        }
    },

    submitExam: function () {
        if (!confirm("Are you sure you want to submit your exam?")) return;

        let score = 0;
        let resultHTML = '';

        this.currentExamQuestions.forEach((q, index) => {
            const userAnswer = this.userAnswers[q.id];
            const isCorrect = userAnswer === q.answer;

            if (isCorrect) score++;

            resultHTML += `
                <div class="result-item ${isCorrect ? 'correct' : 'incorrect'}" style="text-align:left; border-bottom:1px solid #eee; padding:1rem 0;">
                    <div style="font-weight:bold; color:#555;">Q${index + 1}: ${q.question}</div>
                    <div style="margin-top:0.5rem;">
                        <span style="color: ${isCorrect ? 'green' : 'red'};">Your Answer: ${userAnswer || 'Not Attempted'}</span>
                    </div>
                    ${!isCorrect ? `<div style="color:green; font-weight:bold;">Correct Answer: ${q.answer}</div>` : ''}
                </div>
            `;
        });

        const percentage = (score / 20) * 100;
        const container = document.getElementById('app-container');
        document.getElementById('status-bar').style.display = 'none';

        container.innerHTML = `
            <div class="card result-card">
                <h2>Exam Result</h2>
                <div class="score-circle">
                    ${score} / 20
                </div>
                <h3>${percentage}% Score</h3>
                <div style="margin-top:2rem; max-height:400px; overflow-y:auto; border:1px solid #ddd; padding:1rem; border-radius:8px;">
                    ${resultHTML}
                </div>
                <div style="margin-top:2rem;">
                    <button class="start-btn" onclick="App.renderHome()">Back to Home</button>
                </div>
            </div>
        `;
    }
};

window.onload = function () {
    App.init();
};

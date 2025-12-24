window.examApp = {
    questions: [],
    currentQuestionIndex: 0,
    userAnswers: {}, // Format: { questionId: selectedOptionIndex }
    timerInterval: null,
    totalTime: 600, // 10 minutes in seconds
    currentTime: 600,

    init: function () {
        this.cacheDom();
        this.bindEvents();

        // Load questions from global scope (loaded via script tag)
        if (window.examQuestions) {
            this.questions = window.examQuestions;
        }
    },

    cacheDom: function () {
        this.dom = {
            intro: document.getElementById('exam-intro'),
            interface: document.getElementById('exam-interface'),
            result: document.getElementById('exam-result'),
            startBtn: document.getElementById('start-exam-btn'),
            questionText: document.getElementById('question-text'),
            optionsContainer: document.getElementById('options-container'),
            prevBtn: document.getElementById('prev-btn'),
            nextBtn: document.getElementById('next-btn'),
            submitBtn: document.getElementById('submit-btn'),
            currentQNum: document.getElementById('current-q-num'),
            totalQNum: document.getElementById('total-q-num'),
            timer: document.getElementById('timer'),
            scoreDisplay: document.getElementById('score-display')
        };
    },

    bindEvents: function () {
        this.dom.startBtn.addEventListener('click', () => this.startExam());
        this.dom.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.dom.prevBtn.addEventListener('click', () => this.prevQuestion());
        this.dom.submitBtn.addEventListener('click', () => this.finishExam());
    },

    startExam: function () {
        this.dom.intro.classList.add('hidden');
        this.dom.result.classList.add('hidden');
        this.dom.interface.classList.remove('hidden');
        this.dom.interface.style.display = 'block'; // Ensure block display

        // Randomize Questions
        this.questions = this.shuffleArray([...window.examQuestions]).slice(0, 10); // Take random 10

        this.currentQuestionIndex = 0;
        this.userAnswers = {};
        this.currentTime = this.totalTime;

        this.dom.totalQNum.textContent = this.questions.length;

        this.startTimer();
        this.renderQuestion();
    },

    shuffleArray: function (array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    startTimer: function () {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.updateTimerDisplay();
        this.timerInterval = setInterval(() => {
            this.currentTime--;
            this.updateTimerDisplay();
            if (this.currentTime <= 0) {
                this.finishExam();
            }
        }, 1000);
    },

    updateTimerDisplay: function () {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        this.dom.timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (this.currentTime < 60) {
            this.dom.timer.style.color = 'var(--danger)';
        } else {
            this.dom.timer.style.color = 'var(--primary-color)';
        }
    },

    renderQuestion: function () {
        const q = this.questions[this.currentQuestionIndex];
        this.dom.currentQNum.textContent = this.currentQuestionIndex + 1;
        this.dom.questionText.textContent = q.question;

        this.dom.optionsContainer.innerHTML = '';
        q.options.forEach((opt, index) => {
            const btn = document.createElement('div');
            btn.className = 'option-btn';
            btn.textContent = opt;
            if (this.userAnswers[q.id] === index) {
                btn.classList.add('selected');
            }
            btn.addEventListener('click', () => this.selectOption(index));
            this.dom.optionsContainer.appendChild(btn);
        });

        // Button States
        this.dom.prevBtn.disabled = this.currentQuestionIndex === 0;
        if (this.currentQuestionIndex === this.questions.length - 1) {
            this.dom.nextBtn.classList.add('hidden');
            this.dom.submitBtn.classList.remove('hidden');
        } else {
            this.dom.nextBtn.classList.remove('hidden');
            this.dom.submitBtn.classList.add('hidden');
        }
    },

    selectOption: function (index) {
        const qId = this.questions[this.currentQuestionIndex].id;
        this.userAnswers[qId] = index;
        this.renderQuestion(); // Re-render to show selection
    },

    nextQuestion: function () {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.renderQuestion();
        }
    },

    prevQuestion: function () {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.renderQuestion();
        }
    },

    finishExam: function () {
        clearInterval(this.timerInterval);
        this.dom.interface.classList.add('hidden');
        this.calculateScore();
        this.dom.result.classList.remove('hidden');
        this.renderReview();
    },

    calculateScore: function () {
        let score = 0;
        this.questions.forEach(q => {
            if (this.userAnswers[q.id] === q.correctIndex) {
                score++;
            }
        });

        this.dom.scoreDisplay.textContent = `${score}/${this.questions.length}`;
    },

    renderReview: function () {
        const container = document.getElementById('review-container');
        if (!container) return; // Should be added to HTML

        let html = '<div style="text-align: left; margin-top: 2rem;"><h3>Review Answers</h3>';

        this.questions.forEach((q, idx) => {
            const userAnsIdx = this.userAnswers[q.id];
            const isCorrect = userAnsIdx === q.correctIndex;
            const correctOpt = q.options[q.correctIndex];
            const userOpt = userAnsIdx !== undefined ? q.options[userAnsIdx] : 'Skipped';

            const statusColor = isCorrect ? 'var(--success)' : 'var(--danger)';
            const icon = isCorrect ? '✓' : '✗';

            html += `
                <div style="background: #f8fafc; padding: 1rem; margin-bottom: 1rem; border-radius: 0.5rem; border-left: 4px solid ${statusColor}">
                    <p style="font-weight: 600; margin-bottom: 0.5rem;">${idx + 1}. ${q.question}</p>
                    <p style="font-size: 0.9rem; color: var(--text-muted);">Your Answer: <span style="font-weight: 500; color: ${statusColor}">${userOpt} ${icon}</span></p>
                    ${!isCorrect ? `<p style="font-size: 0.9rem; color: var(--success);">Correct Answer: <strong>${correctOpt}</strong></p>` : ''}
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    }
};

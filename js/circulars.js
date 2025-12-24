window.circularsApp = {
    init: function () {
        this.renderList();
    },

    renderList: function () {
        const container = document.getElementById('circular-list-container');
        if (!container) return;

        if (!window.studyMaterial || window.studyMaterial.length === 0) {
            container.innerHTML = "<p>No study material loaded.</p>";
            return;
        }

        container.innerHTML = window.studyMaterial.map((item, index) => `
            <div class="circular-item" onclick="window.circularsApp.openChapter(${index})">
                <div class="circular-header">
                    <div class="circular-title">${item.title}</div>
                    <div class="circular-date">Chapter ${index + 1}</div>
                </div>
                <div class="circular-summary">Click to read full content...</div>
            </div>
        `).join('');
    },

    openChapter: function (index) {
        const item = window.studyMaterial[index];
        const container = document.getElementById('app-container');

        container.innerHTML = `
            <div class="card fade-in" style="max-width: 900px; text-align: left;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid #eee; padding-bottom:0.5rem;">
                    <h2>${item.title}</h2>
                    <button class="btn btn-nav" onclick="App.renderCirculars()">Back to List</button>
                </div>
                <div class="study-content" style="max-height: 70vh; overflow-y: auto; line-height: 1.6; font-size: 1.1rem; white-space: pre-wrap;">
                    ${item.content}
                </div>
            </div>
        `;
    }
};

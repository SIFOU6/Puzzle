// بيانات الألغاز
const puzzles = [
    {
        id: 1,
        title: "ترتيب الأرقام",
        stages: [
            {initialOrder: [2,3,6,1,4,8,7,5], solution: [1,2,3,4,5,6,7,8]},
            {initialOrder: [3,1,2,4,5,6,8,7], solution: [1,2,3,4,5,6,7,8]}
        ]
    },
    {
        id: 2,
        title: "الرياضيات",
        stages: [
            {question: "5 + 7 = ?", solution: "12"},
            {question: "9 × 6 = ?", solution: "54"}
        ]
    }
];

// العناصر
const el = id => document.getElementById(id);
const views = ['main-menu','username-section','puzzle-section','history-section'];
const state = {
    currentPuzzle: 0,
    currentStage: 0,
    username: '',
    history: JSON.parse(localStorage.getItem('history')) || []
};

// تهيئة اللعبة
function init() {
    el('start-game').onclick = () => showView('username-section');
    el('view-history').onclick = showHistory;
    el('start-puzzle').onclick = startGame;
    el('next-stage').onclick = nextStage;
    el('clear-all-history').onclick = clearHistory;
    el('back-to-main-from-name').onclick = 
    el('back-to-main-from-game').onclick = 
    el('back-to-main-from-history').onclick = () => showView('main-menu');
}

// عرض الواجهة
function showView(view) {
    views.forEach(v => el(v).style.display = v === view ? 'block' : 'none');
}

// بدء اللعبة
function startGame() {
    state.username = el('username').value.trim();
    if (!state.username) return alert('أدخل اسمك');
    state.currentPuzzle = 0;
    state.currentStage = 0;
    showView('puzzle-section');
    loadPuzzle();
}

// تحميل اللغز
function loadPuzzle() {
    const puzzle = puzzles[state.currentPuzzle];
    const stage = puzzle.stages[state.currentStage];
    
    el('puzzle-title').textContent = puzzle.title;
    el('puzzle-content').innerHTML = '';
    el('puzzle-feedback').textContent = '';
    el('next-stage').style.display = 'none';

    if (puzzle.id === 1) {
        renderGrid(stage);
    } else {
        renderMath(stage);
    }
}

// عرض شبكة الأرقام
function renderGrid(stage) {
    const tiles = [...stage.initialOrder, null];
    let emptyIndex = 8;
    const grid = document.createElement('div');
    grid.className = 'puzzle-grid';

    tiles.forEach((tile, i) => {
        const tileEl = document.createElement('div');
        tileEl.className = tile ? 'puzzle-tile' : 'puzzle-tile empty';
        tileEl.textContent = tile || '';
        if (tile) {
            tileEl.onclick = () => {
                const adj = [i-3,i+3,i-1,i+1].filter(x=>x>=0&&x<9);
                if (adj.includes(emptyIndex)) {
                    [tiles[i], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[i]];
                    emptyIndex = i;
                    renderTiles(grid, tiles);
                    if (tiles.slice(0,8).every((n,j)=>n===stage.solution[j])) {
                        el('puzzle-feedback').textContent = '✅ صحيح';
                        el('next-stage').style.display = 'block';
                        saveHistory(true);
                    }
                }
            };
        }
        grid.appendChild(tileEl);
    });
    el('puzzle-content').appendChild(grid);
}

// عرض مسألة رياضية
function renderMath(stage) {
    el('puzzle-description').textContent = stage.question;
    const input = document.createElement('input');
    input.type = 'text';
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = 'تحقق';
    btn.onclick = () => {
        if (input.value.trim() === stage.solution) {
            el('puzzle-feedback').textContent = '✅ صحيح';
            el('next-stage').style.display = 'block';
            saveHistory(true);
        } else {
            el('puzzle-feedback').textContent = '❌ خطأ';
            saveHistory(false);
        }
    };
    el('puzzle-content').append(input, btn);
}

// المرحلة التالية
function nextStage() {
    const puzzle = puzzles[state.currentPuzzle];
    if (state.currentStage < puzzle.stages.length - 1) {
        state.currentStage++;
        loadPuzzle();
    } else if (state.currentPuzzle < puzzles.length - 1) {
        state.currentPuzzle++;
        state.currentStage = 0;
        loadPuzzle();
    } else {
        alert('انتهت الألعاب!');
        showView('main-menu');
    }
}

// حفظ السجل
function saveHistory(success) {
    state.history.push({
        username: state.username,
        puzzle: puzzles[state.currentPuzzle].title,
        stage: state.currentStage + 1,
        success,
        date: new Date().toLocaleDateString()
    });
    localStorage.setItem('history', JSON.stringify(state.history));
}

// عرض السجل
function showHistory() {
    showView('history-section');
    el('history-list').innerHTML = state.history.map((h,i) => `
        <div class="history-item">
            <button class="delete-item" onclick="deleteRecord(${i})">🗑️</button>
            <div>
                <h3>${h.username}</h3>
                <p>${h.puzzle} - المرحلة ${h.stage}</p>
                <p>${h.success ? '✅ تم' : '❌ لم يتم'}</p>
                <p>${h.date}</p>
            </div>
        </div>
    `).join('');
}

// حذف السجل
function deleteRecord(i) {
    state.history.splice(i, 1);
    localStorage.setItem('history', JSON.stringify(state.history));
    showHistory();
}

function clearHistory() {
    if (confirm('حذف السجل بالكامل؟')) {
        state.history = [];
        localStorage.removeItem('history');
        showHistory();
    }
}

// بدء التطبيق
window.onload = init;
window.deleteRecord = deleteRecord;

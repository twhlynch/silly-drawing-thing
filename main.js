// #region elements
const canvas = document.getElementById('canvas');
const canvasLower = document.getElementById('canvas-lower');
const canvasPreview = document.getElementById('canvas-preview');
const colorPrimaryElement = document.getElementById('color-primary');
const colorSecondaryElement = document.getElementById('color-secondary');
const radiusElement = document.getElementById('radius');
const offsetElement = document.getElementById('offset');
const resetButton = document.getElementById('reset');
const undoButton = document.getElementById('undo');
const redoButton = document.getElementById('redo');
const randomButton = document.getElementById('random');

const ctx = canvas.getContext('2d');
const ctxLower = canvasLower.getContext('2d');
const ctxPreview = canvasPreview.getContext('2d');

// #region intit
let history = [];
let currentHistoryIndex = -1;
isDrawing = false;
let previousX;
let previousY;

let colorPrimary = colorPrimaryElement.value;
let colorSecondary = colorSecondaryElement.value;
let radius = parseInt(radiusElement.value);
let offset = parseInt(offsetElement.value);

canvas.width = canvas.offsetWidth * 2;
canvas.height = canvas.offsetHeight * 2;
canvasLower.width = canvasLower.offsetWidth * 2;
canvasLower.height = canvasLower.offsetHeight * 2;
canvasPreview.width = 1000;
canvasPreview.height = 1000;
ctx.lineWidth = radius;
ctxLower.lineWidth = radius + offset;

ctx.lineCap = 'round';
ctxLower.lineCap = 'round';
ctxPreview.lineCap = 'round';
ctx.strokeStyle = colorPrimary;
ctxLower.strokeStyle = colorSecondary;

document.documentElement.style.setProperty('--color-primary', colorPrimary);
document.documentElement.style.setProperty('--color-secondary', colorSecondary);

// #region functions
function addHistory(action) {
    currentHistoryIndex++;
    history = history.slice(0, currentHistoryIndex);
    history.push(action);
}
function resetCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctxLower.clearRect(0, 0, canvasLower.width, canvasLower.height);
}
function reloadHistory() {
    resetCanvas();
    if (currentHistoryIndex >= 0) {
        for (let i = 0; i <= currentHistoryIndex; i++) {
            const action = history[i];
            if (action.action == "draw") {
                ctx.strokeStyle = action.colorPrimary;
                ctxLower.strokeStyle = action.colorSecondary;
                ctx.lineWidth = action.radius;
                ctxLower.lineWidth = action.radius + action.offset;
                drawLine(action.x, action.y, action.previousX, action.previousY);
            } else if (action.action == "clear") {
                resetCanvas();
            }
        }
        ctx.lineWidth = radius;
        ctxLower.lineWidth = radius + offset;
        ctx.strokeStyle = colorPrimary;
        ctxLower.strokeStyle = colorSecondary;
    }
}
function drawPreview() {
    ctxPreview.clearRect(0, 0, canvasPreview.width, canvasPreview.height);

    ctxPreview.strokeStyle = colorSecondary;
    ctxPreview.lineWidth = (radius + offset) * 10;

    ctxPreview.beginPath();
    ctxPreview.moveTo(500, 500);
    ctxPreview.lineTo(500, 500);
    ctxPreview.stroke();

    ctxPreview.strokeStyle = colorPrimary;
    ctxPreview.lineWidth = radius * 10;

    ctxPreview.beginPath();
    ctxPreview.moveTo(500, 500);
    ctxPreview.lineTo(500, 500);
    ctxPreview.stroke();
}
function colorPage() {
    document.documentElement.style.setProperty('--color-primary', colorPrimary);
    document.documentElement.style.setProperty('--color-secondary', colorSecondary);
}
function randomHex() {
    return Math.floor(Math.random()*16).toString(16);
}

// #region unused
function getLastDraw() {
    let index = 0;
    while (index < history.length && !history[history.length - 1 - index].action != 'draw') index++;
    return index == history.length ? {} : history[history.length - 1 - index];
}
function invertHex(color) {
    let invertedColor = "#";

    let parts = [
        color.substring(1, 3), 
        color.substring(3, 5), 
        color.substring(5, 7)
    ];

    parts.forEach(part => {
        let invertedPart = (255 - parseInt(part, 16)).toString(16);
        if (invertedPart.length == 1) invertedPart = '0' + invertedPart;
        invertedColor += invertedPart;
    });

    return invertedColor;
}

// #region drawing functions
function drawEvent(e) {
    let x = 2 * e.clientX - (window.innerWidth * 2 - canvas.width - 5 * 2);
    let y = 2 * e.clientY - (window.innerHeight * 2 - canvas.height - 5 * 2);
    if (isDrawing) {
        let action = {
            action: 'draw',
            colorPrimary,
            colorSecondary,
            previousX,
            previousY,
            x,
            y,
            radius,
            offset
        };
        drawLine(x, y, previousX, previousY);
        addHistory(action);
    }
    previousX = x;
    previousY = y;
}
function drawLine(x, y, px, py) {
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(x, y);
    ctx.stroke();

    ctxLower.beginPath();
    ctxLower.moveTo(px, py);
    ctxLower.lineTo(x, y);
    ctxLower.stroke();
}
function downEvent(e) {
    previousX = 2 * e.clientX - (window.innerWidth * 2 - canvas.width - 5 * 2);
    previousY = 2 * e.clientY - (window.innerHeight * 2 - canvas.height - 5 * 2);
    if (!isDrawing) {
        isDrawing = true;
        addHistory({
            action: 'start'
        });
        drawEvent(e);
    }
}
function upEvent(e) {
    if (isDrawing) {
        isDrawing = false;
        addHistory({
            action: 'stop',
            isAction: true
        });
    }
}

// #region drawing events
canvas.addEventListener('mousedown', (e) => {
    downEvent(e);
});
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    downEvent(e.touches[0]);
});
canvas.addEventListener('mousemove', (e) => {
    drawEvent(e);
});
canvas.addEventListener('touchmove', (e) => {
    drawEvent(e.changedTouches[0]);
});
document.addEventListener('mouseup', (e) => {
    upEvent(e);
});
document.addEventListener('touchend', (e) => {
    upEvent(e.changedTouches[0]);
});
document.addEventListener('touchcancel', (e) => {
    upEvent(e.changedTouches[0]);
});

// #region inputs
radiusElement.addEventListener('input', () => {
    radius = parseInt(radiusElement.value);
    ctx.lineWidth = radius;
    ctxLower.lineWidth = radius + offset;
    drawPreview();
});
offsetElement.addEventListener('input', () => {
    offset = parseInt(offsetElement.value);
    ctxLower.lineWidth = radius + offset;
    drawPreview();
});
colorPrimaryElement.addEventListener('input', () => {
    colorPrimary = colorPrimaryElement.value;
    ctx.strokeStyle = colorPrimary;
    colorPage();
    drawPreview();
});
colorSecondaryElement.addEventListener('input', () => {
    colorSecondary = colorSecondaryElement.value;
    ctxLower.strokeStyle = colorSecondary;
    colorPage();
    drawPreview();
});

// #region global
window.addEventListener('resize', () => {
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    canvasLower.width = canvasLower.offsetWidth * 2;
    canvasLower.height = canvasLower.offsetHeight * 2;

    ctx.lineCap = 'round';
    ctxLower.lineCap = 'round';

    reloadHistory();
});

// #region buttons
resetButton.addEventListener('click', () => {
    resetCanvas();
    addHistory({
        action: 'clear',
        isAction: true
    });
})
undoButton.addEventListener('click', () => {
    if (currentHistoryIndex == -1) return;
    currentHistoryIndex--;
    while (currentHistoryIndex >= 0 && !history[currentHistoryIndex].isAction) {
        currentHistoryIndex--;
    }
    reloadHistory();
});
redoButton.addEventListener('click', () => {
    if (currentHistoryIndex == history.length - 1) return;
    currentHistoryIndex++;
    while (currentHistoryIndex < history.length && !history[currentHistoryIndex].isAction) {
        currentHistoryIndex++;
    }
    reloadHistory();
});
randomButton.addEventListener('click', () => {
    colorPrimary = '#';
    colorSecondary = '#';
    for (let i = 0; i < 6; i++) {
        colorPrimary += randomHex();
        colorSecondary += randomHex();
    }
    ctx.strokeStyle = colorPrimary;
    ctxLower.strokeStyle = colorSecondary;
    colorPrimaryElement.value = colorPrimary;
    colorSecondaryElement.value = colorSecondary;
    colorPage();
    drawPreview();
});

drawPreview();
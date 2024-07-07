document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // Elementos del DOM para el menú lateral
    var menuToggle = document.getElementById('menu-toggle');
    var menu = document.getElementById('menu');
    var menuClose = document.getElementById('menu-close');
    var isGameRunning = false;

    // Elementos del DOM para el tablero
    var startGameButton = document.getElementById('start-game');
    startGameButton.disabled = false;
    var board = document.getElementById('board');
    var playerNameInput = document.getElementById('player-name');
    var selectedWordsDisplay = document.getElementById('selected-words');
    var letters = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
        'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
        'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
        'Y', 'Z'
    ];
    var currentWord = '';
    var selectedCells = [];

    // Cierra el menú lateral si se hace clic fuera de él
    function handleClickOutsideMenu(event) {
        if (!menu.contains(event.target) && !menuToggle.contains(event.target)) {
            menu.classList.remove('show');
        }
    }

    // Evento para mostrar u ocultar el menú lateral
    menuToggle.addEventListener('click', function () {
        if (!isGameRunning) {
            menu.classList.toggle('show');
        }
    });

    // Evento para cerrar el menú lateral
    menuClose.addEventListener('click', function () {
        menu.classList.remove('show');
    });

    // Evento para manejar el clic fuera del menú lateral
    document.addEventListener('click', handleClickOutsideMenu);

    //Iniciar tablero

    startGameButton.addEventListener('click', function () {
        if (playerNameInput.value.trim().length < 3) {
            Swal.fire('Error', 'El nombre del jugador debe tener al menos 3 caracteres', 'error');
        } else {
            startGame();
        }
    });


    function startGame() {
        initBoard();
        document.querySelector('.setup').classList.add('hidden');
        document.querySelector('.game').classList.remove('hidden');
        isGameRunning = true;
    }

    // Función para incializar el tablero con varras aleatorias
    function initBoard() {
        board.innerHTML = '';
        for (var i = 0; i < 16; i++) {
            var cell = document.createElement('button');
            cell.textContent = letters[Math.floor(Math.random() * letters.length)];
            cell.classList.add('board-cell');
            cell.addEventListener('click', handleCellClick);
            board.appendChild(cell);
        }
    }
    // Maneja el clic en una celda del tablero
    function handleCellClick(event) {
        var cell = event.target;
        if (selectedCells.includes(cell)) {
            return;
        }
        if (selectedCells.length > 0) {
            var lastCell = selectedCells[selectedCells.length - 1];
            if (!isAdjacent(lastCell, cell)) {
                return;
            }
        }

        // Restablece el color original de todas las celdas adyacentes no seleccionadas
        var allCells = Array.from(board.children);
        allCells.forEach(adjacentCell => {
            if (!selectedCells.includes(adjacentCell)) {
                adjacentCell.classList.remove('highlight');
            }
        });

        // Añade las clases 'selected' a la celda actual
        cell.classList.add('selected');
        selectedCells.push(cell);
        currentWord += cell.textContent;
        selectedWordsDisplay.textContent = currentWord;

        // Obtiene las celdas adyacentes y marca las seleccionables
        var adjacentCells = getAdjacentCells(cell);
        adjacentCells.forEach(adjacentCell => {
            if (!selectedCells.includes(adjacentCell)) {
                adjacentCell.classList.add('highlight'); // Clase para resaltar temporalmente
            }
        });
    }
    // Obtiene las celdas adyacentes a una celda dada
    function getAdjacentCells(cell) {
        var cells = Array.from(board.children);
        var index = cells.indexOf(cell);
        var row = Math.floor(index / 4);
        var col = index % 4;
        var adjacentCells = [];

        // Verifica las celdas adyacentes en la matriz 4x4
        for (var i = Math.max(0, row - 1); i <= Math.min(row + 1, 3); i++) {
            for (var j = Math.max(0, col - 1); j <= Math.min(col + 1, 3); j++) {
                if (!(i === row && j === col)) { // No incluir la celda actual
                    adjacentCells.push(cells[i * 4 + j]);
                }
            }
        }

        return adjacentCells;
    }
    // Verifica si dos celdas son adyacentes en el tablero
    function isAdjacent(cell1, cell2) {
        var cells = Array.from(board.children);
        var index1 = cells.indexOf(cell1);
        var index2 = cells.indexOf(cell2);
        var row1 = Math.floor(index1 / 4);
        var col1 = index1 % 4;
        var row2 = Math.floor(index2 / 4);
        var col2 = index2 % 4;
        return Math.abs(row1 - row2) <= 1 && Math.abs(col1 - col2) <= 1;
    }
});


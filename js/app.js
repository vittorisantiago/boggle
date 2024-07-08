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

    // Elemento del DOM para el tema
    var themeToggle = document.getElementById('theme-toggle');
    var icon = themeToggle.getElementsByTagName('i')[0]; // Selecciona el primer <i> dentro de themeToggle
    var body = document.body;

    // Elementos del DOM para la dificultad y el ranking
    var difficultyToggle = document.getElementById('difficulty-toggle');
    var difficultyOptions = document.getElementById('difficulty-options');
    var difficultyInputs = document.getElementsByName('difficulty');
    var difficulty = 'easy';

    // Elemento del DOM para el ranking
    var rankingToggle = document.getElementById('ranking-toggle');

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

    // Función para verificar si el modo oscuro está activo
    function isDarkMode() {
        return body.classList.contains('dark-mode');
    }

    // Función para actualizar el texto y el icono del tema
    function updateThemeToggle() {
        var text = isDarkMode() ? ' Tema Oscuro' : ' Tema Claro';

        if (isDarkMode()) {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        } else {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }

        themeToggle.childNodes[1].textContent = text;
    }

    // Evento para alternar el tema oscuro o claro
    themeToggle.addEventListener('click', function (event) {
        event.preventDefault();  // Evita que el enlace realice la acción por defecto
        body.classList.toggle('dark-mode');
        updateThemeToggle();
    });

    // Inicializar el estado del tema al cargar la página
    updateThemeToggle();

    // Evento para mostrar u ocultar las opciones de dificultad
    difficultyToggle.addEventListener('click', function () {
        difficultyOptions.classList.toggle('hidden');
    });

    // Evento para cambiar la dificultad seleccionada
    for (var i = 0; i < difficultyInputs.length; i++) {
        difficultyInputs[i].addEventListener('change', function (event) {
            difficulty = event.target.value;
        });
    }

    function showRankings() {
        var results = JSON.parse(localStorage.getItem('results') || '[]');
        var difficulties = ['easy', 'hard'];
        var rankingContainer = document.createElement('div');
    
        difficulties.forEach(difficulty => {
            var difficultyTitle = document.createElement('h3');
            difficultyTitle.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1) + ' Mode';
            rankingContainer.appendChild(difficultyTitle);
    
            [1, 2, 3].forEach(time => {
                var filteredResults = results.filter(result => result.difficulty === difficulty && result.time == time)
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 3);
    
                var timeTitle = document.createElement('h4');
                timeTitle.textContent = `${time} minuto(s)`;
                rankingContainer.appendChild(timeTitle);
    
                if (filteredResults.length > 0) {
                    var ul = document.createElement('ul');
                    filteredResults.forEach(result => {
                        var li = document.createElement('li');
                        li.textContent = `${result.player}: ${result.score} puntos (${result.date})`;
                        ul.appendChild(li);
                    });
                    rankingContainer.appendChild(ul);
                } else {
                    var noResultsMessage = document.createElement('p');
                    noResultsMessage.textContent = 'No hay resultados';
                    rankingContainer.appendChild(noResultsMessage);
                }
            });
        });
    
        Swal.fire({
            title: 'Ranking',
            html: rankingContainer.outerHTML,
            width: 600,
            padding: '48px',
            background: isDarkMode() ? 'rgb(44, 62, 80)' : 'rgb(255, 255, 255)',
            customClass: {
                title: isDarkMode() ? 'swal2-title-dark' : '',
                htmlContainer: isDarkMode() ? 'swal2-html-container-dark' : ''
            }
        });
    }    

    // Evento para mostrar el ranking de los jugadores
    rankingToggle.addEventListener('click', showRankings);

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


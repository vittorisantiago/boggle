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

    // Elemento del DOM para el envio de palabras y puntaje
    var wordSubmitButton = document.getElementById('word-submit');
    var errorMessage = document.getElementById('error-message');
    var scoreDisplay = document.getElementById('score-display');
    var submittedWordsDisplay = document.getElementById('submitted-words');
    var submittedWords = [];
    var totalScore = 0;

    // Elementos del DOM mezclar, cancelar y limpiar
    var shuffleBoardButton = document.getElementById('shuffle-board');
    var clearGameButton = document.getElementById('clear-selection');
    var cancelGameButton = document.getElementById('cancel-game');

    // Elemento del DOM para el tiempo de juego
    var timerDisplay = document.getElementById('time');
    var gameTimeSelect = document.getElementById('game-time');
    var interval;
    var timeRemaining;

    // Elementos del DOM para el las intrucciones
    var instructions = document.getElementById('intructions');
    var instruction = `
        <h3>Introducción</h3>
        <p>Boggle es un juego de palabras en el que intentas encontrar tantas palabras como puedas en una cuadrícula de 4x4 letras dispuestas al azar. Tienes un tiempo limitado para jugar.</p>
        <h3>Reglas</h3>
        <ul style="text-align: left;">
            <li>Las palabras deben tener al menos 3 letras.</li>
            <li>Cada letra después de la primera debe estar junto a la anterior (horizontal, vertical o diagonalmente).</li>
            <li>No puedes usar la misma casilla más de una vez en una palabra.</li>
            <li>Se permiten diferentes formas de la misma palabra (singulares, plurales, etc.), pero no nombres propios, artículos ni pronombres.</li>
            <li>Puedes formar palabras dentro de otras palabras (como "casa" y "casamiento").</li>
            <li>Las palabras deben ser reales y existir en el diccionario. Si ingresas una palabra que no es real, recibirás una penalización.</li>
        </ul>
        <p>¡Disfruta jugando Boggle y demuestra tu habilidad para encontrar palabras!</p>
    `;

    // Evento para mostrar las instrucciones
    instructions.addEventListener('click', function () {
        Swal.fire({
            title: 'Instrucciones',
            html: instruction,
            confirmButtonText: 'Cerrar',
            width: 600,
            padding: '48px',
            background: isDarkMode() ? 'rgb(44, 62, 80)' : 'rgb(255, 255, 255)',
            customClass: {
                title: isDarkMode() ? 'swal2-title-dark' : '',
                htmlContainer: isDarkMode() ? 'swal2-html-container-dark' : ''
            }
        });
    });

    // Cierra el menú lateral si se hace clic fuera de él
    function handleClickOutsideMenu(event) {
        if (!menu.contains(event.target) && !menuToggle.contains(event.target)) {
            menu.classList.remove('show');
            menu.classList.add('hidden');
        }
    }

    // Evento para mostrar u ocultar el menú lateral
    menuToggle.addEventListener('click', function () {
        if (!isGameRunning) {
            menu.classList.remove('hidden');
            menu.classList.toggle('show');
        }
    });

    // Evento para cerrar el menú lateral
    menuClose.addEventListener('click', function () {
        menu.classList.remove('show');
        menu.classList.add('hidden');
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
        timerDisplay.textContent = '';
        timeRemaining = parseInt(gameTimeSelect.value, 10) * 60;
        currentWord = '';
        selectedCells = [];
        submittedWords = [];
        totalScore = 0; // Reinicia el puntaje total
        scoreDisplay.textContent = `Total: ${totalScore}`; // Muestra el puntaje total
        initBoard();
        interval = setInterval(updateTimer, 1000);
        document.querySelector('.setup').classList.add('hidden');
        document.querySelector('.game').classList.remove('hidden');
        clearPersistentWords();
        isGameRunning = true;
    }

    // Función para incializar el tablero con barras aleatorias
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

    // Maneja el click en una celda del tablero
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

        // Añade las clases 'selected' y 'bold' a la celda actual
        cell.classList.add('selected');
        cell.classList.add('bold');
        selectedCells.push(cell);
        currentWord += cell.textContent;
        selectedWordsDisplay.textContent = currentWord;

        if (difficulty === 'easy') {
            // Obtiene las celdas adyacentes y marca las seleccionables
            var adjacentCells = getAdjacentCells(cell);
            adjacentCells.forEach(adjacentCell => {
                if (!selectedCells.includes(adjacentCell)) {
                    adjacentCell.classList.add('selectable');
                    adjacentCell.classList.add('highlight'); // Clase para resaltar temporalmente
                }
            });
        }
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

    // Valida y procesa la palabra enviada por el jugador
    function submitWord() {
        if (currentWord.length < 3) {
            showErrorMessage('La palabra no es válida');
            clearBoard(); // Limpiar todas las casillas cuando la palabra no es válida
            return;
        }
    
        if (submittedWords.includes(currentWord)) {
            showErrorMessage('La palabra ya ha sido enviada');
            clearBoard(); // Limpiar todas las casillas cuando la palabra ya ha sido enviada
            return;
        }
    
        validateWord(currentWord, function (isValid) {
            var points = 0;
            if (isValid) {
                points = calculatePoints(currentWord.length);
                totalScore += points;
                showScoreMessage(currentWord, points, true);
            } else {
                points = -1;
                if (totalScore > 0) {
                    totalScore += points;
                }
                showScoreMessage(currentWord, points, false);
            }
            scoreDisplay.textContent = `Total: ${totalScore}`; // Mostrar el puntaje total actualizado
            submittedWords.push(currentWord);
            clearBoard(); // Limpiar todas las casillas después de enviar una palabra (tanto válida como no válida)
        });
    }

    // Evento al hacer clic en el botón de enviar palabra
    wordSubmitButton.addEventListener('click', submitWord);
    
    function clearBoard() {
        var allCells = Array.from(board.children);
        allCells.forEach(cell => {
            cell.classList.remove('selected');
            cell.classList.remove('bold');
            cell.classList.remove('selectable');
            cell.classList.remove('highlight');
        });
        selectedCells = [];
        selectedWordsDisplay.textContent = '';
        currentWord = '';
    }

    // Evento al hacer clic en el botón de limpiar
    clearGameButton.addEventListener('click', clearBoard);

    // Muestra un mensaje de puntaje para la palabra ingresada
    function showScoreMessage(word, points, isPositive) {
        var scoreMessage = document.createElement('div');
        scoreMessage.textContent = `${word}: ${isPositive ? `+${points}` : `${points}`} puntos`;
        scoreMessage.classList.add(isPositive ? 'positive-score' : 'negative-score');
        submittedWordsDisplay.appendChild(scoreMessage);

        setTimeout(() => {
            scoreMessage.classList.add('fade-out');
            setTimeout(() => {
                var persistentWord = document.createElement('div');
                persistentWord.textContent = word;
                persistentWord.classList.add(isPositive ? 'positive-score' : 'negative-score');
                document.querySelector('.persistent-submitted-words').appendChild(persistentWord);
                scoreMessage.remove();
            }, 1000);
        }, 2000);
    }

    // Valida si una palabra es válida usando una API externa
    function validateWord(word, callback) {
        var url = 'https://api.dictionaryapi.dev/api/v2/entries/en/' + word;
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Palabra no encontrada');
                }
                return response.json();
            })
            .then(data => {
                callback(true);
            })
            .catch(error => {
                callback(false);
            });
    }

    // Calcula los puntos para una palabra según su longitud
    function calculatePoints(length) {
        if (length >= 8) return 11;
        if (length === 7) return 5;
        if (length === 6) return 3;
        if (length === 5) return 2;
        if (length === 3 || length === 4) return 1;
        return 0;
    }

    // Función para pausar el cronómetro
    function pauseTimer() {
        clearInterval(interval);
    }

    // Función para reanudar el cronómetro
    function resumeTimer() {
        interval = setInterval(updateTimer, 1000);
    }

    // Función para reiniciar el juego
    function resetGame() {
        clearInterval(interval);
        currentWord = '';
        selectedCells = [];
        submittedWords = [];
        totalScore = 0;
        scoreDisplay.textContent = `Total: ${totalScore}`;
        clearBoard(); // Limpia el tablero
        var setupElements = document.getElementsByClassName('setup');
        if (setupElements.length > 0) {
            setupElements[0].classList.remove('hidden');
        }
        var gameElements = document.getElementsByClassName('game');
        if (gameElements.length > 0) {
            gameElements[0].classList.add('hidden');
        }
        timerDisplay.textContent = '';
        playerNameInput.value = '';
        clearPersistentWords();
        isGameRunning = false;
    }

    function cancelGame() {
        pauseTimer(); // Pausa el cronómetro
    
        Swal.fire({
            title: 'Cancelar Juego',
            text: '¿Quieres cancelar el juego? Tu progreso se perderá.',
            icon: 'warning',
            showCancelButton: false,
            showCloseButton: true,
            confirmButtonColor: 'rgb(221, 51, 51)',
            confirmButtonText: 'Sí, cancelar juego'
        }).then((result) => {
            if (result.isConfirmed) {
                resetGame(); // Llama a la función para cancelar el juego
            } else if (result.dismiss === Swal.DismissReason.close) {
                resumeTimer(); // Reanuda el cronómetro si se cierra el modal
            }
        });
    }

    // Evento al hacer clic en el botón de cancelar juego
    cancelGameButton.addEventListener('click', cancelGame);

    // Función para mezclar las letras del tablero
    function shuffleBoard() {
        var cells = Array.from(board.children);
        // Añadir la clase de animación a cada celda
        cells.forEach(cell => {
            cell.classList.add('spin');
        });

        // Esperar a que la animación termine para mezclar las letras y quitar la clase
        setTimeout(() => {
            var shuffledLetters = cells.map(cell => cell.textContent).sort(() => Math.random() - 0.5);
            cells.forEach((cell, index) => {
                cell.textContent = shuffledLetters[index];
                cell.classList.remove('spin');
            });
            clearBoard(); // Limpia todas las celdas seleccionadas
        }, 500); // Duración de la animación en milisegundos
    }

    // Evento al hacer clic en el botón de mezclar tablero
    shuffleBoardButton.addEventListener('click', shuffleBoard);

    // Limpia todos los elementos y reinicia el juego
    function clearGame() {
        clearInterval(interval);
        playerNameInput.value = '';
        selectedWordsDisplay.textContent = '';
        submittedWordsDisplay.textContent = '';
        clearBoard();
        initBoard();
    }

    // Actualiza el temporizador cada segundo
    function updateTimer() {
        if (timeRemaining <= 0) {
            clearInterval(interval);
            Swal.fire({
                title: 'El tiempo se acabó',
                text: `El juego ha terminado. Puntaje obtenido: ${totalScore}`,
                icon: 'info',
                confirmButtonText: 'Volver a intentarlo',
                showCloseButton: true
            }).then((result) => {
                if (result.isConfirmed) {
                    clearGame(); // Limpia todo el juego
                    startGame();
                } else if (result.dismiss === Swal.DismissReason.close) {
                    resetGame(); // Vuelve al menú principal
                }
            });
            saveResult();
            return;
        }
        timeRemaining--;
        timerDisplay.textContent = timeRemaining;
        if (timeRemaining <= 10) {
            timerDisplay.classList.add('warning');
        } else {
            timerDisplay.classList.remove('warning');
        }
    }

    // Muestra un mensaje de error temporal
    function showErrorMessage(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        setTimeout(function () {
            errorMessage.textContent = '';
            errorMessage.classList.add('hidden');
            clearBoard();
        }, 2000);
    }

     // Función para limpiar el cuadro de palabras persistentes
     function clearPersistentWords() {
        var persistentContainer = document.querySelector('.persistent-submitted-words');
        persistentContainer.innerHTML = '';
    }

    function saveResult() {
        var results = JSON.parse(localStorage.getItem('results') || '[]');
        results.push({
            player: playerNameInput.value.trim(),
            score: totalScore, // Guarda el puntaje total
            date: new Date().toLocaleString(),
            difficulty: difficulty,
            time: gameTimeSelect.value
        });
        localStorage.setItem('results', JSON.stringify(results));
    }
});


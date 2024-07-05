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
    var letters = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
        'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
        'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
        'Y', 'Z'
    ];

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
            board.appendChild(cell);
        }
    }
});


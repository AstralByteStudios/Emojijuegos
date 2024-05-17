document.addEventListener("DOMContentLoaded", function () {
  const emoteDisplay = document.getElementById("emote-display");
  const guessInput = document.getElementById("guess-input");
  const submitButton = document.getElementById("submit-guess");
  const resultDisplay = document.getElementById("result");
  const livesContainer = document.getElementById("lives-container");
  const scoreDisplay = document.getElementById("game-over-score");
  const gameOverScreen = document.getElementById("game-over-screen");
  const retryButton = document.getElementById("retry-button");
  const gameContainer = document.getElementById("game-container");
  const infoButton = document.getElementById("info-button");

  let videojuegos = [];
  let currentGameIndex;
  let vidas = 4;
  let score = 0;
  let maxScore = localStorage.getItem("maxScore")
    ? parseInt(localStorage.getItem("maxScore"))
    : 0;

  function removePlayedGame() {
    videojuegos.splice(currentGameIndex, 1);
  }

  function resetearPistas() {
    const pistasDisplay = document.getElementById("pistas-display");
    pistasDisplay.innerHTML = "";
  }

  function startGame() {
    if (videojuegos.length > 0) {
      resetearPistas();
      currentGameIndex = Math.floor(Math.random() * videojuegos.length);
      const randomGame = videojuegos[currentGameIndex];
      emoteDisplay.textContent = randomGame.emotes;
      resultDisplay.textContent = "";
      resultDisplay.style.color = "#fff";
      guessInput.value = "";
      vidas = 4;
      updateLives();
      updateScore();
      gameOverScreen.style.display = "none";
      gameContainer.style.display = "block";
    } else {
      console.log("¡Ya has jugado todos los videojuegos!");
    }
  }

  function checkGuess() {
    const userGuess = guessInput.value.trim().toLowerCase();
    const currentGame = videojuegos[currentGameIndex];

    if (userGuess === currentGame.nombre.toLowerCase()) {
      resultDisplay.textContent = "¡Correcto! ¡Has adivinado el videojuego!";
      resultDisplay.style.color = "#1eff00";
      score++;
      updateScore();
      removePlayedGame();
      currentGameIndex = (currentGameIndex + 1) % videojuegos.length;
      setTimeout(startGame, 2000);
      if (score === videojuegos.length) {
        gameOver();
      }
    } else {
      vidas--;
      resultDisplay.textContent = "¡Incorrecto! ¡Ese no es el videojuego!";
      resultDisplay.style.color = "#ff0000";
      if (vidas > 0) {
        updateLives();
      } else {
        gameOver();
      }
    }
  }

  function updateLives() {
    livesContainer.innerHTML = "";
    for (let i = 0; i < vidas; i++) {
      const heart = document.createElement("span");
      heart.textContent = "❤️";
      heart.classList.add("heart");
      livesContainer.appendChild(heart);
    }
  }

  function updateScore() {
    scoreDisplay.textContent = score;
    const currentScoreElement = document.getElementById("current-score");
    const maxScoreElement = document.getElementById("max-score");
    currentScoreElement.textContent = score;
    maxScoreElement.textContent = maxScore;
  }

  function gameOver() {
    gameContainer.style.display = "none";
    gameOverScreen.style.display = "flex";

    if (score > maxScore) {
      maxScore = score;
      localStorage.setItem("maxScore", maxScore.toString());
    }

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const scoreText = isMobile
      ? `Tu puntuación de la partida: ${score}`
      : `Tu puntuación de la partida: ${score} ·`;
    const maxScoreText = isMobile
      ? `Tu puntuación máxima: ${maxScore}`
      : `Tu puntuación máxima: ${maxScore}`;
    const combinedText = `${scoreText} ${maxScoreText}`;

    scoreDisplay.textContent = combinedText;

    const correctGameDisplay = document.getElementById("correct-game");
    const currentGame = videojuegos[currentGameIndex];
    correctGameDisplay.textContent = `El videojuego correcto era: ${currentGame.nombre}`;

    resultDisplay.textContent = `¡Game Over! Se acabaron tus vidas.`;
    resultDisplay.style.color = "#cc0000";
    score = 0;
  }

  retryButton.addEventListener("click", () => {
    gameContainer.style.display = "block";
    gameOverScreen.style.display = "none";
    startGame();
    updateLives();
  });

  submitButton.addEventListener("click", checkGuess);

  fetch("/data/juegos.json")
    .then((response) => response.json())
    .then((data) => {
      videojuegos = data.videojuegos;
      startGame();
    })
    .catch((error) => console.error("Error fetching data:", error));

  const awesomplete = new Awesomplete(guessInput, {
    list: videojuegos.map((game) => game.nombre),
  });

  guessInput.addEventListener("awesomplete-select", function (event) {
    guessInput.value = event.text.value;
  });

  guessInput.addEventListener("input", function () {
    awesomplete.list = videojuegos.map((game) => game.nombre);
  });

  function mostrarPista() {
    const currentGame = videojuegos[currentGameIndex];
    const pistas = currentGame.pistas;

    if (pistas.length > 0) {
      const pista = pistas.shift();
      const pistasDisplay = document.getElementById("pistas-display");
      const pistaElement = document.createElement("p");
      pistaElement.textContent = pista;
      pistasDisplay.appendChild(pistaElement);

      vidas--;
      if (vidas > 0) {
        updateLives();
      } else {
        gameOver();
      }
    }
  }

  document
    .getElementById("skip-button")
    .addEventListener("click", mostrarPista);

  document
    .getElementById("share-twitter")
    .addEventListener("click", function () {
      const twitterURL = `https://twitter.com/intent/tweet?text=¡Mi puntuación más alta en Emojijuegos es "${maxScore}!" ¿Puedes superarla? 🎮&url=${window.location.href}`;
      window.open(twitterURL, "_blank");
    });

  document
    .getElementById("share-whatsapp")
    .addEventListener("click", function () {
      const message = `¡Mi puntuación más alta en Emojijuegos es "${maxScore}!" ¿Puedes superarla? 🎮&url=${window.location.href};`;
      const whatsappURL = "https://wa.me/?text=" + encodeURIComponent(message);
      window.open(whatsappURL, "_blank");
    });

  const helpModal = document.getElementById("help-modal");
  helpModal.style.display = "none";
  const helpButton = document.getElementById("help-button");
  helpButton.addEventListener("click", function () {
    helpModal.style.display = "block";
    gameContainer.style.pointerEvents = "none";
  });
  document
    .getElementsByClassName("close")[0]
    .addEventListener("click", function () {
      helpModal.style.display = "none";
      gameContainer.style.pointerEvents = "auto";
    });
  window.addEventListener("click", function (event) {
    if (event.target === helpModal) {
      helpModal.style.display = "none";
      gameContainer.style.pointerEvents = "auto";
    }
  });

  const infoModal = document.getElementById("info-modal");
  infoModal.style.display = "none";
  infoButton.addEventListener("click", function () {
    infoModal.style.display = "block";
    gameContainer.style.pointerEvents = "none";
  });
  document
    .getElementsByClassName("close")[0]
    .addEventListener("click", function () {
      infoModal.style.display = "none";
      gameContainer.style.pointerEvents = "auto";
    });
  window.addEventListener("click", function (event) {
    if (event.target === infoModal) {
      infoModal.style.display = "none";
      gameContainer.style.pointerEvents = "auto";
    }
  });

  const copyModal = document.getElementById("copy-modal");
  copyModal.style.display = "none";
  const copyButton = document.getElementById("copy-button");
  copyButton.addEventListener("click", function () {
    copyModal.style.display = "block";
    gameContainer.style.pointerEvents = "none";
  });
  document
    .getElementsByClassName("close")[0]
    .addEventListener("click", function () {
      copyModal.style.display = "none";
      gameContainer.style.pointerEvents = "auto";
    });
  window.addEventListener("click", function (event) {
    if (event.target === copyModal) {
      copyModal.style.display = "none";
      gameContainer.style.pointerEvents = "auto";
    }
  });

  const loginButton = document.getElementById("login-button");
  const loginModal = document.getElementById("login-modal");
  const loginForm = document.getElementById("login-form");
  const closeButton = document.querySelector(".close");

  loginButton.addEventListener("click", () => {
    loginModal.style.display = "block";
  });

  closeButton.addEventListener("click", () => {
    loginModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === loginModal) {
      loginModal.style.display = "none";
    }
  });
});

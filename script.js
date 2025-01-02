class BullsAndCowsGame {
  constructor() {
    this.difficulties = {
      easy: { digits: 4, guesses: 10 },
      medium: { digits: 6, guesses: 12 },
      hard: { digits: 8, guesses: 15 },
    };
    this.currentDifficulty = "easy";
    this.secretNumber = "";
    this.remainingGuesses = this.difficulties.easy.guesses;
    this.gameOver = false;
    this.setupEventListeners();
    this.initializeGame();
  }

  setupEventListeners() {
    document
      .getElementById("submit-guess")
      .addEventListener("click", () => this.makeGuess());
    document
      .getElementById("play-again")
      .addEventListener("click", () => this.resetGame());
    document.getElementById("guess-input").addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.makeGuess();
    });

    // Add difficulty button listeners
    document.querySelectorAll(".difficulty-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const level = e.target.dataset.level;
        this.changeDifficulty(level);
      });
    });
  }

  changeDifficulty(level) {
    if (this.currentDifficulty === level) return;

    this.currentDifficulty = level;
    this.updateDifficultyUI();
    this.resetGame();
  }

  updateDifficultyUI() {
    // Update active button
    document.querySelectorAll(".difficulty-btn").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.level === this.currentDifficulty) {
        btn.classList.add("active");
      }
    });

    // Update input constraints
    const input = document.getElementById("guess-input");
    const digits = this.difficulties[this.currentDifficulty].digits;
    input.min = Math.pow(10, digits - 1);
    input.max = Math.pow(10, digits) - 1;

    // Update digits count display
    document.getElementById("digits-count").textContent = digits;
  }

  generateSecretNumber() {
    let digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    let number = "";
    const totalDigits = this.difficulties[this.currentDifficulty].digits;

    // First digit shouldn't be 0
    let firstDigit = Math.floor(Math.random() * 9) + 1;
    number += firstDigit;
    digits.splice(digits.indexOf(firstDigit.toString()), 1);

    // Generate remaining digits
    for (let i = 1; i < totalDigits; i++) {
      let index = Math.floor(Math.random() * digits.length);
      number += digits[index];
      digits.splice(index, 1);
    }

    return number;
  }

  isValidGuess(guess) {
    const digits = this.difficulties[this.currentDifficulty].digits;
    const regex = new RegExp(`^\\d{${digits}}$`);
    return regex.test(guess);
  }

  makeGuess() {
    if (this.gameOver) return;

    const input = document.getElementById("guess-input");
    const guess = input.value;

    if (!this.isValidGuess(guess)) {
      alert(
        `Shkruaj një numër ${
          this.difficulties[this.currentDifficulty].digits
        }-shifror valid!`
      );
      return;
    }

    const result = this.checkGuess(guess);
    this.remainingGuesses--;
    document.getElementById("guesses-left").textContent = this.remainingGuesses;

    this.displayGuess(guess, result);
    input.value = "";

    if (result.bulls === this.difficulties[this.currentDifficulty].digits) {
      this.endGame(true);
    } else if (this.remainingGuesses === 0) {
      this.endGame(false);
    }
  }

  initializeGame() {
    this.updateDifficultyUI();
    document
      .querySelector(`[data-level="${this.currentDifficulty}"]`)
      .classList.add("active");
    this.resetGame();
  }

  resetGame() {
    this.secretNumber = this.generateSecretNumber();
    this.remainingGuesses = this.difficulties[this.currentDifficulty].guesses;
    this.gameOver = false;

    // Re-enable input and guess button
    document.getElementById("guess-input").disabled = false;
    document.getElementById("submit-guess").disabled = false;

    document.getElementById("guesses-left").textContent = this.remainingGuesses;
    document.getElementById("guess-history").innerHTML = "";
    document.getElementById("game-over").classList.add("hidden");
    document.getElementById("guess-input").value = "";
    this.updateGuessesLeftColor();
  }

  checkGuess(guess) {
    let bulls = 0;
    let cows = 0;
    const secretArray = this.secretNumber.split("");
    const guessArray = guess.split("");

    // Check for bulls
    for (let i = 0; i < 4; i++) {
      if (guessArray[i] === secretArray[i]) {
        bulls++;
        secretArray[i] = "X";
        guessArray[i] = "Y";
      }
    }

    // Check for cows
    for (let i = 0; i < 4; i++) {
      if (guessArray[i] !== "Y") {
        const index = secretArray.indexOf(guessArray[i]);
        if (index !== -1) {
          cows++;
          secretArray[index] = "X";
        }
      }
    }

    return { bulls, cows };
  }

  displayGuess(guess, result) {
    const history = document.getElementById("guess-history");
    const guessItem = document.createElement("div");
    guessItem.className = "guess-item";
    guessItem.innerHTML = `
            <span>Numri: ${guess}</span>
            <span>Të fiksuara: ${result.bulls}, Të qëlluara: ${result.cows}</span>
        `;
    history.insertBefore(guessItem, history.firstChild);
    this.updateGuessesLeftColor();
  }

  updateGuessesLeftColor() {
    const guessesLeft = document.getElementById("guesses-left");
    const totalGuesses = this.difficulties[this.currentDifficulty].guesses;

    // Remove existing classes
    guessesLeft.classList.remove(
      "guesses-high",
      "guesses-medium",
      "guesses-low"
    );

    // Calculate percentage of guesses remaining
    const percentage = (this.remainingGuesses / totalGuesses) * 100;

    // Add appropriate class based on percentage
    if (percentage > 60) {
      guessesLeft.classList.add("guesses-high");
    } else if (percentage > 30) {
      guessesLeft.classList.add("guesses-medium");
    } else {
      guessesLeft.classList.add("guesses-low");
    }
  }

  endGame(won) {
    this.gameOver = true;
    const gameOver = document.getElementById("game-over");
    const resultMessage = document.getElementById("result-message");

    // Disable input and guess button
    document.getElementById("guess-input").disabled = true;
    document.getElementById("submit-guess").disabled = true;

    if (won) {
      resultMessage.textContent = "Të lumtë, ke fituar! 🎉";
      this.celebrateWin();
    } else {
      resultMessage.textContent = `Ke humbur! Numri ishte ${this.secretNumber}`;
      this.showGameOver();
    }

    gameOver.classList.remove("hidden");
  }

  celebrateWin() {
    // Create intense confetti celebration
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Create confetti from multiple origins
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  }

  showGameOver() {
    // Create a rain of sad emojis
    const emojis = ["😢", "😭", "😔", "💔", "😪"];
    const container = document.createElement("div");
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
    `;
    document.body.appendChild(container);

    // Create and animate 20 falling emojis
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const emoji = document.createElement("div");
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        emoji.style.cssText = `
          position: absolute;
          left: ${Math.random() * 100}%;
          top: -50px;
          font-size: 30px;
          opacity: 0;
          transform: translateY(0);
          animation: fall 3s ease-in forwards;
        `;

        emoji.textContent = randomEmoji;
        container.appendChild(emoji);

        // Remove emoji after animation
        setTimeout(() => emoji.remove(), 3000);
      }, i * 150); // Stagger the emoji creation
    }

    // Remove container after all animations
    setTimeout(() => container.remove(), 5000);
  }
}

// Start the game when the page loads
window.addEventListener("load", () => {
  new BullsAndCowsGame();
});

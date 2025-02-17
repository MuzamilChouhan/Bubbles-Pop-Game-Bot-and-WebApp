import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import popSound from "./sounds/pop.mp3";
import backgroundMusic from "./sounds/background.mp3";

// Bubble Component (unchanged)
const Bubble = ({ id, left, size, duration, onPop }) => {
  return (
    <div
      className="bubble"
      style={{
        left: `${left}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDuration: `${duration}s`,
      }}
      onClick={() => onPop(id)}
    />
  );
};

/*
  Level System:
  - New logic: level = Math.min(5, Math.floor(score / 100) + 1)
  - For every 100 points, level increases by 1 (capped at level 5)
*/
function computeLevel(score) {
  return Math.min(5, Math.floor(score / 100) + 1);
}

function App() {
  // Game state variables
  const [gameStarted, setGameStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);
  const [highestScore, setHighestScore] = useState(
    parseInt(localStorage.getItem("highestScore")) || 0
  );
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  // Each game result: { score, level, date }
  const [scoreHistory, setScoreHistory] = useState(
    JSON.parse(localStorage.getItem("scoreHistory")) || []
  );
  const [level, setLevel] = useState(1);
  // Menu modal: "main" or "history" view
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuView, setMenuView] = useState("main");
  // Mute state
  const [muted, setMuted] = useState(false);
  // New: Difficulty state ("easy", "medium", "hard")
  const [difficulty, setDifficulty] = useState("medium");

  // Define multipliers for difficulty (affect spawn interval and duration)
  const difficultyMultipliers = {
    easy: 1.0,
    medium: 0.8,
    hard: 0.6
  };

  // Refs for sound objects
  const popAudioRef = useRef(new Audio(popSound));
  const bgMusicRef = useRef(new Audio(backgroundMusic));

  // Adjust background music volume based on mute state.
  useEffect(() => {
    bgMusicRef.current.volume = muted ? 0 : 0.5;
  }, [muted]);

  // Start background music when game starts.
  useEffect(() => {
    if (gameStarted) {
      bgMusicRef.current.loop = true;
      bgMusicRef.current.play().catch((err) =>
        console.log("Background music play failed:", err)
      );
      return () => bgMusicRef.current.pause();
    }
  }, [gameStarted]);

  // Timer effect – decrease timeLeft every second.
  useEffect(() => {
    if (gameStarted && !paused && timeLeft > 0 && !gameOver) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (gameStarted && timeLeft === 0) {
      setGameOver(true);
      localStorage.setItem("lastScore", score);
      if (score > highestScore) {
        setHighestScore(score);
        localStorage.setItem("highestScore", score);
      }
      const newEntry = {
        score,
        level,
        date: new Date().toLocaleString()
      };
      const newHistory = [...scoreHistory, newEntry];
      setScoreHistory(newHistory);
      localStorage.setItem("scoreHistory", JSON.stringify(newHistory));
    }
  }, [gameStarted, paused, timeLeft, gameOver, score, highestScore, scoreHistory, level]);

  // Update level based on score.
  useEffect(() => {
    const newLevel = computeLevel(score);
    if (newLevel !== level) setLevel(newLevel);
  }, [score, level]);

  // Bubble generation effect – adjust spawn interval and falling speed based on level and difficulty.
  useEffect(() => {
    if (gameStarted && !paused && !gameOver) {
      const multiplier = difficultyMultipliers[difficulty];
      let intervalDelay = Math.max(300, (600 - (level - 1) * 50) * multiplier);
      const bubbleInterval = setInterval(() => {
        const id = Math.random();
        const left = Math.random() * 90;
        const size = Math.random() * 50 + 30;
        let baseDuration = Math.max(1.5, (2 - (level - 1) * 0.2) * multiplier);
        let randomComponent = Math.max(0, Math.random() * (3 - (level - 1) * 0.2));
        let duration = baseDuration + randomComponent;
        setBubbles((prev) => [...prev, { id, left, size, duration }]);
      }, intervalDelay);
      return () => clearInterval(bubbleInterval);
    }
  }, [gameStarted, paused, gameOver, level, difficulty]);

  // Clone pop audio for immediate playback.
  const handlePop = (id) => {
    if (gameOver) return;
    const popInstance = popAudioRef.current.cloneNode();
    popInstance.play();
    setBubbles((prev) => prev.filter((bubble) => bubble.id !== id));
    setScore((prev) => prev + 10);
  };

  const handleRestart = () => {
    setBubbles([]);
    setScore(0);
    setTimeLeft(60);
    setGameOver(false);
    setPaused(false);
    setLevel(1);
  };

  const handleStartGame = () => {
    setGameStarted(true);
  };

  const togglePause = () => {
    setPaused((prev) => !prev);
  };

  const toggleMute = () => {
    setMuted((prev) => !prev);
  };

  // Exit game: reset state and pause music.
  const exitGame = () => {
    setGameStarted(false);
    setPaused(false);
    setBubbles([]);
    setScore(0);
    setTimeLeft(60);
    setGameOver(false);
    setLevel(1);
    bgMusicRef.current.pause();
    setMenuOpen(false);
  };

  const openMenu = () => {
    setMenuOpen(true);
    setMenuView("main");
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Only show the last 10 entries from score history.
  const recentHistory = scoreHistory.slice(-10);

  return (
    <div className="app">
      {!gameStarted && (
        <div className="start-overlay" onClick={handleStartGame}>
          <h1>Click to Start</h1>
        </div>
      )}
      {gameStarted && (
        <>
          <div className="header">
            <div className="header-left">
              <h1>Bubble Pop Game</h1>
            </div>
            <div className="header-right">
              <div className="info">
                <p className="level">Level: {level}</p>
                <p className="highest">Highest: {highestScore}</p>
                <p className="current-score">Score: {score}</p>
                <p className="timer">Time: {timeLeft}s</p>
              </div>
              <div className="menu-icon" onClick={openMenu}>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
              </div>
            </div>
          </div>
          <div className="game-area">
            {bubbles.map((bubble) => (
              <Bubble
                key={bubble.id}
                id={bubble.id}
                left={bubble.left}
                size={bubble.size}
                duration={bubble.duration}
                onPop={handlePop}
              />
            ))}
          </div>
          {gameOver && (
            <div className="game-over">
              <h2>Game Over</h2>
              <p>Highest Score: {highestScore}</p>
              <p>Last Score: {localStorage.getItem("lastScore")}</p>
              <button onClick={handleRestart}>Restart Game</button>
            </div>
          )}
          {menuOpen && (
            <div className="menu-modal">
              <div className="menu-modal-content">
                {menuView === "main" ? (
                  <>
                    <h2>Menu</h2>
                    <div className="menu-buttons">
                      <button onClick={togglePause}>
                        {paused ? "Resume" : "Pause"}
                      </button>
                      <button onClick={toggleMute}>
                        {muted ? "Unmute" : "Mute"}
                      </button>
                      {/* Difficulty Selection */}
                      <div className="difficulty-selection">
                        <p>Select Difficulty:</p>
                        <div className="difficulty-buttons">
                          <button
                            className={difficulty === "easy" ? "active" : ""}
                            onClick={() => setDifficulty("easy")}
                          >
                            Easy
                          </button>
                          <button
                            className={difficulty === "medium" ? "active" : ""}
                            onClick={() => setDifficulty("medium")}
                          >
                            Medium
                          </button>
                          <button
                            className={difficulty === "hard" ? "active" : ""}
                            onClick={() => setDifficulty("hard")}
                          >
                            Hard
                          </button>
                        </div>
                      </div>
                      <button onClick={() => setMenuView("history")}>
                        Score History
                      </button>
                      <button onClick={exitGame}>Exit Game</button>
                      <button onClick={closeMenu}>Close</button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2>Score History</h2>
                    <div className="history-header">
                      <p>
                        <strong>Overall Highest Score: {highestScore}</strong>
                      </p>
                    </div>
                    {recentHistory.length ? (
                      <ul className="history-list">
                        {recentHistory.map((entry, index) => (
                          <li key={index} className="history-item">
                            <span className="history-index">
                              Game {scoreHistory.length - recentHistory.length + index + 1}:
                            </span>
                            <span className="history-score"> Score: {entry.score}</span>
                            <span className="history-level"> | Level: {entry.level}</span>
                            <span className="history-date"> | {entry.date}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No scores yet.</p>
                    )}
                    <button onClick={() => setMenuView("main")}>Back</button>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;

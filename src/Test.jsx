import React, { useState, useRef, useEffect } from "react";
import { RotateCcw, Trophy, Star, Volume2, VolumeX, Heart } from "lucide-react";

const Test = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [connections, setConnections] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const [startPoint, setStartPoint] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showParticles, setShowParticles] = useState(false);
  const [wrongConnection, setWrongConnection] = useState(null);
  const [shakeBasket, setShakeBasket] = useState(null);
  const svgRef = useRef(null);

  // Math problems with answers that match available baskets
  const mathProblems = {
    1: [
      { id: 1, problem: "2+1", answer: 3, position: { x: 150, y: 120 } },
      { id: 2, problem: "2+2", answer: 4, position: { x: 350, y: 120 } },
      { id: 3, problem: "3+2", answer: 5, position: { x: 550, y: 120 } },
      { id: 4, problem: "4+2", answer: 6, position: { x: 750, y: 120 } },
    ],
    2: [
      { id: 1, problem: "4×2", answer: 8, position: { x: 150, y: 120 } },
      { id: 2, problem: "3×3", answer: 9, position: { x: 350, y: 120 } },
      { id: 3, problem: "5×2", answer: 10, position: { x: 550, y: 120 } },
      { id: 4, problem: "7×1", answer: 7, position: { x: 750, y: 120 } },
    ],
    3: [
      { id: 1, problem: "9÷3", answer: 3, position: { x: 150, y: 120 } },
      { id: 2, problem: "12÷4", answer: 3, position: { x: 350, y: 120 } },
      { id: 3, problem: "18÷2", answer: 9, position: { x: 550, y: 120 } },
      { id: 4, problem: "35÷5", answer: 7, position: { x: 750, y: 120 } },
    ],
  };

  // Get level-specific baskets that match the problems
  const getLevelBaskets = (level) => {
    const allBaskets = [
      { id: 1, value: 3, position: { x: 150, y: 450 }, color: "#FF6B6B" },
      { id: 2, value: 4, position: { x: 280, y: 450 }, color: "#4ECDC4" },
      { id: 3, value: 5, position: { x: 410, y: 450 }, color: "#45B7D1" },
      { id: 4, value: 6, position: { x: 540, y: 450 }, color: "#96CEB4" },
      { id: 5, value: 7, position: { x: 670, y: 450 }, color: "#FFEAA7" },
      { id: 6, value: 8, position: { x: 800, y: 450 }, color: "#DDA0DD" },
      { id: 7, value: 9, position: { x: 350, y: 520 }, color: "#FFB347" },
      { id: 8, value: 10, position: { x: 550, y: 520 }, color: "#98FB98" },
    ];

    if (level === 1) {
      return allBaskets.filter((basket) => [3, 4, 5, 6].includes(basket.value));
    } else if (level === 2) {
      return allBaskets.filter((basket) =>
        [7, 8, 9, 10].includes(basket.value)
      );
    } else {
      return allBaskets.filter((basket) => [3, 7, 9].includes(basket.value));
    }
  };

  const baskets = getLevelBaskets(level);

  const currentProblems = mathProblems[level] || mathProblems[1];

  const playSound = (type) => {
    if (!soundEnabled) return;
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === "correct") {
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(
        659.25,
        audioContext.currentTime + 0.1
      );
      oscillator.frequency.setValueAtTime(
        783.99,
        audioContext.currentTime + 0.2
      );
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 1000);
    } else if (type === "wrong") {
      oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(196, audioContext.currentTime + 0.2);
    } else if (type === "complete") {
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(
        659.25,
        audioContext.currentTime + 0.1
      );
      oscillator.frequency.setValueAtTime(
        783.99,
        audioContext.currentTime + 0.2
      );
      oscillator.frequency.setValueAtTime(
        1046.5,
        audioContext.currentTime + 0.3
      );
    }

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.5
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const handleMouseDown = (e, problem) => {
    if (solvedProblems.includes(problem.id)) return;

    const rect = svgRef.current.getBoundingClientRect();
    const startX = problem.position.x;
    const startY = problem.position.y;

    setIsDrawing(true);
    setStartPoint({
      x: startX,
      y: startY,
      problemId: problem.id,
      answer: problem.answer,
    });
    setCurrentPath(`M ${startX} ${startY}`);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !startPoint) return;

    const rect = svgRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    setCurrentPath(
      `M ${startPoint.x} ${startPoint.y} L ${currentX} ${currentY}`
    );
  };

  const handleMouseUp = (e) => {
    if (!isDrawing || !startPoint) return;

    const rect = svgRef.current.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    const targetBasket = baskets.find((basket) => {
      const distance = Math.sqrt(
        Math.pow(endX - basket.position.x, 2) +
          Math.pow(endY - basket.position.y, 2)
      );
      return distance < 70;
    });

    if (targetBasket) {
      const isCorrect = startPoint.answer === targetBasket.value;

      if (isCorrect) {
        const newConnection = {
          id: Date.now(),
          problemId: startPoint.problemId,
          basketId: targetBasket.id,
          path: `M ${startPoint.x} ${startPoint.y} Q ${
            (startPoint.x + targetBasket.position.x) / 2
          } ${startPoint.y - 50} ${targetBasket.position.x} ${
            targetBasket.position.y
          }`,
          correct: true,
        };

        setConnections((prev) => [...prev, newConnection]);
        setScore((prev) => prev + 20);
        playSound("correct");

        const solvedCount = connections.filter((c) => c.correct).length + 1;
        if (solvedCount >= currentProblems.length) {
          setTimeout(() => {
            setGameCompleted(true);
            playSound("complete");
          }, 500);
        }
      } else {
        playSound("wrong");
        setShakeBasket(targetBasket.id);
        setTimeout(() => setShakeBasket(null), 500);

        setLives((prev) => Math.max(0, prev - 1));

        const wrongConn = {
          id: Date.now(),
          problemId: startPoint.problemId,
          basketId: targetBasket.id,
          path: `M ${startPoint.x} ${startPoint.y} L ${targetBasket.position.x} ${targetBasket.position.y}`,
          correct: false,
        };

        setWrongConnection(wrongConn);
        setTimeout(() => setWrongConnection(null), 800);
      }
    }

    setIsDrawing(false);
    setCurrentPath("");
    setStartPoint(null);
  };
  const handleKeyDown = (e) => {
    switch (e.key) {
      case "ArrowUp":
        console.log("Up key pressed");
        break;
      case "ArrowDown":
        console.log("Down key pressed");
        break;
      case "ArrowLeft":
        console.log("Left key pressed");
        break;
      case "ArrowRight":
        console.log("Right key pressed");
        break;
      default:
        break;
    }
  };
  const resetGame = () => {
    setConnections([]);
    setGameCompleted(false);
    setCurrentPath("");
    setStartPoint(null);
    setIsDrawing(false);
    setWrongConnection(null);
    setLives(3);
    setScore(0);
  };

  const nextLevel = () => {
    if (level < 3) {
      setLevel((prev) => prev + 1);
      setConnections([]);
      setGameCompleted(false);
      setLives(3);
      setCurrentPath("");
      setStartPoint(null);
      setIsDrawing(false);
      setWrongConnection(null);
    }
  };
  const handleTouchStart = (e, problem) => {
    e.preventDefault();
    if (solvedProblems.includes(problem.id)) return;

    const rect = svgRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const startX = problem.position.x;
    const startY = problem.position.y;

    setIsDrawing(true);
    setStartPoint({
      x: startX,
      y: startY,
      problemId: problem.id,
      answer: problem.answer,
    });
    setCurrentPath(`M ${startX} ${startY}`);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!isDrawing || !startPoint) return;

    const rect = svgRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const currentX = touch.clientX - rect.left;
    const currentY = touch.clientY - rect.top;

    setCurrentPath(
      `M ${startPoint.x} ${startPoint.y} L ${currentX} ${currentY}`
    );
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    if (!isDrawing || !startPoint) return;

    const rect = svgRef.current.getBoundingClientRect();
    const touch = e.changedTouches[0];
    const endX = touch.clientX - rect.left;
    const endY = touch.clientY - rect.top;

    const targetBasket = baskets.find((basket) => {
      const distance = Math.sqrt(
        Math.pow(endX - basket.position.x, 2) +
          Math.pow(endY - basket.position.y, 2)
      );
      return distance < 70;
    });

    if (targetBasket) {
      const isCorrect = startPoint.answer === targetBasket.value;

      if (isCorrect) {
        const newConnection = {
          id: Date.now(),
          problemId: startPoint.problemId,
          basketId: targetBasket.id,
          path: `M ${startPoint.x} ${startPoint.y} Q ${
            (startPoint.x + targetBasket.position.x) / 2
          } ${startPoint.y - 50} ${targetBasket.position.x} ${
            targetBasket.position.y
          }`,
          correct: true,
        };

        setConnections((prev) => [...prev, newConnection]);
        setScore((prev) => prev + 20);
        playSound("correct");

        const solvedCount = connections.filter((c) => c.correct).length + 1;
        if (solvedCount >= currentProblems.length) {
          setTimeout(() => {
            setGameCompleted(true);
            playSound("complete");
          }, 500);
        }
      } else {
        playSound("wrong");
        setShakeBasket(targetBasket.id);
        setTimeout(() => setShakeBasket(null), 500);

        setLives((prev) => Math.max(0, prev - 1));

        const wrongConn = {
          id: Date.now(),
          problemId: startPoint.problemId,
          basketId: targetBasket.id,
          path: `M ${startPoint.x} ${startPoint.y} L ${targetBasket.position.x} ${targetBasket.position.y}`,
          correct: false,
        };

        setWrongConnection(wrongConn);
        setTimeout(() => setWrongConnection(null), 800);
      }
    }

    setIsDrawing(false);
    setCurrentPath("");
    setStartPoint(null);
  };
  const solvedProblems = connections
    .filter((c) => c.correct)
    .map((c) => c.problemId);

  return (
    <div
      className={`min-h-screen transition-all duration-700 ${
        darkMode
          ? "bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
          : "bg-gradient-to-br from-yellow-200 via-pink-200 to-blue-200"
      }`}
    >
      {/* Floating particles effect */}
      {showParticles && (
        <div className="fixed inset-0 pointer-events-none z-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${0.5 + Math.random() * 0.5}s`,
              }}
            >
              ⭐
            </div>
          ))}
        </div>
      )}

      <div className="container mx-auto px-4 py-4">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-between items-center mb-4 gap-4 sm:gap-6">
          {/* Title & Level */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🌟 Math Magic Quest 🌟
            </h1>
            <div className="flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md sm:shadow-lg text-sm sm:text-base">
              <Star size={18} className="animate-spin" />
              <span className="font-bold">Level {level}</span>
            </div>
          </div>

          {/* Controls: Lives, Score, Sound, Reset, Theme */}
          <div className="flex flex-wrap justify-center sm:justify-end items-center gap-3 sm:gap-4">
            {/* Lives */}
            <div className="flex items-center gap-1 sm:gap-2 px-3 py-1 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-md text-sm">
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  size={18}
                  className={`${i < lives ? "text-white" : "text-gray-300"} ${
                    i < lives ? "animate-pulse" : ""
                  }`}
                  fill={i < lives ? "currentColor" : "none"}
                />
              ))}
            </div>

            {/* Score */}
            <div className="flex items-center gap-1 sm:gap-2 px-3 py-1 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md text-sm">
              <Trophy size={18} className="animate-bounce" />
              <span className="font-bold">{score}</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 sm:p-3 rounded-full transition-all transform hover:scale-110 shadow-md ${
                darkMode
                  ? "bg-gradient-to-r from-gray-600 to-gray-700 text-white"
                  : "bg-gradient-to-r from-green-400 to-blue-500 text-white"
              }`}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>

            {/* Reset */}
            <button
              onClick={resetGame}
              className={`p-2 sm:p-3 rounded-full transition-all transform hover:scale-110 shadow-md ${
                darkMode
                  ? "bg-gradient-to-r from-gray-600 to-gray-700 text-white"
                  : "bg-gradient-to-r from-purple-400 to-pink-500 text-white"
              }`}
            >
              <RotateCcw size={20} />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 sm:p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md transition-all transform hover:scale-110"
            >
              {darkMode ? "🌞" : "🌙"}
            </button>
          </div>
        </div>

        {/* Enhanced Instructions */}
        <div
          className={`text-center mb-4 px-3 py-4 max-w-md mx-auto rounded-xl shadow-md ${
            darkMode
              ? "bg-gradient-to-r from-purple-800/50 to-blue-800/50 text-white border border-purple-500/30"
              : "bg-gradient-to-r from-white/80 to-blue-100/80 text-gray-800 border border-blue-200"
          }`}
        >
          <p className="text-sm sm:text-base font-semibold flex flex-wrap items-center justify-center gap-1 leading-snug">
            🎯 <span>Help the magical creatures solve math problems!</span> 🧙‍♂️
          </p>

          <p className="text-xs sm:text-sm mt-1 opacity-80 leading-normal">
            Click and drag from each glowing orb to the correct treasure chest!
            ✨
          </p>

          {/* Level-specific guide */}
          <div className="mt-3 px-2 py-1 rounded-lg bg-white/20 backdrop-blur-sm inline-block text-xs sm:text-sm font-medium">
            Level {level} - Answers:
            <span className="ml-1">
              {level === 1 && "3, 4, 5, 6"}
              {level === 2 && "7, 8, 9, 10"}
              {level === 3 && "3, 7, 9"}
            </span>
          </div>
        </div>

        {/* Enhanced Game Area */}
        <div className="px-4 py-6 flex justify-center items-center">
          <div className="relative w-full max-w-[800px] mx-auto rounded-3xl overflow-hidden">
            <svg
              tabIndex={0}
              ref={svgRef}
              viewBox="0 0 900 650"
              preserveAspectRatio="xMidYMid meet"
              className={`w-full h-auto aspect-[900/650] mx-auto rounded-3xl shadow-2xl border-4 ${
                darkMode
                  ? "bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-purple-500/30"
                  : "bg-gradient-to-br from-green-200/70 to-blue-200/70 border-blue-300"
              }`}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseLeave={() => {
                setIsDrawing(false);
                setCurrentPath("");
                setStartPoint(null);
              }}
              onKeyDown={handleKeyDown}
            >
              {/* Gradients & Filters */}
              <defs>
                <radialGradient id="magicGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFD700" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#FF69B4" stopOpacity="0.1" />
                </radialGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Background */}
              <rect width="900" height="650" fill="url(#magicGlow)" />

              {/* Sparkles */}
              {[...Array(15)].map((_, i) => (
                <g key={`sparkle-${i}`}>
                  <circle
                    cx={100 + i * 60 + (i % 3) * 20}
                    cy={50 + (i % 4) * 40}
                    r="2"
                    fill="#FFD700"
                    opacity="0.8"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.3;1;0.3"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <text
                    x={100 + i * 60 + (i % 3) * 20}
                    y={55 + (i % 4) * 40}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#FFD700"
                  >
                    ✨
                  </text>
                </g>
              ))}

              {/* Problems */}
              {currentProblems.map((problem) => {
                const isSolved = solvedProblems.includes(problem.id);
                return (
                  <g key={problem.id} className="cursor-pointer">
                    <circle
                      cx={problem.position.x}
                      cy={problem.position.y}
                      r="55"
                      fill={isSolved ? "#90EE90" : "#4169E1"}
                      opacity="0.2"
                      filter="url(#glow)"
                    >
                      {!isSolved && (
                        <animate
                          attributeName="r"
                          values="50;60;50"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      )}
                    </circle>
                    <circle
                      cx={problem.position.x}
                      cy={problem.position.y}
                      r="45"
                      fill={
                        isSolved
                          ? "url(#solvedGradient)"
                          : "url(#problemGradient)"
                      }
                      stroke={isSolved ? "#4CAF50" : "#FFD700"}
                      strokeWidth="4"
                      filter="url(#glow)"
                    />
                    <rect
                      x={problem.position.x - 30}
                      y={problem.position.y - 12}
                      width="60"
                      height="24"
                      fill="white"
                      rx="12"
                      stroke={isSolved ? "#4CAF50" : "#FF6B6B"}
                      strokeWidth="3"
                      opacity="0.95"
                    />
                    <text
                      x={problem.position.x}
                      y={problem.position.y + 6}
                      textAnchor="middle"
                      fontSize="16"
                      fontWeight="bold"
                      fill={isSolved ? "#4CAF50" : "#333"}
                      className="select-none"
                      onMouseDown={(e) =>
                        !isSolved && handleMouseDown(e, problem)
                      }
                      onTouchStart={(e) =>
                        !isSolved && handleTouchStart(e, problem)
                      }
                    >
                      {problem.problem}
                    </text>
                    {isSolved && (
                      <g>
                        <text
                          x={problem.position.x + 50}
                          y={problem.position.y - 30}
                          fontSize="24"
                          fill="#4CAF50"
                        >
                          ✅
                        </text>
                        <circle
                          cx={problem.position.x}
                          cy={problem.position.y}
                          r="50"
                          fill="none"
                          stroke="#4CAF50"
                          strokeWidth="3"
                          opacity="0.5"
                        >
                          <animate
                            attributeName="r"
                            values="45;70;45"
                            dur="1s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.5;0;0.5"
                            dur="1s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Treasure Chests */}
              {baskets.map((basket) => (
                <g
                  key={basket.id}
                  className={shakeBasket === basket.id ? "animate-pulse" : ""}
                >
                  <ellipse
                    cx={basket.position.x + 3}
                    cy={basket.position.y + 25}
                    rx="35"
                    ry="12"
                    fill="black"
                    opacity="0.2"
                  />
                  <rect
                    x={basket.position.x - 30}
                    y={basket.position.y - 10}
                    width="60"
                    height="30"
                    fill={basket.color}
                    stroke="#8B4513"
                    strokeWidth="3"
                    rx="5"
                  />
                  <rect
                    x={basket.position.x - 32}
                    y={basket.position.y - 15}
                    width="64"
                    height="12"
                    fill={basket.color}
                    stroke="#8B4513"
                    strokeWidth="3"
                    rx="6"
                  />
                  <rect
                    x={basket.position.x - 28}
                    y={basket.position.y - 5}
                    width="56"
                    height="3"
                    fill="#FFD700"
                  />
                  <rect
                    x={basket.position.x - 28}
                    y={basket.position.y + 5}
                    width="56"
                    height="3"
                    fill="#FFD700"
                  />
                  <circle
                    cx={basket.position.x}
                    cy={basket.position.y - 8}
                    r="4"
                    fill="#FFD700"
                    stroke="#8B4513"
                    strokeWidth="1"
                  />
                  <circle
                    cx={basket.position.x}
                    cy={basket.position.y + 5}
                    r="15"
                    fill="white"
                    stroke="#333"
                    strokeWidth="3"
                  />
                  <circle
                    cx={basket.position.x}
                    cy={basket.position.y + 5}
                    r="12"
                    fill="url(#gemGradient)"
                    opacity="0.8"
                  />
                  <text
                    x={basket.position.x}
                    y={basket.position.y + 11}
                    textAnchor="middle"
                    fontSize="18"
                    fontWeight="bold"
                    fill="#333"
                  >
                    {basket.value}
                  </text>
                  <text
                    x={basket.position.x - 20}
                    y={basket.position.y - 20}
                    fontSize="12"
                    fill="#FFD700"
                  >
                    ✨
                  </text>
                </g>
              ))}

              {/* Connections */}
              {connections.map((connection) => (
                <g key={connection.id}>
                  <path
                    d={connection.path}
                    stroke={connection.correct ? "#4CAF50" : "#FF6B6B"}
                    strokeWidth="5"
                    fill="none"
                    strokeLinecap="round"
                    filter="url(#glow)"
                  />
                  {connection.correct && (
                    <path
                      d={connection.path}
                      stroke="#FFD700"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray="10,5"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        values="0;15;0"
                        dur="1s"
                        repeatCount="indefinite"
                      />
                    </path>
                  )}
                </g>
              ))}

              {/* Wrong connection animation */}
              {wrongConnection && (
                <path
                  d={wrongConnection.path}
                  stroke="#FF6B6B"
                  strokeWidth="5"
                  fill="none"
                  strokeDasharray="10,5"
                  opacity="0.8"
                >
                  <animate
                    attributeName="opacity"
                    values="0.8;0.2;0.8"
                    dur="0.2"
                    repeatCount="4"
                  />
                </path>
              )}

              {/* Current drawing path */}
              {currentPath && (
                <path
                  d={currentPath}
                  stroke="#FFD700"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray="8,4"
                  opacity="0.9"
                  filter="url(#glow)"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="0;12;0"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </path>
              )}

              {/* Additional Gradients */}
              <defs>
                <linearGradient
                  id="problemGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#FF6B6B" />
                  <stop offset="100%" stopColor="#4ECDC4" />
                </linearGradient>
                <linearGradient
                  id="solvedGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#90EE90" />
                  <stop offset="100%" stopColor="#32CD32" />
                </linearGradient>
                <radialGradient id="gemGradient" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#FFA500" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Enhanced Game Completed Modal */}
        {gameCompleted && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div
              className={`p-10 rounded-3xl shadow-2xl text-center max-w-lg mx-4 transform animate-bounce ${
                darkMode
                  ? "bg-gradient-to-br from-purple-800 to-indigo-800 text-white"
                  : "bg-gradient-to-br from-yellow-200 to-pink-200 text-gray-800"
              }`}
            >
              <div className="text-8xl mb-6 animate-bounce">🎉</div>
              <h2 className="text-4xl font-black mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AMAZING! 🌟
              </h2>
              <p className="mb-8 text-xl font-semibold">
                You're a math wizard! All problems solved! ✨
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                {level < 3 ? (
                  <button
                    onClick={nextLevel}
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl font-bold text-lg hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg"
                  >
                    Next Adventure 🚀
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setLevel(1);
                      resetGame();
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
                  >
                    Play Again 🔄
                  </button>
                )}
                <button
                  onClick={resetGame}
                  className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg ${
                    darkMode
                      ? "bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-500 hover:to-gray-600"
                      : "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 hover:from-gray-400 hover:to-gray-500"
                  }`}
                >
                  Try Again ⭐
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Over Modal for no lives */}
        {lives === 0 && !gameCompleted && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div
              className={`p-10 rounded-3xl shadow-2xl text-center max-w-lg mx-4 ${
                darkMode
                  ? "bg-gradient-to-br from-red-800 to-purple-800 text-white"
                  : "bg-gradient-to-br from-red-200 to-pink-200 text-gray-800"
              }`}
            >
              <div className="text-6xl mb-4">😔</div>
              <h2 className="text-3xl font-bold mb-4">Oops! Try Again!</h2>
              <p className="mb-6 text-lg">
                No worries! Math takes practice. Let's try again! 💪
              </p>
              <button
                onClick={resetGame}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg"
              >
                Try Again! 🌟
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Test;

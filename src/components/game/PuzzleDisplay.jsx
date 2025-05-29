import React from "react";
import VisualElements from "../ui/VisualElements";
import { operationNames, operationEmojis } from "../../utils/constants";

const PuzzleDisplay = ({ puzzle, currentOperation }) => {
  const getOperationSymbol = () => {
    switch (puzzle.operation) {
      case "+":
        return "+";
      case "-":
        return "−";
      case "×":
        return "×";
      default:
        return "+";
    }
  };

  const getOperationColor = () => {
    switch (puzzle.operation) {
      case "+":
        return "text-green-500";
      case "-":
        return "text-orange-500";
      case "×":
        return "text-purple-500";
      default:
        return "text-green-500";
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl sm:rounded-[2rem] shadow-2xl p-4 sm:p-8 mb-4 sm:mb-6 border-4 border-white/50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 left-4 text-6xl animate-spin-slow">
          ⭐
        </div>
        <div className="absolute top-4 right-4 text-6xl animate-bounce">🌟</div>
        <div className="absolute bottom-4 left-4 text-6xl animate-pulse">
          💫
        </div>
        <div className="absolute bottom-4 right-4 text-6xl animate-spin-slow">
          ✨
        </div>
      </div>

      <div className="relative z-10">
        {/* Operation Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div
            className={`inline-flex items-center ${getOperationColor()} bg-white rounded-2xl px-4 py-2 shadow-lg border-2 border-current/20`}
          >
            <span className="text-2xl sm:text-3xl mr-2">
              {operationEmojis[currentOperation]}
            </span>
            <h2 className="text-lg sm:text-2xl font-bold">
              {operationNames[currentOperation]} Challenge
            </h2>
          </div>
        </div>

        {/* Math Problem Display */}
        <div className="flex flex-col items-center justify-center space-y-6 sm:space-y-8">
          {/* Numbers Row */}
          <div className="flex items-center justify-center space-x-4 sm:space-x-8 w-full">
            {/* First Number */}
            <div className="text-center flex-1 max-w-32 sm:max-w-40">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl sm:text-5xl font-bold p-4 rounded-2xl shadow-xl mb-3 transform hover:scale-105 transition-transform">
                {puzzle.num1}
              </div>
              <VisualElements
                num={puzzle.num1}
                colorIndex={0}
                operation={puzzle.operation}
              />
            </div>

            {/* Operation Sign */}
            <div
              className={`text-4xl sm:text-7xl font-bold ${getOperationColor()} bg-white rounded-2xl p-3 sm:p-4 shadow-xl animate-pulse`}
            >
              {getOperationSymbol()}
            </div>

            {/* Second Number */}
            <div className="text-center flex-1 max-w-32 sm:max-w-40">
              <div className="bg-gradient-to-br from-red-500 to-pink-600 text-white text-3xl sm:text-5xl font-bold p-4 rounded-2xl shadow-xl mb-3 transform hover:scale-105 transition-transform">
                {puzzle.num2}
              </div>
              <VisualElements
                num={puzzle.num2}
                colorIndex={1}
                operation={puzzle.operation}
              />
            </div>

            {/* Equals Sign */}
            <div className="text-4xl sm:text-7xl font-bold text-green-500 bg-white rounded-2xl p-3 sm:p-4 shadow-xl">
              =
            </div>

            {/* Question Mark */}
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-4xl sm:text-7xl p-4 rounded-2xl shadow-xl animate-bounce">
              ❓
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PuzzleDisplay;

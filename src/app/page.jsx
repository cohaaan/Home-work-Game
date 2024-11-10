"use client";
import React from "react";

import { useHandleStreamResponse } from "../utilities/runtime-helpers";

function MainComponent() {
  const [score, setScore] = React.useState(0);
  const [level, setLevel] = React.useState(1);
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [selectedAnswer, setSelectedAnswer] = React.useState(null);
  const [isCorrect, setIsCorrect] = React.useState(null);
  const [lessons, setLessons] = React.useState([
    {
      word: "How old was Yaakov when he came down to Egypt?",
      translation: "130 years old",
      options: [
        "120 years old",
        "130 years old",
        "140 years old",
        "150 years old",
      ],
      level: 1,
    },
    {
      word: "What was Yaakov's prophecy for Dan?",
      translation:
        "That he would judge (and defend) his people as one of the tribes of Israel",
      options: [
        "Dan shall be a lion",
        "That he would judge (and defend) his people as one of the tribes of Israel",
        "Dan shall be mighty",
        "Dan shall be blessed",
      ],
      level: 1,
    },
  ]);
  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    const correct = answer === lessons[currentQuestion].translation;
    setIsCorrect(correct);
    if (correct) {
      setScore(score + 10);
      setTimeout(() => {
        if (currentQuestion < lessons.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setSelectedAnswer(null);
          setIsCorrect(null);
        }
      }, 1000);
    }
  };
  const nextQuestion = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    if (currentQuestion < lessons.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  const [showGame, setShowGame] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [streamingMessage, setStreamingMessage] = React.useState("");
  const handleStreamResponse = useHandleStreamResponse({
    onChunk: setStreamingMessage,
    onFinish: (content) => {
      const parsed = JSON.parse(content);
      setLessons(parsed.lessons);
      setIsLoading(false);
      setShowGame(true);
    },
  });

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;

      const response = await fetch("/integrations/chat-gpt/conversationgpt4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Convert these questions into a multiple choice quiz format with 4 options per question, where one is correct: ${text}`,
            },
          ],
          json_schema: {
            name: "learning_content",
            schema: {
              type: "object",
              properties: {
                lessons: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      word: { type: "string" },
                      translation: { type: "string" },
                      options: {
                        type: "array",
                        items: { type: "string" },
                      },
                      level: { type: "number" },
                    },
                    required: ["word", "translation", "options", "level"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["lessons"],
              additionalProperties: false,
            },
          },
          stream: true,
        }),
      });
      handleStreamResponse(response);
    };
    reader.readAsText(file);
  };

  const handleScrapeQuestions = async () => {
    setIsLoading(true);
    const response = await fetch("/integrations/web-scraping/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: "https://elmad.pardes.org/parsha/vayehi/",
        getText: true,
      }),
    });
    const text = await response.text();

    const gptResponse = await fetch("/integrations/chat-gpt/conversationgpt4", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: `Convert these questions into a multiple choice quiz format with 4 options per question, where one is correct: ${text}`,
          },
        ],
        json_schema: {
          name: "learning_content",
          schema: {
            type: "object",
            properties: {
              lessons: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    word: { type: "string" },
                    translation: { type: "string" },
                    options: {
                      type: "array",
                      items: { type: "string" },
                    },
                    level: { type: "number" },
                  },
                  required: ["word", "translation", "options", "level"],
                  additionalProperties: false,
                },
              },
            },
            required: ["lessons"],
            additionalProperties: false,
          },
        },
        stream: true,
      }),
    });
    handleStreamResponse(gptResponse);
  };

  const handleGoogleSheets = async (url) => {
    setIsLoading(true);
    const response = await fetch("/integrations/web-scraping/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        getText: true,
      }),
    });
    const text = await response.text();

    const gptResponse = await fetch("/integrations/chat-gpt/conversationgpt4", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: `Convert these questions into a multiple choice quiz format with 4 options per question, where one is correct: ${text}`,
          },
        ],
        json_schema: {
          name: "learning_content",
          schema: {
            type: "object",
            properties: {
              lessons: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    word: { type: "string" },
                    translation: { type: "string" },
                    options: {
                      type: "array",
                      items: { type: "string" },
                    },
                    level: { type: "number" },
                  },
                  required: ["word", "translation", "options", "level"],
                  additionalProperties: false,
                },
              },
            },
            required: ["lessons"],
            additionalProperties: false,
          },
        },
        stream: true,
      }),
    });
    handleStreamResponse(gptResponse);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] p-4 font-roboto flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#58cc02] mx-auto mb-4"></div>
          <p className="text-lg">Creating your learning game...</p>
        </div>
      </div>
    );
  }

  if (!showGame || !lessons.length) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] p-4 font-roboto">
        <div className="max-w-md mx-auto pt-20">
          <h1 className="text-4xl font-bold text-center mb-12">
            Homework Game
          </h1>
          <div className="space-y-6">
            <button
              onClick={handleScrapeQuestions}
              className="w-full bg-[#58cc02] text-white px-6 py-4 rounded-xl hover:bg-[#4fb102] text-xl"
            >
              Load Questions
            </button>
            <button
              onClick={() => setShowGame(true)}
              className="w-full bg-[#58cc02] text-white px-6 py-4 rounded-xl hover:bg-[#4fb102] text-xl"
            >
              Start Learning
            </button>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.txt,.csv"
                className="hidden"
                id="file-upload"
                name="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="w-full bg-white border-2 border-[#58cc02] text-[#58cc02] px-6 py-4 rounded-xl hover:bg-[#f7f7f7] block text-center cursor-pointer text-xl"
              >
                Upload File to Learn
              </label>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter Google Sheets URL"
                className="w-full border-2 border-[#58cc02] text-[#58cc02] px-6 py-4 rounded-xl"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleGoogleSheets(e.target.value);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-4 font-roboto">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => setShowGame(false)}
            className="text-[#58cc02] hover:text-[#4fb102]"
          >
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <div className="flex items-center">
            <i className="fas fa-star text-yellow-400 mr-2"></i>
            <span className="text-lg">{score} points</span>
          </div>
          <div className="text-lg">Level {level}</div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">
              {lessons[currentQuestion]?.word}
            </h2>
            <p className="text-gray-600">Select the correct translation</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {lessons[currentQuestion]?.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`p-4 rounded-full text-center transition-colors
                  ${
                    selectedAnswer === option
                      ? isCorrect
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                      : "bg-[#e5e7eb] hover:bg-[#d1d5db]"
                  }`}
              >
                {option}
              </button>
            ))}
          </div>

          {selectedAnswer && (
            <div className="mt-6 text-center">
              {isCorrect ? (
                <div className="text-green-500 text-xl mb-4">
                  <i className="fas fa-check-circle mr-2"></i>
                  Correct!
                </div>
              ) : (
                <div className="text-red-500 text-xl mb-4">
                  <i className="fas fa-times-circle mr-2"></i>
                  Try again
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MainComponent;
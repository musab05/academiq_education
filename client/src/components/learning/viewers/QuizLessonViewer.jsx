import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { lessonAPI, progressAPI } from "../../../services/api";
import { useNotification } from "../../../context/NotificationContext";
import LessonNavigation from "../LessonNavigation";

const QuizLessonViewer = ({
  lesson,
  onProgressUpdate,
  onNextLesson,
  onPreviousLesson,
  hasNext,
  hasPrevious,
}) => {
  const { showNotification } = useNotification();
  const [lessonData, setLessonData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [originalQuestions, setOriginalQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizSettings, setQuizSettings] = useState({});
  const [quizProgress, setQuizProgress] = useState(null);

  useEffect(() => {
    if (lesson?._id) {
      // Reset state when lesson changes
      setLessonData(null);
      setQuestions([]);
      setOriginalQuestions([]);
      setLoading(true);
      setCurrentQuestion(0);
      setSelectedAnswers({});
      setShowResults(false);
      setQuizProgress(null);

      fetchLessonData();
      fetchProgress();
    }
  }, [lesson?._id]);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const fetchLessonData = async () => {
    try {
      setLoading(true);
      const [lessonResponse, questionsResponse] = await Promise.all([
        lessonAPI.getQuizActivity(lesson._id),
        lessonAPI.getQuestions(lesson._id),
      ]);

      const activity = lessonResponse.data.activity;
      setLessonData(activity);
      setQuizSettings({
        shuffleQuestions: activity?.shuffleQuestions || false,
        shuffleOptions: activity?.shuffleOptions || false,
        showResults: activity?.showResults !== false,
      });

      let fetchedQuestions = questionsResponse.data.questions || [];
      setOriginalQuestions(fetchedQuestions);

      // Shuffle questions if enabled
      if (activity?.shuffleQuestions) {
        fetchedQuestions = shuffleArray(fetchedQuestions);
      }

      // Shuffle options if enabled
      if (activity?.shuffleOptions) {
        fetchedQuestions = fetchedQuestions.map((q) => {
          if (q.options && q.options.length > 0) {
            const optionsWithIndices = q.options.map((opt, idx) => ({
              text: opt,
              originalIndex: idx,
            }));
            const shuffledOptions = shuffleArray(optionsWithIndices);
            return {
              ...q,
              options: shuffledOptions.map((o) => o.text),
              optionMapping: shuffledOptions.map((o) => o.originalIndex),
            };
          }
          return q;
        });
      }

      setQuestions(fetchedQuestions);
    } catch (error) {
      console.error("Error fetching quiz lesson:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await progressAPI.getQuizProgress(lesson._id);
      setQuizProgress(response.data);
    } catch (error) {
      console.error("Error fetching quiz progress:", error);
    }
  };

  const handleRetake = async () => {
    setShowResults(false);
    setSelectedAnswers({});
    setCurrentQuestion(0);
    setQuizProgress(null);
    await fetchLessonData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    const question = questions[questionIndex];

    if (question.type === "multi-select") {
      const current = selectedAnswers[questionIndex] || [];
      const updated = current.includes(answerIndex)
        ? current.filter((i) => i !== answerIndex)
        : [...current, answerIndex];
      setSelectedAnswers({ ...selectedAnswers, [questionIndex]: updated });
    } else {
      setSelectedAnswers({ ...selectedAnswers, [questionIndex]: answerIndex });
    }
  };

  const handleSubmit = async () => {
    try {
      const answers = Object.entries(selectedAnswers).map(
        ([questionIndex, selectedAnswer]) => ({
          questionId: questions[questionIndex]._id,
          selectedAnswer,
        }),
      );

      // Map shuffled answers back to original indices
      const mappedAnswers = answers.map((answer) => {
        const question = questions.find((q) => q._id === answer.questionId);
        if (question?.optionMapping) {
          const originalIndex = question.optionMapping[answer.selectedAnswer];
          return { ...answer, selectedAnswer: originalIndex };
        }
        return answer;
      });

      const response = await progressAPI.submitQuiz(lesson._id, mappedAnswers);
      setQuizProgress(response.data.attempt);

      if (quizSettings.showResults) {
        setShowResults(true);
      } else {
        showNotification({
          type: "success",
          message: `Quiz submitted! Score: ${response.data.score}%`,
        });
      }

      window.dispatchEvent(new Event("lessonCompleted"));

      if (onProgressUpdate) {
        onProgressUpdate();
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      const userAnswer = selectedAnswers[index];
      const correctAnswers = question.correctAnswers || [];

      if (question.type === "multi-select") {
        const userAnswerArray = Array.isArray(userAnswer) ? userAnswer : [];
        const correctIndices = correctAnswers.map((ans) =>
          question.options.indexOf(ans),
        );
        const isCorrect =
          correctIndices.length === userAnswerArray.length &&
          correctIndices.every((idx) => userAnswerArray.includes(idx));
        if (isCorrect) correct++;
      } else if (question.type === "fill-blank") {
        if (
          correctAnswers.some(
            (ans) =>
              ans.toLowerCase().trim() ===
              String(userAnswer).toLowerCase().trim(),
          )
        ) {
          correct++;
        }
      } else {
        const correctIndex = question.options.indexOf(correctAnswers[0]);
        if (correctIndex === userAnswer) {
          correct++;
        }
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const isAnswerCorrect = (questionIndex, answerIndex) => {
    const question = questions[questionIndex];
    const correctAnswers = question.correctAnswers || [];
    const correctIndices = correctAnswers.map((ans) =>
      question.options.indexOf(ans),
    );
    return correctIndices.includes(answerIndex);
  };

  const getAnswerStatus = (questionIndex, answerIndex) => {
    if (!showResults) return null;

    const isSelected = selectedAnswers[questionIndex] === answerIndex;
    const isCorrect = isAnswerCorrect(questionIndex, answerIndex);

    if (isCorrect) return "correct";
    if (isSelected && !isCorrect) return "incorrect";
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6 lg:p-8"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {lesson.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Quiz Lesson
          </span>
          <span>{questions.length} Questions</span>
          {showResults && (
            <span className="flex items-center gap-1 text-orange-600 font-medium">
              Score: {calculateScore()}%
            </span>
          )}
        </div>
      </div>

      {quizProgress?.isCompleted &&
      !showResults &&
      Object.keys(selectedAnswers).length === 0 ? (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <CheckCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Quiz Completed!
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              Best Score: {quizProgress.bestScore}%
            </p>
            <p className="text-gray-500 mb-6">
              Attempts: {quizProgress.attempts?.length || 0}
            </p>
            <button
              onClick={handleRetake}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Retake Quiz
            </button>
          </div>
          <LessonNavigation
            onNextLesson={onNextLesson}
            onPreviousLesson={onPreviousLesson}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
          />
        </div>
      ) : !showResults ? (
        <div className="space-y-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Progress
              </span>
              <span className="text-sm text-gray-600">
                {Object.keys(selectedAnswers).length} of {questions.length}{" "}
                answered
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(Object.keys(selectedAnswers).length / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {questions.map((question, questionIndex) => (
            <div
              key={`quiz-question-${questionIndex}`}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Question {questionIndex + 1}: {question.question}
              </h3>

              <div className="space-y-3">
                {question.options.map((option, optionIndex) => (
                  <label
                    key={`question-${questionIndex}-option-${optionIndex}`}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      (
                        question.type === "multi-select"
                          ? (selectedAnswers[questionIndex] || []).includes(
                              optionIndex,
                            )
                          : selectedAnswers[questionIndex] === optionIndex
                      )
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type={
                        question.type === "multi-select" ? "checkbox" : "radio"
                      }
                      name={`question-${questionIndex}`}
                      value={optionIndex}
                      checked={
                        question.type === "multi-select"
                          ? (selectedAnswers[questionIndex] || []).includes(
                              optionIndex,
                            )
                          : selectedAnswers[questionIndex] === optionIndex
                      }
                      onChange={() =>
                        handleAnswerSelect(questionIndex, optionIndex)
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 ${question.type === "multi-select" ? "rounded" : "rounded-full"} border-2 mr-3 flex items-center justify-center ${
                        (
                          question.type === "multi-select"
                            ? (selectedAnswers[questionIndex] || []).includes(
                                optionIndex,
                              )
                            : selectedAnswers[questionIndex] === optionIndex
                        )
                          ? "border-orange-500 bg-orange-500"
                          : "border-gray-300"
                      }`}
                    >
                      {(question.type === "multi-select"
                        ? (selectedAnswers[questionIndex] || []).includes(
                            optionIndex,
                          )
                        : selectedAnswers[questionIndex] === optionIndex) && (
                        <div
                          className={`w-2 h-2 bg-white ${question.type === "multi-select" ? "rounded-sm" : "rounded-full"}`}
                        />
                      )}
                    </div>
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={
                Object.keys(selectedAnswers).length !== questions.length
              }
              className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Submit Quiz
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="mb-4">
              {calculateScore() >= 70 ? (
                <CheckCircle className="w-16 h-16 text-orange-500 mx-auto" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500 mx-auto" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Quiz Complete!
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              Your Score: {calculateScore()}% (
              {
                Object.values(selectedAnswers).filter(
                  (answer, index) => answer === questions[index].correct,
                ).length
              }{" "}
              out of {questions.length} correct)
            </p>
            {calculateScore() >= 70 ? (
              <p className="text-orange-600 font-medium">
                Great job! You passed the quiz.
              </p>
            ) : (
              <p className="text-red-600 font-medium">
                You need 70% to pass. Please review the material and try again.
              </p>
            )}
          </div>

          {questions.map((question, questionIndex) => (
            <div
              key={`result-question-${questionIndex}`}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Question {questionIndex + 1}: {question.question}
              </h3>

              <div className="space-y-3">
                {question.options.map((option, optionIndex) => {
                  const status = getAnswerStatus(questionIndex, optionIndex);
                  return (
                    <div
                      key={`result-${questionIndex}-${optionIndex}`}
                      className={`flex items-center p-4 border rounded-lg ${
                        status === "correct"
                          ? "border-orange-500 bg-orange-50"
                          : status === "incorrect"
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200"
                      }`}
                    >
                      <div className="mr-3">
                        {status === "correct" && (
                          <CheckCircle className="w-5 h-5 text-orange-500" />
                        )}
                        {status === "incorrect" && (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        {!status && <div className="w-5 h-5" />}
                      </div>
                      <span
                        className={`${
                          status === "correct"
                            ? "text-orange-700"
                            : status === "incorrect"
                              ? "text-red-700"
                              : "text-gray-700"
                        }`}
                      >
                        {option}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex justify-center">
            <button
              onClick={handleRetake}
              className="px-6 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition-colors"
            >
              Retake Quiz
            </button>
          </div>

          <LessonNavigation
            onNextLesson={onNextLesson}
            onPreviousLesson={onPreviousLesson}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
          />
        </div>
      )}
    </motion.div>
  );
};

export default QuizLessonViewer;

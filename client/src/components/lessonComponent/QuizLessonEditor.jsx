import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Header from "../Header";
import { lessonAPI } from "../../services/api";
import { useNotification } from "../../context/NotificationContext";
import QuestionCard from "./quiz/QuestionCard";
import QuestionList from "./quiz/QuestionList";
import QuizSidebar from "./quiz/QuizSidebar";
import QuizAIAssistant from "./QuizAIAssistant";

const QuizLessonEditor = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [lessonTitle, setLessonTitle] = useState("");
  const [courseId, setCourseId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [quizSettings, setQuizSettings] = useState({
    timeLimit: null,
    passingScore: 70,
    allowRetakes: true,
    maxAttempts: 3,
    shuffleQuestions: false,
    shuffleOptions: false,
    showResults: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const debounceRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    fetchLesson();
  }, [lessonId, pagination.page, searchTerm]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (questions.length > 0) {
        saveDraft();
      }
    }, 2000);
  }, [questions]);

  const fetchLesson = async () => {
    try {
      const response = await lessonAPI.getQuizActivity(lessonId);
      setLessonTitle(response.data.lesson.title);
      setCourseId(typeof response.data.lesson.course === 'object' ? response.data.lesson.course._id : response.data.lesson.course);
      const activity = response.data.activity || {};

      // Fetch paginated questions
      const questionsResponse = await lessonAPI.getQuestions(lessonId, {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
      });

      setQuestions(questionsResponse.data.questions || []);
      setPagination((prev) => ({
        ...prev,
        total: questionsResponse.data.total || 0,
      }));

      setQuizSettings({
        timeLimit: activity.timeLimit,
        passingScore: activity.passingScore || 70,
        allowRetakes: activity.allowRetakes !== false,
        maxAttempts: activity.maxAttempts || 3,
        shuffleQuestions: activity.shuffleQuestions || false,
        shuffleOptions: activity.shuffleOptions || false,
        showResults: activity.showResults !== false,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching lesson:", error);
      showNotification({
        type: 'error',
        message: 'Failed to load lesson data'
      });
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await lessonAPI.updateQuizActivity(lessonId, {
        questions,
        ...quizSettings,
        isDraft: false,
      });
      setSavedQuestions([...questions]);
      showNotification({
        type: 'success',
        message: 'Quiz published successfully!'
      });
    } catch (error) {
      console.error("Error publishing quiz:", error);
      const errorMessage =
        error.response?.data?.error || "Error publishing quiz";
      showNotification({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRevert = () => {
    setQuestions([...savedQuestions]);
  };

  const handleTitleChange = async (newTitle) => {
    setLessonTitle(newTitle);
    try {
      await lessonAPI.updateLesson(lessonId, { title: newTitle });
    } catch (error) {
      console.error("Error updating title:", error);
      showNotification({
        type: 'error',
        message: 'Failed to update lesson title'
      });
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const addQuestion = (type = "single-select") => {
    const newQuestion = {
      id: Date.now().toString(),
      type: type,
      question: "",
      options:
        type === "single-select" || type === "multi-select"
          ? ["Option 1", "Option 2"]
          : [],
      correctAnswers: type === "true-false" ? ["true"] : [],
      points: 1,
      correctFeedback: "Correct! Well done.",
      incorrectFeedback: "Incorrect. Please review the material and try again.",
      order: questions.length,
    };
    setQuestions([...questions, newQuestion]);
    setEditingQuestion(newQuestion); // Automatically open for editing
  };

  const saveDraft = async () => {
    try {
      await lessonAPI.updateQuizActivity(lessonId, {
        questions,
        ...quizSettings,
        isDraft: true,
      });
    } catch (error) {
      console.error("Error saving draft:", error);
      showNotification({
        type: 'error',
        message: 'Failed to auto-save draft'
      });
    }
  };

  const saveQuestion = async (question) => {
    try {
      const updatedQuestions = questions.map((q) =>
        q.id === question.id ? question : q
      );
      setQuestions(updatedQuestions);

      await lessonAPI.updateQuizActivity(lessonId, {
        questions: updatedQuestions,
        ...quizSettings,
        isDraft: true,
      });
      showNotification({
        type: 'success',
        message: 'Question saved to draft!'
      });
    } catch (error) {
      console.error("Error saving question:", error);
      showNotification({
        type: 'error',
        message: 'Failed to save question'
      });
    }
  };

  const revertQuestion = (questionId) => {
    // Revert to last saved state from savedQuestions
    const savedQuestion = savedQuestions.find((q) => q.id === questionId);
    if (savedQuestion) {
      setQuestions(
        questions.map((q) => (q.id === questionId ? { ...savedQuestion } : q))
      );
    }
  };

  const handleEditQuestion = (questionId) => {
    const question = questions.find((q) => q.id === questionId);
    setEditingQuestion(question);
  };

  const handleCloseEdit = () => {
    setEditingQuestion(null);
  };

  const handleSaveAndClose = async (question) => {
    await saveQuestion(question);
    setEditingQuestion(null);
  };

  const updateQuestion = (questionId, updates) => {
    setQuestions(
      questions.map((q) => (q.id === questionId ? { ...q, ...updates } : q))
    );
  };

  const deleteQuestion = (questionId) => {
    setQuestions(questions.filter((q) => q.id !== questionId));
  };

  const handleQuestionsGenerated = (newQuestions) => {
    const questionsWithOrder = newQuestions.map((q, idx) => ({
      ...q,
      order: questions.length + idx
    }));
    setQuestions([...questions, ...questionsWithOrder]);
    showNotification({
      type: 'success',
      message: `${newQuestions.length} questions generated successfully!`
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Header
        mode="lesson-edit"
        lessonTitle={lessonTitle}
        onLessonTitleChange={handleTitleChange}
        onSave={handleSave}
        saving={saving}
        onRevert={handleRevert}
        onBack={handleBack}
      />

      <div className="flex-1 flex bg-gray-50 overflow-hidden">
        <QuizSidebar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          addQuestion={addQuestion}
          questions={questions}
          pagination={pagination}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          quizSettings={quizSettings}
          setQuizSettings={setQuizSettings}
        />

        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {questions.length === 0 ? (
              <div className="text-center py-12">
                <Plus className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No questions yet
                </h3>
                <p className="text-gray-500">
                  Add questions to start building your quiz
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Questions ({questions.length})
                  </h2>
                </div>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={questions.map((q) => q.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {editingQuestion ? (
                      <div className="mb-4 sm:mb-6">
                        <div className="flex items-center justify-between mb-4 gap-2">
                          <h3 className="text-base sm:text-lg font-medium truncate">
                            Editing Question{" "}
                            {questions.findIndex(
                              (q) => q.id === editingQuestion.id
                            ) + 1}
                          </h3>
                          <button
                            onClick={handleCloseEdit}
                            className="tap-target px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded hover:bg-gray-50 whitespace-nowrap"
                          >
                            Back to List
                          </button>
                        </div>
                        <QuestionCard
                          question={editingQuestion}
                          questionIndex={questions.findIndex(
                            (q) => q.id === editingQuestion.id
                          )}
                          onUpdate={updateQuestion}
                          onDelete={deleteQuestion}
                          onSave={handleSaveAndClose}
                          onRevert={revertQuestion}
                        />
                      </div>
                    ) : (
                      <QuestionList
                        questions={questions}
                        onEdit={handleEditQuestion}
                        onDelete={deleteQuestion}
                      />
                    )}
                  </SortableContext>
                </DndContext>
              </>
            )}

            {pagination.total > pagination.limit && (
              <div className="flex justify-center gap-2 mt-4 sm:mt-6">
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.max(1, prev.page - 1),
                    }))
                  }
                  disabled={pagination.page === 1}
                  className="tap-target px-3 py-1 border rounded text-xs sm:text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-xs sm:text-sm">
                  Page {pagination.page} of{" "}
                  {Math.ceil(pagination.total / pagination.limit)}
                </span>
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.min(
                        Math.ceil(pagination.total / pagination.limit),
                        prev.page + 1
                      ),
                    }))
                  }
                  disabled={
                    pagination.page >=
                    Math.ceil(pagination.total / pagination.limit)
                  }
                  className="tap-target px-3 py-1 border rounded text-xs sm:text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <QuizAIAssistant
        lessonId={lessonId}
        courseId={courseId}
        questions={questions}
        onQuestionsGenerated={handleQuestionsGenerated}
      />
    </div>
  );
};

export default QuizLessonEditor;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

const AdminQuizEdit = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("dv-token");

  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState({
    title: "",
    questions: [],
  });

  // Fetch quiz details
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/v1/quiz/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const formattedQuestions = res.data.data.questions.map((q) => ({
          ...q,
          tempId: uuidv4(),
          options: q.options.map((o) => ({ ...o, tempId: uuidv4() })),
        }));
        setQuiz({ ...res.data.data, questions: formattedQuestions });
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch quiz");
      }
    };
    fetchQuiz();
  }, [quizId, token]);

  // Handlers
  const handleTitleChange = (e) => setQuiz({ ...quiz, title: e.target.value });

  const handleQuestionChange = (qIndex, value) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[qIndex].questionText = value;
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const handleOptionChange = (qIndex, oIndex, key, value) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[qIndex].options[oIndex][key] = value;
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  // 🆕 Add Question
  const addQuestion = () => {
    setQuiz((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionText: "",
          options: [{ text: "", isCorrect: false, tempId: uuidv4() }],
          tempId: uuidv4(),
        },
      ],
    }));
  };

  // 🆕 Add Option
  const addOption = (qIndex) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[qIndex].options.push({ text: "", isCorrect: false, tempId: uuidv4() });
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  // ❌ Remove Question
  const removeQuestion = (index) => {
    const updatedQuestions = quiz.questions.filter((_, i) => i !== index);
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  // ❌ Remove Option
  const removeOption = (qIndex, oIndex) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[qIndex].options.splice(oIndex, 1);
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  // Submit updated quiz
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(
        `http://localhost:4000/api/v1/quiz/update/${quizId}`,
        quiz,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Quiz updated successfully!");
      navigate("/admin/quiz");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Edit Quiz</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quiz Title */}
        <div>
          <label className="block font-medium mb-1">Quiz Title</label>
          <input
            type="text"
            value={quiz.title}
            onChange={handleTitleChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        {/* Questions Section */}
        <div>
          {quiz.questions.length === 0 && (
            <p className="text-gray-500 mb-2">No questions yet. Add one below 👇</p>
          )}

          {quiz.questions.map((q, qIndex) => (
            <div key={q.tempId} className="border p-4 rounded space-y-3 bg-white shadow relative">
              <button
                type="button"
                className="absolute top-2 right-2 text-red-600 font-bold"
                onClick={() => removeQuestion(qIndex)}
              >
                ✖
              </button>

              <input
                type="text"
                value={q.questionText}
                onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                placeholder={`Question ${qIndex + 1}`}
                className="border p-2 rounded w-full"
                required
              />

              {/* Options */}
              {q.options.map((opt, oIndex) => (
                <div key={opt.tempId} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) =>
                      handleOptionChange(qIndex, oIndex, "text", e.target.value)
                    }
                    placeholder={`Option ${oIndex + 1}`}
                    className="border p-2 rounded flex-1"
                    required
                  />
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={opt.isCorrect}
                      onChange={(e) =>
                        handleOptionChange(qIndex, oIndex, "isCorrect", e.target.checked)
                      }
                    />
                    Correct
                  </label>
                  <button
                    type="button"
                    className="text-red-600"
                    onClick={() => removeOption(qIndex, oIndex)}
                  >
                    Delete
                  </button>
                </div>
              ))}

              {/* ✅ Add Option Button */}
              <button
                type="button"
                className="mt-2 px-3 py-1 bg-green-500 text-white rounded"
                onClick={() => addOption(qIndex)}
              >
                ➕ Add Option
              </button>
            </div>
          ))}

          {/* ✅ Add Question Button (Always visible) */}
          <div className="flex justify-center mt-4">
            <button
              type="button"
              onClick={addQuestion}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              ➕ Add Question
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className={`px-4 py-2 bg-green-600 text-white rounded flex items-center ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Quiz"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminQuizEdit;

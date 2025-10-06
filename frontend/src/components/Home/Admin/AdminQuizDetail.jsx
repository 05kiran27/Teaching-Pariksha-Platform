import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FiMoreVertical } from "react-icons/fi";
import { v4 as uuidv4 } from "uuid";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const AdminQuizDetail = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("dv-token");

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editQuizData, setEditQuizData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // ✅

  // Fetch quiz detail
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/v1/quiz/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const formatted = {
          ...res.data.data,
          questions: res.data.data.questions.map((q) => ({
            ...q,
            tempId: uuidv4(),
            options: q.options.map((o) => ({ ...o, tempId: uuidv4() })),
          })),
        };
        setQuiz(formatted);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch quiz");
      }
    };
    fetchQuiz();
  }, [quizId, token]);

  // Save updated quiz
  const handleSave = async () => {
    try {
      setLoading(true);
      await axios.put(
        `${BACKEND_URL}/api/v1/quiz/update/${quizId}`,
        editQuizData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Quiz updated successfully!");
      setEditMode(false);
      setMenuOpen(false);
      navigate("/admin");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update quiz");
    } finally {
      setLoading(false);
    }
  };

  // Delete quiz
  const handleDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`${BACKEND_URL}/api/v1/quiz/delete/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Quiz deleted successfully!");
      navigate("/admin");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete quiz");
    } finally {
      setLoading(false);
      setShowDeleteModal(false); // close modal
    }
  };

  // Add question
  const addQuestion = () => {
    setEditQuizData((prev) => ({
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

  // Remove question
  const removeQuestion = (index) => {
    const updated = editQuizData.questions.filter((_, i) => i !== index);
    setEditQuizData({ ...editQuizData, questions: updated });
  };

  // Add option
  const addOption = (qIndex) => {
    const updated = [...editQuizData.questions];
    updated[qIndex].options.push({ text: "", isCorrect: false, tempId: uuidv4() });
    setEditQuizData({ ...editQuizData, questions: updated });
  };

  // Remove option
  const removeOption = (qIndex, oIndex) => {
    const updated = [...editQuizData.questions];
    updated[qIndex].options.splice(oIndex, 1);
    setEditQuizData({ ...editQuizData, questions: updated });
  };

  if (!quiz) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Title + Menu */}
      <div className="flex justify-between items-center mb-4">
        {editMode ? (
          <input
            type="text"
            value={editQuizData.title}
            onChange={(e) => setEditQuizData({ ...editQuizData, title: e.target.value })}
            className="border p-2 rounded w-full mr-4"
          />
        ) : (
          <h2 className="text-2xl font-bold">{quiz.title}</h2>
        )}
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            <FiMoreVertical size={24} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 bg-white border rounded shadow z-20">
              <button
                onClick={() => {
                  setEditMode(true);
                  setEditQuizData(quiz);
                  setMenuOpen(false);
                }}
                className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(true); // ✅ open custom modal
                  setMenuOpen(false);
                }}
                className="block px-4 py-2 hover:bg-gray-100 text-red-600 w-full text-left"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {(editMode ? editQuizData.questions : quiz.questions).map((q, qIdx) => (
          <div key={q.tempId || q._id} className="border rounded p-4 bg-white shadow">
            {editMode ? (
              <>
                <div className="flex justify-between items-center mb-2">
                  <input
                    type="text"
                    value={q.questionText}
                    onChange={(e) => {
                      const updated = [...editQuizData.questions];
                      updated[qIdx].questionText = e.target.value;
                      setEditQuizData({ ...editQuizData, questions: updated });
                    }}
                    placeholder={`Question ${qIdx + 1}`}
                    className="border p-2 rounded w-full"
                  />
                  <button
                    type="button"
                    className="text-red-600 ml-2"
                    onClick={() => removeQuestion(qIdx)}
                  >
                    Delete
                  </button>
                </div>

                {q.options.map((opt, oIdx) => (
                  <div key={opt.tempId || opt._id} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => {
                        const updated = [...editQuizData.questions];
                        updated[qIdx].options[oIdx].text = e.target.value;
                        setEditQuizData({ ...editQuizData, questions: updated });
                      }}
                      placeholder={`Option ${oIdx + 1}`}
                      className="border p-2 rounded flex-1"
                    />
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={opt.isCorrect}
                        onChange={(e) => {
                          const updated = [...editQuizData.questions];
                          updated[qIdx].options[oIdx].isCorrect = e.target.checked;
                          setEditQuizData({ ...editQuizData, questions: updated });
                        }}
                      />
                      Correct
                    </label>
                    <button
                      type="button"
                      className="text-red-600"
                      onClick={() => removeOption(qIdx, oIdx)}
                    >
                      Delete
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="mt-2 px-3 py-1 bg-green-500 text-white rounded"
                  onClick={() => addOption(qIdx)}
                >
                  ➕ Add Option
                </button>
              </>
            ) : (
              <>
                <p className="font-semibold mb-2">
                  {qIdx + 1}. {q.questionText}
                </p>
                <ul className="ml-4 space-y-1">
                  {q.options.map((opt) => (
                    <li key={opt._id || opt.tempId}>
                      {opt.text} {opt.isCorrect && <span className="text-green-600 font-medium">(Correct)</span>}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add Question */}
      {editMode && (
        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={addQuestion}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            ➕ Add Question
          </button>
        </div>
      )}

      {/* Save / Cancel */}
      {editMode && (
        <div className="mt-6 flex gap-2">
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={() => setEditMode(false)}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      {/* ✅ Custom Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-4">Are you sure you want to delete this quiz?</h3>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowDeleteModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuizDetail;

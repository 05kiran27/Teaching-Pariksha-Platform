import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { PlusCircle, CheckCircle, Circle } from "lucide-react";
import { useNavigate } from "react-router-dom"; // ✅ added for redirect

const AdminQuizCreator = () => {
  const token = localStorage.getItem("dv-token");
  const navigate = useNavigate(); // ✅ initialize navigation

  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([
    { text: "", options: [{ text: "", isCorrect: false }] },
  ]);
  const [loading, setLoading] = useState(false);

  // Handle typing a question
  const handleQuestionChange = (index, value) => {
    const updated = [...questions];
    updated[index].text = value;
    setQuestions(updated);

    if (index === questions.length - 1 && value.trim() !== "") {
      setQuestions([
        ...updated,
        { text: "", options: [{ text: "", isCorrect: false }] },
      ]);
    }
  };

  // Handle typing an option
  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex].text = value;
    setQuestions(updated);

    const lastOption =
      updated[qIndex].options[updated[qIndex].options.length - 1];
    if (oIndex === updated[qIndex].options.length - 1 && value.trim() !== "") {
      updated[qIndex].options.push({ text: "", isCorrect: false });
      setQuestions(updated);
    }
  };

  // Mark correct answer
  const toggleCorrect = (qIndex, oIndex) => {
    const updated = [...questions];
    updated[qIndex].options = updated[qIndex].options.map((opt, i) => ({
      ...opt,
      isCorrect: i === oIndex,
    }));
    setQuestions(updated);
  };

  // Submit quiz
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Quiz title is required!");
      return;
    }

    // Clean questions
    const cleanedQuestions = questions
      .filter((q) => q.text.trim() !== "")
      .map((q) => ({
        questionText: q.text.trim(),
        options: q.options
          .filter((o) => o.text.trim() !== "")
          .map((o) => ({
            text: o.text.trim(),
            isCorrect: o.isCorrect,
          })),
      }));

    // Validate each question has a correct option
    for (const q of cleanedQuestions) {
      if (!q.options.some((o) => o.isCorrect)) {
        toast.error(`Question "${q.questionText}" must have a correct answer!`);
        return;
      }
    }

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:4000/api/v1/quiz/create",
        { title, questions: cleanedQuestions },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success("🎉 Quiz created successfully!");
        setTitle("");
        setQuestions([{ text: "", options: [{ text: "", isCorrect: false }] }]);

        // ✅ Redirect to Admin page after short delay
        setTimeout(() => {
          navigate("/admin");
        }, 1000);
      }
    } catch (err) {
      console.error("❌ Error creating quiz:", err);
      toast.error("Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 p-6">
      <h2 className="text-2xl font-semibold mb-6">🧠 Create a Quiz</h2>

      <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-2xl">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Quiz Title..."
          className="w-full mb-4 border-b border-gray-300 focus:border-blue-500 focus:outline-none p-2 text-gray-800 text-lg"
        />

        {questions.map((q, qIndex) => (
          <div
            key={qIndex}
            className="mb-8 border-b border-gray-200 pb-4 transition-all duration-300"
          >
            {/* Question Input */}
            <div className="flex items-center gap-3 mb-3">
              <span className="font-medium text-gray-600">{qIndex + 1}.</span>
              <input
                type="text"
                value={q.text}
                onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                placeholder="Enter your question..."
                className="flex-1 border-b border-gray-300 focus:border-blue-500 focus:outline-none p-1 text-gray-800 text-lg transition-all"
              />
            </div>

            {/* Options */}
            <div className="ml-8 space-y-2">
              {q.options.map((opt, oIndex) => (
                <div
                  key={oIndex}
                  className="flex items-center gap-3 transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleCorrect(qIndex, oIndex)}
                    className="text-gray-400 hover:text-green-500 transition-colors"
                  >
                    {opt.isCorrect ? (
                      <CheckCircle size={20} className="text-green-500" />
                    ) : (
                      <Circle size={20} />
                    )}
                  </button>
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) =>
                      handleOptionChange(qIndex, oIndex, e.target.value)
                    }
                    placeholder={`Option ${oIndex + 1}`}
                    className="flex-1 border-b border-gray-300 focus:border-blue-500 focus:outline-none p-1 text-gray-700"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-4 flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            <PlusCircle size={20} /> {loading ? "Submitting..." : "Submit Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminQuizCreator;

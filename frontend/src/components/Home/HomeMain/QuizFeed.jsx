import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const QuizFeed = () => {
  const [quizzes, setQuizzes] = useState([]);
  const { authUser } = useAuthContext();
  const navigate = useNavigate();
  const token = localStorage.getItem("dv-token");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/v1/quiz/getALL", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuizzes(res.data.data);
      } catch (err) {
        console.error("Failed to fetch quizzes", err);
      }
    };
    fetchQuizzes();
  }, [token]);

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4">Available Quizzes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div
            key={quiz._id}
            className="border rounded-lg p-4 shadow hover:shadow-lg cursor-pointer"
            onClick={() => navigate(`/quiz/${quiz._id}`)}
          >
            {quiz.createdBy && (
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={quiz.createdBy.images || "/default-avatar.png"}
                  alt={`${quiz.createdBy.firstName} ${quiz.createdBy.lastName}`}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm text-gray-600">
                  {quiz.createdBy.firstName} {quiz.createdBy.lastName}
                </span>
              </div>
            )}
            <p className="font-bold text-lg">{quiz.title}</p>
            <p className="text-gray-500 text-sm">{quiz.questions.length} questions</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizFeed;

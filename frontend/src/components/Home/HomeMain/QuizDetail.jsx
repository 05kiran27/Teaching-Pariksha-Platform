import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

const QuizDetail = () => {
  const { id } = useParams(); // <--- get quizId from URL
  const [quiz, setQuiz] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [disabledOptions, setDisabledOptions] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = localStorage.getItem("dv-token");
        const res = await axios.get(
          `https://dev-iu10.onrender.com/api/v1/quiz/${id}`, // use id from useParams
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setQuiz(res.data.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load quiz");
      }
    };
    if (id) fetchQuiz(); // only fetch if id exists
  }, [id]);

  if (!quiz) return <p>Loading quiz...</p>;

  const question = quiz.questions[currentQIndex];

  const handleOptionSelect = (option) => {
    if (disabledOptions.includes(option._id)) return;

    setSelectedOption(option._id);

    if (option.isCorrect) {
      setPopupMessage("🎉 Correct! Well done!");
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        setSelectedOption(null);
        setDisabledOptions([]);
        if (currentQIndex < quiz.questions.length - 1) {
          setCurrentQIndex(currentQIndex + 1);
        } else {
          toast.success("🎉 You completed the quiz!");
          navigate("/quiz"); // redirect after finishing last question
        }
      }, 1500);
    } else {
      setPopupMessage("😢 Ohh hoo, try once more!");
      setShowPopup(true);
      setDisabledOptions([...disabledOptions, option._id]);
      setTimeout(() => setShowPopup(false), 1500);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{quiz.title}</h2>
      <div className="bg-white p-4 rounded shadow mb-4">
        <p className="text-lg font-medium">
          Question {currentQIndex + 1}/{quiz.questions.length}
        </p>
        <p className="mt-2 mb-4">{question.questionText}</p>
        <ul className="space-y-2">
          {question.options.map((option) => (
            <li
              key={option._id}
              onClick={() => handleOptionSelect(option)}
              className={`p-2 rounded border cursor-pointer ${
                disabledOptions.includes(option._id)
                  ? "bg-red-200 cursor-not-allowed"
                  : selectedOption === option._id && option.isCorrect
                  ? "bg-green-200"
                  : "hover:bg-gray-100"
              }`}
            >
              {option.text}
            </li>
          ))}
        </ul>
      </div>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black bg-opacity-40" />
          <div className="bg-white p-6 rounded shadow-lg z-50">
            <p className="text-lg font-bold">{popupMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizDetail;

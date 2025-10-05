// routes/quizRoutes.js
const express = require("express");
const router = express.Router();
const { createQuiz, getAllQuizzes, getQuizById, updateQuiz, deleteQuiz, getAllQuizzesNormalUser, getQuizByIdNormalUser } = require("../controllers/quizController");
const { auth, isAdmin } = require("../middleware/auth");

// 🧠 Create a new quiz (Admin only)
router.post("/create", auth, isAdmin, createQuiz);

// 📋 Get all quizzes
router.get("/getAll", auth, getAllQuizzes);

// 📄 Get single quiz
router.get("/:id", auth, getQuizById);
router.put("/update/:quizId", auth, isAdmin, updateQuiz);
router.delete("/delete/:quizId", auth, isAdmin, deleteQuiz);


module.exports = router;

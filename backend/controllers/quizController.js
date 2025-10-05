// controllers/quizController.js
const Quiz = require("../models/Quiz");
const mongoose = require("mongoose");

// ✅ Create Quiz
exports.createQuiz = async (req, res) => {
  try {
    const { title, questions } = req.body;
    const userId = req.user.id; // From auth middleware

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Title and at least one question are required",
      });
    }

    // Clean questions: remove empty questionText & options without text
    const cleanedQuestions = questions
      .filter(q => q.questionText && q.questionText.trim() !== "")
      .map(q => ({
        questionText: q.questionText.trim(),
        options: q.options
          .filter(o => o.text && o.text.trim() !== "")
          .map(o => ({
            text: o.text.trim(),
            isCorrect: !!o.isCorrect,
          })),
      }));

    // Validation: each question must have at least one correct answer
    for (const q of cleanedQuestions) {
      if (!q.options.some(o => o.isCorrect)) {
        return res.status(400).json({
          success: false,
          message: `Question "${q.questionText}" must have at least one correct option.`,
        });
      }
    }

    const quiz = await Quiz.create({
      title: title.trim(),
      questions: cleanedQuestions,
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      data: quiz,
    });
  } catch (error) {
    console.error("❌ Error creating quiz:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating quiz",
    });
  }
};


// ✅ Get all quizzes
exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .populate("createdBy", "firstName lastName email images")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Fetched all quizzes",
      data: quizzes,
    });
  } catch (error) {
    console.error("❌ Error fetching quizzes:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching quizzes",
    });
  }
};

// ✅ Get single quiz by ID
exports.getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id).populate("createdBy", "firstName lastName email");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Quiz fetched successfully",
      data: quiz,
    });
  } catch (error) {
    console.error("❌ Error fetching quiz:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching quiz",
    });
  }
};


// Update a quiz
  exports.updateQuiz = async (req, res) => {
  const { quizId } = req.params;
  const { title, questions } = req.body; // questions = array of { questionText, options: [{text, isCorrect}] }

  if (!mongoose.Types.ObjectId.isValid(quizId)) {
    return res.status(400).json({ success: false, message: "Invalid Quiz ID" });
  }

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    // Update title if provided
    if (title) quiz.title = title;

    // Update questions if provided
    if (questions && Array.isArray(questions)) {
      quiz.questions = questions.map((q) => ({
        questionText: q.questionText,
        options: q.options.map((opt) => ({
          text: opt.text,
          isCorrect: opt.isCorrect,
        })),
      }));
    }

    const updatedQuiz = await quiz.save();

    res.status(200).json({
      success: true,
      message: "Quiz updated successfully",
      data: updatedQuiz,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// DELETE Quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    // Check if quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    // Delete quiz
    await Quiz.findByIdAndDelete(quizId); // ✅ safer than quiz.remove()

    return res.status(200).json({ success: true, message: "Quiz deleted successfully" });
  } catch (err) {
    console.error("Delete Quiz Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};



const express = require('express');
const fs = require('fs');
const path = require('path');
const logger = require('../logger'); // Import the logger
//***from MongoDB */
const { getComments, addComment } = require("../controllers/commentsController");
const { authenticateToken } = require("../auth"); // Import JWT authentication middleware


const router = express.Router();


// Get comments for a specific user
router.get("/", authenticateToken, async (req, res) => {
  const { book, chapter, verse } = req.query;
  const userId = req.userId; // Extracted from JWT
  try {
    const comments = await getComments(book, chapter, verse, userId);
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Add a new comment
router.post("/", authenticateToken, async (req, res) => {
  const { book, chapter, verse, comment } = req.body;
  const userId = req.userId; // Extracted from JWT

  if (!book || !chapter || !verse || !comment) {
    return res.status(400).json({ error: "Book, chapter, verse, and comment are required" });
  }

  try {
    const commentId = await addComment(book, chapter, verse, userId, comment);
    res.status(201).json({ message: "Comment added successfully", commentId });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

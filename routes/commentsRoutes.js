const express = require('express');
const fs = require('fs');
const path = require('path');
const logger = require('../logger'); // Import the logger
//***from MongoDB */

const { getComments, addComment, editComment, deleteComment } = require("../controllers/commentsController");
const { authenticateToken } = require("../auth"); // Import JWT authentication middleware
const { connectDb, closeDb} = require('../controllers/commentsController');
const { createAntiqueBiblePDF_multiUser } = require('../createAntiqueBible_multiUser'); // Adjust path if needed
console.log('Imported createAntiqueBiblePDF_multiUser:', createAntiqueBiblePDF_multiUser);
const router = express.Router();

/**
 * @swagger
 * /generate-pdf:
 *   get:
 *     summary: Generate a PDF of the Bible with user comments
 *     tags: [PDF Generation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully generated the PDF
 *       401:
 *         description: Unauthorized, token required
 *       403:
 *         description: Forbidden, invalid token
 *       500:
 *         description: Server error during PDF generation
 */

//generating a pdf in response to an API request
router.get('/generate-pdf', authenticateToken, async (req, res) => {
    console.log('Inside /generate-pdf handler');
    try {
        const { db } = await connectDb();
        const currentUserId = req.user.userId; // Extract userId from the token
        console.log(`Generating PDF for user: ${currentUserId}`);
        if (!currentUserId) {
            console.error('User ID is undefined');
            throw new Error('User ID is required to generate PDF');
        }
        // Call your PDF generation function
        await createAntiqueBiblePDF_multiUser(currentUserId);
        res.status(200).send('PDF generated successfully.');
    } catch (error) {
        console.error(`Error generating PDF: ${error.message}`); // Log the error message
        res.status(500).send(`Error generating PDF: ${error.message}`); // Return the error to the client

    }
});

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

router.put('/comments', authenticateToken, async (req, res) => {
    const { book, chapter, verse, comment } = req.body;
    const userId = req.user.userId; // Extracted from JWT

    if (!book || !chapter || !verse || !comment) {
        return res.status(400).json({ error: 'Book, chapter, verse, and comment are required' });
    }

    try {
        const { db } = await connectDb();
        const result = await db.collection('comments').updateOne(
            { userId, book, chapter: parseInt(chapter), verse: parseInt(verse) }, // Query
            { $set: { comment } } // Update
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        res.status(200).json({ message: 'Comment updated successfully' });
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/comments', authenticateToken, async (req, res) => {
    const { book, chapter, verse } = req.query;
    const userId = req.user.userId; // Extracted from JWT

    if (!book || !chapter || !verse) {
        return res.status(400).json({ error: 'Book, chapter, and verse are required' });
    }

    try {
        const { db } = await connectDb();
        const result = await db.collection('comments').deleteOne(
            { userId, book, chapter: parseInt(chapter), verse: parseInt(verse) } // Query
        );

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
module.exports = router;

const express = require('express');
const fs = require('fs');
const path = require('path');
const logger = require('../logger'); // Import the logger

const router = express.Router();

// Path to the comments file
const commentsFile = path.join(__dirname, '../Bible-kjv-master/comments.json');

// Ensure comments.json exists
if (!fs.existsSync(commentsFile)) {
  fs.writeFileSync(commentsFile, JSON.stringify({}), 'utf-8');
}

// GET: Retrieve comments
router.get('/', (req, res) => {
  const { book, chapter, verse } = req.query;
  const comments = JSON.parse(fs.readFileSync(commentsFile, 'utf-8'));

  if (!book) {
    return res.status(400).json({ error: 'Book is required' });
  }

  let result = comments[book];
  if (chapter) {
    result = result?.[chapter];
    if (verse) {
      result = result?.[verse];
    }
  }

  if (!result) {
    return res.status(404).json({ error: 'No comments found' });
  }

  res.json(result);
});

// POST: Add a comment
router.post('/', (req, res) => {
  const { book, chapter, verse, comment } = req.body;

  if (!book || !chapter || !verse || !comment) {
    logger.warn('Attempt to add a comment with missing fields');
    return res.status(400).json({ error: 'Book, chapter, verse, and comment are required' });
  }

  try {
    const comments = JSON.parse(fs.readFileSync(commentsFile, 'utf-8'));
    comments[book] = comments[book] || {};
    comments[book][chapter] = comments[book][chapter] || {};
    comments[book][chapter][verse] = comment;

    fs.writeFileSync(commentsFile, JSON.stringify(comments, null, 2));
    logger.info(`Added comment for ${book} ${chapter}:${verse}`);
    res.status(201).json({ message: 'Comment added successfully' });
  } catch (error) {
    logger.error(`Error adding comment: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT: Edit a comment
router.put('/', (req, res) => {
  const { book, chapter, verse, comment } = req.body;

  if (!book || !chapter || !verse || !comment) {
    logger.warn('Attempt to update a comment with missing fields');
    return res.status(400).json({ error: 'Book, chapter, verse, and comment are required' });
  }

  try {
    const comments = JSON.parse(fs.readFileSync(commentsFile, 'utf-8'));

    if (!comments[book]?.[chapter]?.[verse]) {
        logger.warn(`Attempt to update a non-existent comment for ${book} ${chapter}:${verse}`);
        return res.status(404).json({ error: 'Comment not found' });
    }

    comments[book][chapter][verse] = comment;
    fs.writeFileSync(commentsFile, JSON.stringify(comments, null, 2));
    logger.info(`Updated comment for ${book} ${chapter}:${verse}`);
    res.json({ message: 'Comment updated successfully' });
  } catch (error) {
    logger.error(`Error updating comment: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE: Remove a comment
router.delete('/', (req, res) => {
  const { book, chapter, verse } = req.query;

  if (!book || !chapter || !verse) {
    logger.warn('Attempt to delete a comment with missing fields');
    return res.status(400).json({ error: 'Book, chapter, and verse are required' });
  }

  try {
    const comments = JSON.parse(fs.readFileSync(commentsFile, 'utf-8'));

    if (!comments[book]?.[chapter]?.[verse]) {
        logger.warn(`Attempt to delete a non-existent comment for ${book} ${chapter}:${verse}`);
        return res.status(404).json({ error: 'Comment not found' });
    }

    delete comments[book][chapter][verse];

    if (Object.keys(comments[book][chapter]).length === 0) {
        delete comments[book][chapter];
    }
    if (Object.keys(comments[book]).length === 0) {
        delete comments[book];
    }

    fs.writeFileSync(commentsFile, JSON.stringify(comments, null, 2));
    logger.info(`Deleted comment for ${book} ${chapter}:${verse}`);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting comment: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

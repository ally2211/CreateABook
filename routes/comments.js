const express = require('express');
const fs = require('fs');
const path = require('path');
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
    return res.status(400).json({ error: 'Book, chapter, verse, and comment are required' });
  }

  const comments = JSON.parse(fs.readFileSync(commentsFile, 'utf-8'));
  comments[book] = comments[book] || {};
  comments[book][chapter] = comments[book][chapter] || {};
  comments[book][chapter][verse] = comment;

  fs.writeFileSync(commentsFile, JSON.stringify(comments, null, 2));
  res.status(201).json({ message: 'Comment added successfully' });
});

// PUT: Edit a comment
router.put('/', (req, res) => {
  const { book, chapter, verse, comment } = req.body;

  if (!book || !chapter || !verse || !comment) {
    return res.status(400).json({ error: 'Book, chapter, verse, and comment are required' });
  }

  const comments = JSON.parse(fs.readFileSync(commentsFile, 'utf-8'));

  if (!comments[book]?.[chapter]?.[verse]) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  comments[book][chapter][verse] = comment;
  fs.writeFileSync(commentsFile, JSON.stringify(comments, null, 2));
  res.json({ message: 'Comment updated successfully' });
});

// DELETE: Remove a comment
router.delete('/', (req, res) => {
  const { book, chapter, verse } = req.query;

  if (!book || !chapter || !verse) {
    return res.status(400).json({ error: 'Book, chapter, and verse are required' });
  }

  const comments = JSON.parse(fs.readFileSync(commentsFile, 'utf-8'));

  if (!comments[book]?.[chapter]?.[verse]) {
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
  res.json({ message: 'Comment deleted successfully' });
});

module.exports = router;

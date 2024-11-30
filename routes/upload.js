const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();

const commentsFile = path.join(__dirname, '../Bible-kjv-master/comments.json');
const upload = multer({ dest: 'uploads/' });

// POST: Upload comments JSON file
router.post('/', upload.single('file'), (req, res) => {
  const { file } = req;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const uploadedComments = JSON.parse(fs.readFileSync(file.path, 'utf-8'));
  fs.writeFileSync(commentsFile, JSON.stringify(uploadedComments, null, 2));
  fs.unlinkSync(file.path);

  res.json({ message: 'Comments file uploaded successfully' });
});

module.exports = router;

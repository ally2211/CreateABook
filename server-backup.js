const express = require('express');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Import routes
const commentsRouter = require('./routes/comments');
const uploadRouter = require('./routes/upload');

// Use routes
app.use('/comments', commentsRouter);
app.use('/upload-comments', uploadRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

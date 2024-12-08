const express = require('express');
const Redis = require('ioredis');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const swaggerDocument = YAML.load('./swagger.yaml');

// Import routes
const commentsRouter = require('./routes/commentsRoutes');
const uploadRouter = require('./routes/upload');

const app = express();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
const redis = new Redis(); // Initialize Redis client
const PORT = 3000;

// Middleware
app.use(express.json());

// Use existing routes
app.use('/comments', commentsRouter);
app.use('/upload-comments', uploadRouter);

// Scripture caching logic
async function cacheScripture(book, chapter, verse) {
  const cacheKey = `scripture:${book}:${chapter || ''}:${verse || ''}`;
  const cachedScripture = await redis.get(cacheKey);

  if (cachedScripture) {
    console.log(`Cache hit for ${cacheKey}`);
    return JSON.parse(cachedScripture);
  }

  try {
    const bookFile = path.join(__dirname, 'Bible-kjv-master', `${book}.json`);
    const bookData = JSON.parse(fs.readFileSync(bookFile, 'utf-8'));

    let result = bookData;
    if (chapter) {
      result = result.chapters.find((ch) => ch.chapter === chapter);
      if (verse) {
        result = result?.verses.find((v) => v.verse === verse);
      }
    }

    if (!result) {
      return null;
    }

    await redis.set(cacheKey, JSON.stringify(result), 'EX', 604800);
    console.log(`Cache miss for ${cacheKey} - Cached scripture`);
    return result;
  } catch (error) {
    console.error(`Error caching scripture for ${book}, ${chapter}, ${verse}:`, error);
    throw error;
  }
}

// Add a new endpoint for scripture
app.get('/scripture', async (req, res) => {
  const { book, chapter, verse } = req.query;

  logger.info(`Received request for scripture: Book=${book}, Chapter=${chapter}, Verse=${verse}`);

  
  if (!book) {
    logger.warn(`Book not found: ${book}`);
    return res.status(400).json({ error: 'Book is required' });
  }

  try {
    const scripture = await cacheScripture(book, chapter, verse);

    if (!scripture) {
      logger.warn(`Scripture not found: ${book} ${chapter}:${verse}`);
      return res.status(404).json({ error: 'Scripture not found' });
    }

    logger.info(`Successfully fetched scripture: ${book} ${chapter}:${verse}`);
    res.json(scripture);
  } catch (error) {
    logger.error(`Error fetching scripture: ${error.message}`);
    console.error('Error fetching scripture:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Preload scripture data into Redis on server start
async function preloadScriptureToRedis() {
  try {
    const books = JSON.parse(fs.readFileSync(path.join(__dirname, 'Bible-kjv-master', 'Books.json'), 'utf-8'));

    for (const book of books) {
      const bookFile = path.join(__dirname, 'Bible-kjv-master', `${book}.json`);
      const bookData = JSON.parse(fs.readFileSync(bookFile, 'utf-8'));

      for (const chapter of bookData.chapters) {
        const cacheKey = `scripture:${book}:${chapter.chapter}`;
        await redis.set(cacheKey, JSON.stringify(chapter), 'EX', 604800);
      }

      console.log(`Preloaded scripture for ${book}`);
    }
  } catch (error) {
    console.error('Error preloading scripture:', error);
  }
}

// Start the server
app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  await preloadScriptureToRedis(); // Preload scripture data
});

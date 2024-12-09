const express = require('express');
const Redis = require('ioredis');
const fs = require('fs');
const path = require('path');
//const swaggerUi = require('swagger-ui-express');
//const YAML = require('yamljs');
const { connectDb, closeDb } = require('./controllers/commentsController'); // Adjust the path as needed

//const swaggerDocument = YAML.load('./swagger.yaml');
const { swaggerDocs, swaggerUi } = require('./api-docs/swagger'); // Swagger setup




//multi routes
const commentsRoutes = require("./routes/commentsRoutes");
const logger = require("./logger"); // Logging configuration
const uploadRouter = require('./routes/upload');
const { authenticateToken } = require('./auth');

const app = express();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
const redis = new Redis(); // Initialize Redis client
const PORT = 3001;

// Middleware
app.use(express.json());

// Use Swagger UI
//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
// Register comments routes
app.use('/comments', commentsRoutes); // All routes in commentsRoutes.js are prefixed with /comments


// Use existing routes
//app.use('/routes', commentsRoutes);
//app.use('/upload-comments', uploadRouter);
//app.use("/comments", commentsRoutes); // Mount comments routes
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

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
  
  // Handle app termination signals
  process.on('SIGINT', async () => {
    console.log("Closing MongoDB connection...");
    await closeDb();
    process.exit(0);
  });
}
app._router.stack.forEach((middleware) => {
    if (middleware.route) {
        console.log(middleware.route.path);
    } else if (middleware.name === 'router') {
        middleware.handle.stack.forEach((handler) => {
            if (handler.route) {
                console.log(handler.route.path);
            }
        });
    }
});

// Start the server
app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
  logger.info(`Server running at http://localhost:${PORT}`);
  await preloadScriptureToRedis(); // Preload scripture data
});

const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017/Bible"; // Replace with your MongoDB URI
const { dbName } = "Bible"; 
//console.log('Using database:', db.databaseName); // Verify the correct database is being used

let client; // Declare a global client

// Reusable function to connect to MongoDB
async function connectDb() {
  const host = 'localhost';
  const port = 27017;
  const database = 'Bible';
  const url = `mongodb+srv://myAtlasDBUser:HelloAgain22@myatlasclusteredu.asusjdu.mongodb.net/?retryWrites=true&w=majority&appName=myAtlasClusterEDU`
  // Create the client instance but do not connect immediately
  console.log('connectDb called'); // Debug log
  if (!client) {
    try {
        client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        //console.error('MongoDB Client Error:', err)
        throw error;
    }
  }
  const db = client.db(database); // Select the database
  return { db, client }; // Return both db and client
}

async function closeDb() {
  if (client) {
    await client.close();
    client = null; // Reset the client to ensure it's reinitialized on next connect
    console.log("MongoDB connection closed.");
  }
}
// Fetch comments for a specific book, chapter, verse, and user
async function getComments(book, chapter, verse, userId) {
  const { db } = await connectDb();
  const commentsCollection = db.collection("comments");

  const query = { userId };
  if (book) query.book = book;
  if (chapter) query.chapter = parseInt(chapter);
  if (verse) query.verse = parseInt(verse);

  const comments = await commentsCollection.find(query).toArray();
  return comments;
}

// Add a new comment
async function addComment(book, chapter, verse, userId, commentText) {
  const { db } = await connectDb();
  
  console.log('Using database:', db.databaseName); // Verify the correct database is being used


  const commentsCollection = db.collection("comments");
  console.log('Adding comment:', { book, chapter, verse, userId, commentText });

  const newComment = {
    userId,
    book,
    chapter: parseInt(chapter),
    verse: parseInt(verse),
    comment: commentText,
  };

    try {
        const result = await commentsCollection.insertOne(newComment);
        console.log('Insert result:', result); // Log the result of the insertion
        return result.insertedId; // Return the ID of the inserted comment
    } catch (error) {
        console.error('Error inserting comment:', error.message);
        throw error; // Re-throw the error to be handled by the route
    }

  return result.insertedId; // Return the ID of the inserted comment
}

// Edit an existing comment
async function editComment(book, chapter, verse, userId, newCommentText) {
    const { db } = await connectDb();
    console.log('Using database:', db.databaseName);
    console.log('Database instance in addComment:', db); // Log the database instance
    
    if (!db || typeof db.collection !== 'function') {
        throw new Error('Invalid database instance: db.collection is not a function');
    }

    const commentsCollection = db.collection('comments');
    console.log('Comments collection:', commentsCollection); // Log the collection

    const query = { userId, book, chapter: parseInt(chapter), verse: parseInt(verse) };
    const update = { $set: { comment: newCommentText } };

    const result = await commentsCollection.updateOne(query, update);
    return result.matchedCount > 0; // Return true if a comment was updated
}

// Delete an existing comment
async function deleteComment(book, chapter, verse, userId) {
    const { db } = await connectDb();
    const commentsCollection = db.collection('comments');

    const query = { userId, book, chapter: parseInt(chapter), verse: parseInt(verse) };
    const result = await commentsCollection.deleteOne(query);

    return result.deletedCount > 0; // Return true if a comment was deleted
}

module.exports = {
  connectDb,
  closeDb,
  getComments,
  addComment,
};

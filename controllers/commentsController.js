const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017"; // Replace with your MongoDB URI
const dbName = "Bible";
let client; // Declare a global client

// Reusable function to connect to MongoDB
async function connectDb() {
  const host = 'localhost';
  const port = 27017;
  const database = 'Bible';
  const url = `mongodb+srv://myAtlasDBUser:HelloAgain22@myatlasclusteredu.asusjdu.mongodb.net/?retryWrites=true&w=majority&appName=myAtlasClusterEDU`
  // Create the client instance but do not connect immediately
  if (!client) {
    try {
        client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB Client Error:', err)
    }
  }
  const db = client.db(dbName); // Select the database
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
  const db = await connectDb();
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
  const db = await connectDb();
  const commentsCollection = db.collection("comments");

  const newComment = {
    userId,
    book,
    chapter: parseInt(chapter),
    verse: parseInt(verse),
    comment: commentText,
  };

  const result = await commentsCollection.insertOne(newComment);
  return result.insertedId; // Return the ID of the inserted comment
}

module.exports = {
  connectDb,
  closeDb,
  getComments,
  addComment,
};

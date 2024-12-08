import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = 'localhost';
    const port = 27017;
    const database = 'Bible';
    const url = `mongodb+srv://myAtlasDBUser:HelloAgain22@myatlasclusteredu.asusjdu.mongodb.net/?retryWrites=true&w=majority&appName=myAtlasClusterEDU`
    //const url = `mongodb://${host}:${port}`;

    // Create the client instance but do not connect immediately
    this.client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    this.db = null;

    // Connect manually and set up the database
    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db('Bible');
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB Client Error:', error);
    }
  }

  isAlive() {
    return this.client && this.client.topology && this.client.topology.isConnected();
  }

  async nbKJV() {
    if (!this.db) return 0;
    await this.client.connect();
    const KJVCollection = this.db.collection('KJV');
    //console.log('in nbUsers' + usersCollection.countDocuments());
    return KJVCollection.countDocuments();
  }

async getKJV() {
  if (!this.db) return [];
  const KJVCollection = this.db.collection('KJV');
  return await KJVCollection.find({}).toArray();
}

}

// Create and export an instance of DBClient
const dbClient = new DBClient();
module.exports = dbClient;

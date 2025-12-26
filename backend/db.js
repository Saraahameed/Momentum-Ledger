import { MongoClient } from 'mongodb';

let clientPromise;
let cachedDb;

function getMongoUri() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }
  return uri;
}

export async function getDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  if (!clientPromise) {
    const uri = getMongoUri();
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }

  const dbName = process.env.MONGODB_DB || 'productivity';
  const client = await clientPromise;
  cachedDb = client.db(dbName);
  return cachedDb;
}

export async function getUsersCollection() {
  const db = await getDatabase();
  return db.collection('users');
}

export async function getTasksCollection() {
  const db = await getDatabase();
  return db.collection('tasks');
}

export async function getProjectsCollection() {
  const db = await getDatabase();
  return db.collection('projects');
}

export async function ensureIndexes() {
  const users = await getUsersCollection();
  await users.createIndex({ email: 1 }, { unique: true });

  const tasks = await getTasksCollection();
  await tasks.createIndex({ userId: 1, createdAt: -1 });

  const projects = await getProjectsCollection();
  await projects.createIndex({ userId: 1, name: 1 }, { unique: true });
}

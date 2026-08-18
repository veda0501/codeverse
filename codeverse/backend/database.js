import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Initialize database file if it doesn't exist
async function initDb() {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    try {
      await fs.access(DB_FILE);
    } catch {
      const initialData = {
        users: [],
        progress: []
      };
      await fs.writeFile(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Failed to initialize local JSON DB:', err);
  }
}

// Read database
async function readDb() {
  await initDb();
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading local JSON DB:', err);
    return { users: [], progress: [] };
  }
}

// Write database
async function writeDb(data) {
  try {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local JSON DB:', err);
  }
}

// Export database operations
export const db = {
  // --- USER OPERATIONS ---
  async findUserByEmail(email) {
    const data = await readDb();
    return data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  async findUserById(id) {
    const data = await readDb();
    return data.users.find(u => u.id === id);
  },

  async createUser(user) {
    const data = await readDb();
    const newUser = {
      id: Math.random().toString(36).substring(2, 11),
      xp: 0,
      streakCount: 0,
      lastActiveDate: null,
      badges: [],
      ...user
    };
    data.users.push(newUser);
    await writeDb(data);
    return newUser;
  },

  async updateUser(id, updates) {
    const data = await readDb();
    const index = data.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    data.users[index] = {
      ...data.users[index],
      ...updates
    };
    await writeDb(data);
    return data.users[index];
  },

  // --- PROGRESS OPERATIONS ---
  async findProgress(userId, courseId) {
    const data = await readDb();
    return data.progress.find(p => p.userId === userId && p.courseId === courseId);
  },

  async getProgressByUser(userId) {
    const data = await readDb();
    return data.progress.filter(p => p.userId === userId);
  },

  async saveProgress(userId, courseId, updates) {
    const data = await readDb();
    let index = data.progress.findIndex(p => p.userId === userId && p.courseId === courseId);
    
    if (index === -1) {
      const newProgress = {
        userId,
        courseId,
        completedLessons: [],
        quizScores: {},
        completedProjects: [],
        completionPercent: 0,
        certificateGenerated: false,
        certificateId: null,
        ...updates
      };
      data.progress.push(newProgress);
      await writeDb(data);
      return newProgress;
    } else {
      data.progress[index] = {
        ...data.progress[index],
        ...updates
      };
      await writeDb(data);
      return data.progress[index];
    }
  }
};
export default db;

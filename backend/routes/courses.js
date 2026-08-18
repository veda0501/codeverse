import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COURSES_FILE = path.join(__dirname, '../courses.json');

// Helper to load course data asynchronously
async function getCoursesData() {
  try {
    const data = await fs.readFile(COURSES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading courses.json:', err);
    return [];
  }
}

// @route   GET api/courses
// @desc    Get all courses (list only, with summary metadata)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const courses = await getCoursesData();
    // Map to summary view to keep traffic light
    const summary = courses.map(c => {
      let totalLessons = 0;
      c.weeks.forEach(w => {
        totalLessons += w.lessons.length;
      });
      return {
        id: c.id,
        name: c.name,
        icon: c.icon,
        description: c.description,
        difficulty: c.difficulty,
        xp: c.xp,
        totalWeeks: c.weeks.length,
        totalLessons
      };
    });
    res.json(summary);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   GET api/courses/:courseId
// @desc    Get full details of a specific course
// @access  Public
router.get('/:courseId', async (req, res) => {
  try {
    const courses = await getCoursesData();
    const course = courses.find(c => c.id === req.params.courseId);
    
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    
    res.json(course);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

export default router;

import express from 'express';
import { db } from '../database.js';
import authMiddleware from '../middleware/auth.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COURSES_FILE = path.join(__dirname, '../courses.json');

// Helper to load course data asynchronously
async function getCourse(courseId) {
  try {
    const data = await fs.readFile(COURSES_FILE, 'utf-8');
    const courses = JSON.parse(data);
    return courses.find(c => c.id === courseId);
  } catch (err) {
    console.error('Error loading course:', err);
    return null;
  }
}

// Helper to award a badge to a user if not already earned
async function checkAndAwardBadge(user, badgeName) {
  if (!user.badges.includes(badgeName)) {
    const updatedBadges = [...user.badges, badgeName];
    // Also give a badge bonus of +50 XP
    const updatedUser = await db.updateUser(user.id, {
      badges: updatedBadges,
      xp: user.xp + 50
    });
    return { earned: true, user: updatedUser };
  }
  return { earned: false, user };
}

// Helper: Check and award all milestone badges after XP/streak update
async function checkMilestoneBadges(user) {
  const milestones = [
    { id: 'xp_100', check: u => u.xp >= 100 },
    { id: 'xp_500', check: u => u.xp >= 500 },
    { id: 'xp_1000', check: u => u.xp >= 1000 },
    { id: '7_day_streak', check: u => u.streakCount >= 7 },
    { id: '10_day_streak', check: u => u.streakCount >= 10 },
  ];
  let current = user;
  const earned = [];
  for (const m of milestones) {
    if (!current.badges.includes(m.id) && m.check(current)) {
      const updatedBadges = [...current.badges, m.id];
      current = await db.updateUser(current.id, { badges: updatedBadges });
      earned.push(m.id);
    }
  }
  return { user: current, earned };
}

// @route   GET api/progress
// @desc    Get user's progress for all courses
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const progressList = await db.getProgressByUser(req.user.id);
    res.json(progressList);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   GET api/progress/:courseId
// @desc    Get user's progress for a specific course
// @access  Private
router.get('/:courseId', authMiddleware, async (req, res) => {
  try {
    let progress = await db.findProgress(req.user.id, req.params.courseId);
    if (!progress) {
      // Create fresh progress entry if none exists
      progress = await db.saveProgress(req.user.id, req.params.courseId, {
        completedLessons: [],
        quizScores: {},
        completedProjects: [],
        completionPercent: 0,
        certificateGenerated: false,
        certificateId: null
      });
    }
    res.json(progress);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST api/progress/run-code
// @desc    User ran code in playground (First Program Badge potential)
// @access  Private
router.post('/run-code', authMiddleware, async (req, res) => {
  try {
    let user = await db.findUserById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Award First Program Badge and +15 XP
    let badgeEarned = false;
    let message = 'Code executed successfully!';
    
    if (!user.badges.includes('first_program')) {
      const badgeRes = await checkAndAwardBadge(user, 'first_program');
      user = badgeRes.user;
      badgeEarned = true;
      message = '🎉 Congratulations! You wrote your first program and earned the "First Program Badge" (+50 XP badge bonus)!';
    } else {
      // Small repeat execution bonus (+5 XP)
      user = await db.updateUser(user.id, { xp: user.xp + 5 });
    }

    res.json({ msg: message, badgeEarned, xpEarned: badgeEarned ? 55 : 5, user });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST api/progress/:courseId/lessons/:lessonId
// @desc    Complete a lesson
// @access  Private
router.post('/:courseId/lessons/:lessonId', authMiddleware, async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    let user = await db.findUserById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const course = await getCourse(courseId);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    let progress = await db.findProgress(req.user.id, courseId);
    if (!progress) {
      progress = {
        userId: req.user.id,
        courseId,
        completedLessons: [],
        quizScores: {},
        completedProjects: [],
        completionPercent: 0,
        certificateGenerated: false,
        certificateId: null
      };
    }

    // Check if lesson is already completed
    const alreadyCompleted = progress.completedLessons.includes(lessonId);
    let xpEarned = 0;

    if (!alreadyCompleted) {
      progress.completedLessons.push(lessonId);
      xpEarned = 10; // +10 XP for lesson completion
      user = await db.updateUser(user.id, { xp: user.xp + 10 });
    }

    // Count total lessons in course
    let totalLessons = 0;
    course.weeks.forEach(w => {
      totalLessons += w.lessons.length;
    });

    // Calculate completion percentage
    // For simplicity, lessons represent 100% of course. (Projects/Quizzes add experience but completing all lessons triggers completion!)
    const percent = Math.min(Math.round((progress.completedLessons.length / totalLessons) * 100), 100);
    progress.completionPercent = percent;

    // Check for Certificate Unlock (100% complete)
    let certUnlocked = false;
    if (percent === 100 && !progress.certificateGenerated) {
      progress.certificateGenerated = true;
      progress.certificateId = 'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase() + '-' + courseId.toUpperCase();
      certUnlocked = true;
    }

    // Award course_starter badge on first lesson ever
    if (!user.badges.includes('course_starter')) {
      const starterRes = await checkAndAwardBadge(user, 'course_starter');
      user = starterRes.user;
    }

    // Award speed_learner if 3+ lessons completed in this course session (completedLessons now >=3)
    if (progress.completedLessons.length >= 3 && !user.badges.includes('speed_learner')) {
      const speedRes = await checkAndAwardBadge(user, 'speed_learner');
      user = speedRes.user;
    }

    // Check XP/streak milestones
    const milestoneRes = await checkMilestoneBadges(user);
    user = milestoneRes.user;

    // Save updated progress
    const updatedProgress = await db.saveProgress(req.user.id, courseId, progress);
    res.json({
      progress: updatedProgress,
      user,
      xpEarned,
      certUnlocked,
      msg: certUnlocked ? '🎓 Course completed! You unlocked a certificate!' : 'Lesson completed!'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/progress/:courseId/quiz
// @desc    Submit quiz score (potential Quiz Master badge)
// @access  Private
router.post('/:courseId/quiz', authMiddleware, async (req, res) => {
  const { score, totalQuestions, quizId } = req.body;
  const { courseId } = req.params;

  if (score === undefined || !totalQuestions || !quizId) {
    return res.status(400).json({ msg: 'Please provide score, total questions and quiz id' });
  }

  try {
    let user = await db.findUserById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    let progress = await db.findProgress(req.user.id, courseId);
    if (!progress) {
      progress = await db.saveProgress(req.user.id, courseId, {
        completedLessons: [],
        quizScores: {},
        completedProjects: [],
        completionPercent: 0,
        certificateGenerated: false,
        certificateId: null
      });
    }

    // Save quiz score
    progress.quizScores[quizId] = score;

    // Calculate XP
    // +50 XP for taking quiz, +20 XP extra for a perfect score
    let xpEarned = 50;
    let badgeEarned = false;
    let message = 'Quiz submitted successfully!';

    if (score === totalQuestions) {
      xpEarned += 20; // Perfect score bonus
      
      // Award Quiz Master Badge
      if (!user.badges.includes('quiz_master')) {
        const badgeRes = await checkAndAwardBadge(user, 'quiz_master');
        user = badgeRes.user;
        badgeEarned = true;
        message = '🏆 Perfect Score! You earned the "Quiz Master Badge" (+50 XP badge bonus)!';
      }
    }

    user = await db.updateUser(user.id, { xp: user.xp + xpEarned });

    // Check XP/streak milestones
    const milestoneRes = await checkMilestoneBadges(user);
    user = milestoneRes.user;

    const updatedProgress = await db.saveProgress(req.user.id, courseId, progress);

    res.json({
      progress: updatedProgress,
      user,
      xpEarned,
      badgeEarned,
      msg: message
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/progress/:courseId/project
// @desc    Submit mini project completion (Debugging Expert or Project Completion badge)
// @access  Private
router.post('/:courseId/project', authMiddleware, async (req, res) => {
  const { projectId } = req.body;
  const { courseId } = req.params;

  if (!projectId) {
    return res.status(400).json({ msg: 'Please provide project ID' });
  }

  try {
    let user = await db.findUserById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    let progress = await db.findProgress(req.user.id, courseId);
    if (!progress) {
      progress = await db.saveProgress(req.user.id, courseId, {
        completedLessons: [],
        quizScores: {},
        completedProjects: [],
        completionPercent: 0,
        certificateGenerated: false,
        certificateId: null
      });
    }

    let xpEarned = 0;
    let badgeEarned = false;
    let message = 'Project completed!';

    if (!progress.completedProjects.includes(projectId)) {
      progress.completedProjects.push(projectId);
      xpEarned = 100; // +100 XP for project completion
      user = await db.updateUser(user.id, { xp: user.xp + 100 });

      // Award Project Completion Badge
      if (!user.badges.includes('project_complete')) {
        const badgeRes = await checkAndAwardBadge(user, 'project_complete');
        user = badgeRes.user;
        badgeEarned = true;
        message = '🎓 Outstanding! You completed a mini-project and earned the "Project Completion Badge" (+50 XP badge bonus)!';
      }
    }

    const updatedProgress = await db.saveProgress(req.user.id, courseId, progress);

    res.json({
      progress: updatedProgress,
      user,
      xpEarned,
      badgeEarned,
      msg: message
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/progress/debug-challenge
// @desc    Completed a debugging exercise in playground (Debugging Expert badge)
// @access  Private
router.post('/debug-challenge', authMiddleware, async (req, res) => {
  try {
    let user = await db.findUserById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    let badgeEarned = false;
    let message = 'Debugging challenge solved!';

    if (!user.badges.includes('debugging_expert')) {
      const badgeRes = await checkAndAwardBadge(user, 'debugging_expert');
      user = badgeRes.user;
      badgeEarned = true;
      message = '🔍 Amazing debugging skills! You earned the "Debugging Expert Badge" (+50 XP badge bonus)!';
    } else {
      user = await db.updateUser(user.id, { xp: user.xp + 10 });
    }

    res.json({
      user,
      badgeEarned,
      xpEarned: badgeEarned ? 60 : 10,
      msg: message
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

export default router;

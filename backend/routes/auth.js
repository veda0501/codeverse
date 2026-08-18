import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Helper function to update daily streak logic
async function updateStreak(user) {
  const todayStr = new Date().toISOString().split('T')[0];
  
  if (!user.lastActiveDate) {
    // First time logging in or active
    return await db.updateUser(user.id, {
      streakCount: 1,
      lastActiveDate: todayStr
    });
  }

  const lastActive = new Date(user.lastActiveDate);
  const today = new Date(todayStr);
  
  // Calculate difference in days
  const diffTime = Math.abs(today - lastActive);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Active on consecutive day
    return await db.updateUser(user.id, {
      streakCount: user.streakCount + 1,
      lastActiveDate: todayStr
    });
  } else if (diffDays > 1) {
    // Streak broken, reset to 1
    return await db.updateUser(user.id, {
      streakCount: 1,
      lastActiveDate: todayStr
    });
  }
  
  // Same day, streak count stays the same
  return user;
}

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    // Check for existing user
    let user = await db.findUserByEmail(email);
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = await db.createUser({
      name,
      email,
      password: hashedPassword,
      xp: 0,
      streakCount: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      badges: []
    });

    // Create token
    const payload = {
      user: { id: user.id }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'codeverse_super_secret_key_12345',
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        // Don't send password back
        const { password, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    // Check for user
    let user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Update streak on successful login
    user = await updateStreak(user);

    // Create token
    const payload = {
      user: { id: user.id }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'codeverse_super_secret_key_12345',
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        const { password, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', authMiddleware, async (req, res) => {
  try {
    let user = await db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Update streak on profile load
    user = await updateStreak(user);

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/reset-password
// @desc    Reset password (simulated/direct update)
// @access  Public
router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ msg: 'Please provide email and new password' });
  }

  try {
    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ msg: 'User email not found' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.updateUser(user.id, { password: hashedPassword });
    res.json({ msg: 'Password reset successful! You can now log in.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/leaderboard
// @desc    Get top 20 users by XP (sanitized — no password/email)
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await db.getAllUsers();
    const sanitized = users
      .map(u => ({
        id: u.id,
        name: u.name,
        xp: u.xp || 0,
        streakCount: u.streakCount || 0,
        badges: u.badges || [],
        avatarEmoji: u.avatarEmoji || null
      }))
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 20);
    res.json(sanitized);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/auth/profile
// @desc    Update user profile (name, avatarEmoji)
// @access  Private
router.put('/profile', authMiddleware, async (req, res) => {
  const { name, avatarEmoji } = req.body;
  try {
    let user = await db.findUserById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const updates = {};
    if (name && name.trim().length > 0) updates.name = name.trim();
    if (avatarEmoji) updates.avatarEmoji = avatarEmoji;

    user = await db.updateUser(user.id, updates);
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;

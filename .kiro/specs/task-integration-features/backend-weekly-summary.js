/**
 * Weekly Summary Backend Endpoints
 * 
 * This file contains the backend implementation for the weekly progress summary feature.
 * It provides endpoints to calculate and retrieve weekly statistics for journaling and task completion.
 * 
 * Endpoints:
 * - GET /journal/summary/weekly - Get weekly summary statistics
 */

const express = require('express');
const admin = require('firebase-admin');

const router = express.Router();
const db = admin.firestore();

/**
 * Helper function to format date as YYYY-MM-DD
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Helper function to format date for display (e.g., "Nov 23")
 */
function formatDisplayDate(date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

/**
 * Get tasks for a specific day from planner data
 */
function getDayTasks(plannerData, dateStr) {
  if (!plannerData || !plannerData.tasks) return [];
  
  return plannerData.tasks.filter(task => {
    // Check if task is scheduled for this date
    if (task.date === dateStr) return true;
    
    // Check recurring tasks
    if (task.recurring && task.recurringDays) {
      const date = new Date(dateStr);
      const dayOfWeek = date.getDay();
      return task.recurringDays.includes(dayOfWeek);
    }
    
    return false;
  });
}

/**
 * Calculate mood trend from array of mood values
 */
function calculateMoodTrend(moods) {
  if (moods.length < 2) return 'stable';
  
  const firstHalf = moods.slice(0, Math.floor(moods.length / 2));
  const secondHalf = moods.slice(Math.floor(moods.length / 2));
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  const improvement = ((secondAvg - firstAvg) / firstAvg) * 100;
  
  if (improvement > 10) return 'improving';
  if (improvement < -10) return 'declining';
  return 'stable';
}

/**
 * Find the best day (highest mood + all tasks completed)
 */
function findBestDay(journalDocs, plannerData) {
  let bestDay = null;
  let bestScore = -1;
  
  journalDocs.forEach(doc => {
    const data = doc.data();
    const dateStr = data.date;
    const mood = data.mood || 0;
    
    const dayTasks = getDayTasks(plannerData, dateStr);
    const dayCompletions = (plannerData.completions && plannerData.completions[dateStr]) || [];
    
    const allTasksComplete = dayTasks.length > 0 && dayCompletions.length === dayTasks.length;
    
    // Score: mood * 2 + bonus for completing all tasks
    const score = mood * 2 + (allTasksComplete ? 5 : 0);
    
    if (score > bestScore) {
      bestScore = score;
      bestDay = {
        date: dateStr,
        mood: mood,
        tasksCompleted: dayCompletions.length,
        tasksPlanned: dayTasks.length
      };
    }
  });
  
  return bestDay;
}

/**
 * Generate actionable suggestion based on patterns
 */
function generateSuggestion(tasksByCategory, moods) {
  // Find category with lowest completion rate
  let lowestCategory = null;
  let lowestRate = 1;
  
  Object.entries(tasksByCategory).forEach(([category, stats]) => {
    if (stats.planned > 0) {
      const rate = stats.completed / stats.planned;
      if (rate < lowestRate) {
        lowestRate = rate;
        lowestCategory = category;
      }
    }
  });
  
  if (lowestCategory && lowestRate < 0.5) {
    return `Try focusing on ${lowestCategory} tasks - they seem to be challenging this week`;
  }
  
  // Check mood trend
  if (moods.length >= 3) {
    const recentMoods = moods.slice(-3);
    const avgRecent = recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length;
    
    if (avgRecent < 3) {
      return "Consider adding more self-care tasks to your routine";
    }
  }
  
  return "Keep up the great work! You're building strong habits";
}

/**
 * Generate highlights based on weekly performance
 */
function generateHighlights(stats, moodTrend, moods) {
  const highlights = [];
  
  // Mood improvement highlight
  if (moodTrend === 'improving' && moods.length >= 2) {
    const improvement = ((moods[moods.length - 1] - moods[0]) / moods[0] * 100);
    if (improvement > 0) {
      highlights.push(`Your mood improved by ${Math.round(improvement)}% this week! 📈`);
    }
  }
  
  // Task completion highlight
  if (stats.completionRate >= 80) {
    highlights.push(`You completed ${stats.completionRate}% of your planned tasks`);
  } else if (stats.completionRate >= 50) {
    highlights.push(`You completed ${stats.tasksCompleted} tasks this week`);
  }
  
  // Journaling consistency highlight
  if (stats.entriesWritten === 7) {
    highlights.push("You wrote every day this week! 🔥");
  } else if (stats.entriesWritten >= 5) {
    highlights.push(`You wrote ${stats.entriesWritten} out of 7 days`);
  }
  
  // Perfect days highlight
  if (stats.perfectDays > 0) {
    highlights.push(`${stats.perfectDays} perfect day${stats.perfectDays > 1 ? 's' : ''} with all tasks completed! ⭐`);
  }
  
  // Words written highlight
  if (stats.totalWords >= 1000) {
    highlights.push(`You wrote ${stats.totalWords.toLocaleString()} words this week`);
  }
  
  return highlights;
}

/**
 * GET /journal/summary/weekly
 * 
 * Get weekly summary statistics for journaling and task completion
 * 
 * Query Parameters:
 * - uid: User ID (required)
 * - endDate: End date for the week in YYYY-MM-DD format (optional, defaults to today)
 * 
 * Response:
 * {
 *   week: "Nov 23-29",
 *   stats: {
 *     entriesWritten: 6,
 *     tasksCompleted: 28,
 *     tasksPlanned: 35,
 *     completionRate: 80,
 *     averageMood: 3.8,
 *     totalWords: 1850,
 *     streakMaintained: true,
 *     perfectDays: 2
 *   },
 *   highlights: [...],
 *   insights: {
 *     bestDay: {...},
 *     improvement: "...",
 *     suggestion: "..."
 *   },
 *   moodTrend: "improving",
 *   tasksByCategory: {...}
 * }
 */
router.get('/journal/summary/weekly', async (req, res) => {
  try {
    const { uid, endDate } = req.query;
    
    if (!uid) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Calculate date range (last 7 days)
    const end = endDate ? new Date(endDate) : new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    
    const startDateStr = formatDate(start);
    const endDateStr = formatDate(end);
    
    // Fetch journal entries for the week
    const journalsSnapshot = await db.collection('users')
      .doc(uid)
      .collection('journals')
      .where('date', '>=', startDateStr)
      .where('date', '<=', endDateStr)
      .get();
    
    // Fetch planner data for the relevant month(s)
    const yearMonth = endDateStr.substring(0, 7); // YYYY-MM
    const plannerDoc = await db.collection('users')
      .doc(uid)
      .collection('planners')
      .doc(yearMonth)
      .get();
    
    const plannerData = plannerDoc.exists ? plannerDoc.data() : { tasks: [], completions: {} };
    
    // Calculate basic stats
    const entriesWritten = journalsSnapshot.docs.length;
    const journalDocs = journalsSnapshot.docs;
    
    // Extract moods
    const moods = journalDocs
      .map(doc => doc.data().mood)
      .filter(mood => mood !== undefined && mood !== null);
    
    const averageMood = moods.length > 0 
      ? moods.reduce((a, b) => a + b, 0) / moods.length 
      : 0;
    
    // Calculate total words
    const totalWords = journalDocs.reduce((sum, doc) => {
      const content = doc.data().content || '';
      const words = content.trim().split(/\s+/).filter(w => w.length > 0);
      return sum + words.length;
    }, 0);
    
    // Calculate task statistics
    let tasksCompleted = 0;
    let tasksPlanned = 0;
    let perfectDays = 0;
    const tasksByCategory = {};
    
    // Iterate through each day in the week
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dateStr = formatDate(date);
      
      const dayTasks = getDayTasks(plannerData, dateStr);
      const dayCompletions = (plannerData.completions && plannerData.completions[dateStr]) || [];
      
      tasksPlanned += dayTasks.length;
      tasksCompleted += dayCompletions.length;
      
      // Check for perfect day
      if (dayTasks.length > 0 && dayCompletions.length === dayTasks.length) {
        perfectDays++;
      }
      
      // Category breakdown
      dayTasks.forEach(task => {
        const category = task.category || 'uncategorized';
        if (!tasksByCategory[category]) {
          tasksByCategory[category] = { completed: 0, planned: 0 };
        }
        tasksByCategory[category].planned++;
        
        if (dayCompletions.includes(task.id)) {
          tasksByCategory[category].completed++;
        }
      });
    }
    
    const completionRate = tasksPlanned > 0 
      ? Math.round((tasksCompleted / tasksPlanned) * 100) 
      : 0;
    
    // Calculate mood trend
    const moodTrend = calculateMoodTrend(moods);
    
    // Generate highlights
    const stats = {
      entriesWritten,
      tasksCompleted,
      tasksPlanned,
      completionRate,
      averageMood: Math.round(averageMood * 10) / 10,
      totalWords,
      streakMaintained: entriesWritten >= 6,
      perfectDays
    };
    
    const highlights = generateHighlights(stats, moodTrend, moods);
    
    // Find best day
    const bestDay = findBestDay(journalDocs, plannerData);
    
    // Generate insights
    const insights = {
      bestDay,
      improvement: moodTrend === 'improving' ? "Your mood is trending upward" : null,
      suggestion: generateSuggestion(tasksByCategory, moods)
    };
    
    // Format week display
    const weekDisplay = `${formatDisplayDate(start)}-${formatDisplayDate(end)}`;
    
    // Return summary
    res.json({
      week: weekDisplay,
      stats,
      highlights,
      insights,
      moodTrend,
      tasksByCategory
    });
    
  } catch (error) {
    console.error('Error generating weekly summary:', error);
    res.status(500).json({ 
      error: 'Failed to generate weekly summary',
      details: error.message 
    });
  }
});

module.exports = router;

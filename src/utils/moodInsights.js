/**
 * Mood Insights Utility
 * Provides period comparison calculations and insight generation
 */

/**
 * Compare mood between two time periods
 * @param {Array} currentPeriodData - Mood data for current period
 * @param {Array} previousPeriodData - Mood data for previous period
 * @returns {Object} Comparison results with improvement/decline percentages
 */
export function comparePeriods(currentPeriodData, previousPeriodData) {
  if (!currentPeriodData?.length || !previousPeriodData?.length) {
    return null;
  }

  // Calculate averages
  const currentAvg = calculateAverage(currentPeriodData.map(d => d.mood));
  const previousAvg = calculateAverage(previousPeriodData.map(d => d.mood));

  // Calculate percentage change
  const percentageChange = ((currentAvg - previousAvg) / previousAvg) * 100;

  // Calculate variance change
  const currentVariance = calculateVariance(currentPeriodData.map(d => d.mood));
  const previousVariance = calculateVariance(previousPeriodData.map(d => d.mood));
  const varianceChange = currentVariance - previousVariance;

  // Identify pattern changes
  const currentTrend = calculateTrend(currentPeriodData);
  const previousTrend = calculateTrend(previousPeriodData);
  const trendChanged = currentTrend !== previousTrend;

  // Count high mood days (4-5)
  const currentHighDays = currentPeriodData.filter(d => d.mood >= 4).length;
  const previousHighDays = previousPeriodData.filter(d => d.mood >= 4).length;
  const highDaysChange = currentHighDays - previousHighDays;

  // Count low mood days (1-2)
  const currentLowDays = currentPeriodData.filter(d => d.mood <= 2).length;
  const previousLowDays = previousPeriodData.filter(d => d.mood <= 2).length;
  const lowDaysChange = currentLowDays - previousLowDays;

  return {
    currentAverage: Math.round(currentAvg * 10) / 10,
    previousAverage: Math.round(previousAvg * 10) / 10,
    percentageChange: Math.round(percentageChange * 10) / 10,
    isImproving: percentageChange > 5,
    isDeclining: percentageChange < -5,
    isStable: Math.abs(percentageChange) <= 5,
    varianceChange: Math.round(varianceChange * 10) / 10,
    moreStable: varianceChange < 0,
    trendChanged,
    currentTrend,
    previousTrend,
    highDaysChange,
    lowDaysChange,
    currentHighDays,
    previousHighDays,
    currentLowDays,
    previousLowDays
  };
}

/**
 * Generate actionable insights based on mood data and patterns
 * @param {Object} stats - Mood statistics
 * @param {Object} comparison - Period comparison data (optional)
 * @param {Array} moodData - Raw mood data
 * @returns {Array} Array of insight objects
 */
export function generateInsights(stats, comparison = null, moodData = []) {
  const insights = [];

  // Best and worst days with context
  if (stats.bestDay && stats.bestDay.mood > 0) {
    insights.push({
      type: 'highlight',
      category: 'best-day',
      icon: '🌟',
      message: `Your best day was ${formatDate(stats.bestDay.date)} with a mood of ${stats.bestDay.mood}/5`,
      color: 'green',
      actionable: false
    });
  }

  if (stats.worstDay && stats.worstDay.mood > 0) {
    const encouragement = stats.worstDay.mood <= 2 
      ? "Remember, difficult days are temporary. You've made it through before, and you will again."
      : "Even on challenging days, you're tracking your progress. That's a sign of strength.";
    
    insights.push({
      type: 'support',
      category: 'worst-day',
      icon: '💙',
      message: `Your most challenging day was ${formatDate(stats.worstDay.date)} with a mood of ${stats.worstDay.mood}/5. ${encouragement}`,
      color: 'blue',
      actionable: false
    });
  }

  // Detect recurring patterns
  const patterns = detectPatterns(moodData);
  
  if (patterns.hasWeekendPattern) {
    insights.push({
      type: 'pattern',
      category: 'weekend',
      icon: '📅',
      message: patterns.weekendPattern === 'better' 
        ? "Your mood tends to be better on weekends. Consider incorporating weekend activities into your weekdays!"
        : "Your mood tends to dip on weekends. Try planning engaging activities to boost your weekend mood.",
      color: 'purple',
      actionable: true
    });
  }

  if (patterns.hasConsistentHighStreak) {
    insights.push({
      type: 'achievement',
      category: 'streak',
      icon: '🔥',
      message: `You had a ${patterns.highStreakLength}-day streak of good moods! What were you doing during that time?`,
      color: 'orange',
      actionable: true
    });
  }

  if (patterns.hasVolatility) {
    insights.push({
      type: 'observation',
      category: 'volatility',
      icon: '🌊',
      message: "Your mood has been fluctuating. Consider tracking what triggers these changes to identify patterns.",
      color: 'indigo',
      actionable: true
    });
  }

  // Trend-based insights
  if (stats.trend === 'improving') {
    insights.push({
      type: 'positive',
      category: 'trend',
      icon: '🌈',
      message: "Your mood has been improving over this period! Keep up the great work! 🌟",
      color: 'yellow',
      actionable: false
    });
  } else if (stats.trend === 'declining') {
    insights.push({
      type: 'support',
      category: 'trend',
      icon: '💜',
      message: "It looks like things have been tough lately. Remember, it's okay to have difficult days. Consider reaching out to someone you trust.",
      color: 'purple',
      actionable: true
    });
  } else if (stats.trend === 'stable') {
    insights.push({
      type: 'neutral',
      category: 'trend',
      icon: '🌿',
      message: "Your mood has been relatively stable. Consistency is a sign of balance!",
      color: 'gray',
      actionable: false
    });
  }

  // Comparison insights
  if (comparison) {
    if (comparison.isImproving) {
      insights.push({
        type: 'comparison',
        category: 'improvement',
        icon: '📈',
        message: `Your mood improved by ${Math.abs(comparison.percentageChange)}% compared to the previous period! You're making progress!`,
        color: 'green',
        actionable: false
      });
    } else if (comparison.isDeclining) {
      insights.push({
        type: 'comparison',
        category: 'decline',
        icon: '📉',
        message: `Your mood decreased by ${Math.abs(comparison.percentageChange)}% compared to the previous period. Be gentle with yourself during this time.`,
        color: 'red',
        actionable: true
      });
    }

    if (comparison.moreStable) {
      insights.push({
        type: 'comparison',
        category: 'stability',
        icon: '⚖️',
        message: "Your mood has become more stable compared to the previous period. This is a positive sign of emotional balance!",
        color: 'teal',
        actionable: false
      });
    }

    if (comparison.highDaysChange > 0) {
      insights.push({
        type: 'comparison',
        category: 'high-days',
        icon: '✨',
        message: `You had ${comparison.highDaysChange} more good mood days compared to the previous period!`,
        color: 'yellow',
        actionable: false
      });
    }

    if (comparison.lowDaysChange < 0) {
      insights.push({
        type: 'comparison',
        category: 'low-days',
        icon: '🌱',
        message: `You had ${Math.abs(comparison.lowDaysChange)} fewer difficult days compared to the previous period. That's growth!`,
        color: 'green',
        actionable: false
      });
    }
  }

  // Actionable suggestions based on patterns
  const suggestions = generateSuggestions(stats, patterns, comparison);
  insights.push(...suggestions);

  // Missed days reminder
  if (stats.missedDays > 0) {
    insights.push({
      type: 'reminder',
      category: 'consistency',
      icon: '📝',
      message: `You missed ${stats.missedDays} ${stats.missedDays === 1 ? 'day' : 'days'} of journaling in last 30 days. Try to journal daily to track your mood more accurately!`,
      color: 'orange',
      actionable: true
    });
  }

  return insights;
}

/**
 * Detect patterns in mood data
 * @param {Array} moodData - Array of mood entries
 * @returns {Object} Detected patterns
 */
function detectPatterns(moodData) {
  if (!moodData || moodData.length < 7) {
    return {
      hasWeekendPattern: false,
      hasConsistentHighStreak: false,
      hasVolatility: false
    };
  }

  // Weekend pattern detection
  const weekendMoods = [];
  const weekdayMoods = [];
  
  moodData.forEach(entry => {
    const date = new Date(entry.date);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendMoods.push(entry.mood);
    } else {
      weekdayMoods.push(entry.mood);
    }
  });

  const weekendAvg = weekendMoods.length > 0 ? calculateAverage(weekendMoods) : 0;
  const weekdayAvg = weekdayMoods.length > 0 ? calculateAverage(weekdayMoods) : 0;
  const hasWeekendPattern = Math.abs(weekendAvg - weekdayAvg) > 0.5;
  const weekendPattern = weekendAvg > weekdayAvg ? 'better' : 'worse';

  // High streak detection
  let currentStreak = 0;
  let maxStreak = 0;
  
  moodData.forEach(entry => {
    if (entry.mood >= 4) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });

  const hasConsistentHighStreak = maxStreak >= 3;

  // Volatility detection
  const moods = moodData.map(d => d.mood);
  const variance = calculateVariance(moods);
  const hasVolatility = variance > 1.5;

  return {
    hasWeekendPattern,
    weekendPattern,
    hasConsistentHighStreak,
    highStreakLength: maxStreak,
    hasVolatility,
    variance
  };
}

/**
 * Generate actionable suggestions based on patterns
 * @param {Object} stats - Mood statistics
 * @param {Object} patterns - Detected patterns
 * @param {Object} comparison - Period comparison (optional)
 * @returns {Array} Array of suggestion insights
 */
function generateSuggestions(stats, patterns, comparison) {
  const suggestions = [];

  // Low average mood suggestions
  if (stats.averageMood < 3) {
    suggestions.push({
      type: 'suggestion',
      category: 'self-care',
      icon: '🌸',
      message: "Your average mood has been lower. Consider prioritizing self-care activities like rest, exercise, or connecting with loved ones.",
      color: 'pink',
      actionable: true
    });
  }

  // High variance suggestions
  if (patterns.hasVolatility) {
    suggestions.push({
      type: 'suggestion',
      category: 'tracking',
      icon: '📊',
      message: "Try noting what activities or events happen on your best and worst days to identify what helps your mood.",
      color: 'blue',
      actionable: true
    });
  }

  // Consistency suggestions
  if (stats.daysTracked < stats.missedDays) {
    suggestions.push({
      type: 'suggestion',
      category: 'habit',
      icon: '⏰',
      message: "Set a daily reminder to journal. Consistent tracking helps you understand your patterns better.",
      color: 'indigo',
      actionable: true
    });
  }

  // Positive reinforcement for high average
  if (stats.averageMood >= 4) {
    suggestions.push({
      type: 'suggestion',
      category: 'reflection',
      icon: '💫',
      message: "You're doing great! Reflect on what's been working well so you can continue these positive habits.",
      color: 'yellow',
      actionable: true
    });
  }

  // Declining trend suggestions
  if (comparison && comparison.isDeclining) {
    suggestions.push({
      type: 'suggestion',
      category: 'support',
      icon: '🤝',
      message: "Consider reaching out to a friend, family member, or mental health professional for support during this time.",
      color: 'purple',
      actionable: true
    });
  }

  return suggestions;
}

/**
 * Calculate average of an array of numbers
 */
function calculateAverage(numbers) {
  if (!numbers || numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

/**
 * Calculate variance of an array of numbers
 */
function calculateVariance(numbers) {
  if (!numbers || numbers.length === 0) return 0;
  const avg = calculateAverage(numbers);
  const squaredDiffs = numbers.map(num => Math.pow(num - avg, 2));
  return calculateAverage(squaredDiffs);
}

/**
 * Calculate trend direction from mood data
 */
function calculateTrend(moodData) {
  if (!moodData || moodData.length < 3) return 'stable';
  
  // Simple linear regression
  const n = moodData.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  
  moodData.forEach((entry, index) => {
    sumX += index;
    sumY += entry.mood;
    sumXY += index * entry.mood;
    sumX2 += index * index;
  });
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  
  if (slope > 0.02) return 'improving';
  if (slope < -0.02) return 'declining';
  return 'stable';
}

/**
 * Format date for display
 */
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

import { useState, useEffect } from "react";
import { apiGet } from "../utils/api";
import MoodChart from "./MoodChart";
import { comparePeriods, generateInsights } from "../utils/moodInsights";

// InsightCard component for displaying individual insights
function InsightCard({ insight, theme }) {
  const getColorClasses = (color, theme) => {
    const colorMap = {
      green: theme === "dark" ? "bg-[#5b4a3d]/30 text-[#d4a574]" : "bg-[#7A916C]/10 text-[#5C6F4C]",
      blue: theme === "dark" ? "bg-[#3a2e20]/30 text-[#EBDDBF]" : "bg-[#cdd6c0]/20 text-[#6B7A59]",
      yellow: theme === "dark" ? "bg-[#5b4a3d]/30 text-[#d4a574]" : "bg-[#EBDDBF]/30 text-[#8b6f47]",
      purple: theme === "dark" ? "bg-[#3a2e20]/30 text-[#EBDDBF]" : "bg-[#cdd6c0]/20 text-[#6B7A59]",
      orange: theme === "dark" ? "bg-[#5b4a3d]/30 text-[#d4a574]" : "bg-[#d4a574]/10 text-[#8b6f47]",
      red: theme === "dark" ? "bg-[#5b4a3d]/30 text-[#EBDDBF]" : "bg-[#cdd6c0]/20 text-[#6B7A59]",
      pink: theme === "dark" ? "bg-[#5b4a3d]/30 text-[#d4a574]" : "bg-[#EBDDBF]/30 text-[#8b6f47]",
      indigo: theme === "dark" ? "bg-[#3a2e20]/30 text-[#EBDDBF]" : "bg-[#cdd6c0]/20 text-[#6B7A59]",
      teal: theme === "dark" ? "bg-[#5b4a3d]/30 text-[#d4a574]" : "bg-[#7A916C]/10 text-[#5C6F4C]",
      gray: theme === "dark" ? "bg-[#3a2e20]/30 text-[#EBDDBF]" : "bg-gray-50 text-gray-700"
    };
    return colorMap[color] || colorMap.gray;
  };

  return (
    <div className={`p-3 rounded-lg ${getColorClasses(insight.color, theme)}`}>
      <p className={`text-sm ${theme === "dark" ? "font-gothic-body" : ""}`}>
        {insight.icon} {insight.message}
      </p>
      {insight.actionable && (
        <span className={`text-xs opacity-70 mt-1 inline-block ${theme === "dark" ? "font-gothic-body" : ""}`}>
          💡 Actionable
        </span>
      )}
    </div>
  );
}

export default function ExtendedMoodDashboard({ user, theme }) {
  const [period, setPeriod] = useState(30);
  const [data, setData] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE = "http://localhost:8000/raindrop";

  useEffect(() => {
    if (!user) return;
    
    const loadMoodData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Load current period data
        const response = await apiGet(
          `${BASE}/analytics/mood/extended?uid=${user.uid}&days=${period}`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch mood data");
        }
        
        const result = await response.json();
        setData(result);

        // Load previous period data for comparison
        const previousResponse = await apiGet(
          `${BASE}/analytics/mood/extended?uid=${user.uid}&days=${period * 2}`
        );
        
        let comparisonResult = null;
        
        if (previousResponse.ok) {
          const previousResult = await previousResponse.json();
          
          // Split the data to get the previous period
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - period);
          const cutoffStr = cutoffDate.toISOString().split('T')[0];
          
          const previousPeriodData = previousResult.moodData.filter(
            entry => entry.date < cutoffStr
          );
          
          if (previousPeriodData.length > 0) {
            // Calculate comparison
            comparisonResult = comparePeriods(
              result.moodData,
              previousPeriodData
            );
            setComparison(comparisonResult);
          } else {
            setComparison(null);
          }
        }

        // Generate insights with comparison data
        const generatedInsights = generateInsights(
          result.stats,
          comparisonResult,
          result.moodData
        );
        setInsights(generatedInsights);
        
      } catch (err) {
        console.error("Error loading mood data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadMoodData();
  }, [period, user, BASE]);

  const getTrendIcon = (trend) => {
    if (trend === "improving") return "📈";
    if (trend === "declining") return "📉";
    return "➡️";
  };

  const getTrendColor = (trend) => {
    if (trend === "improving") return "text-[#7A916C] dark:text-[#d4a574]";
    if (trend === "declining") return "text-[#8b6f47] dark:text-[#EBDDBF]";
    return "text-gray-600 dark:text-[#EBDDBF]/70";
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 bg-[#cdd6c0]/20 dark:bg-[#3a2e20]/30 rounded-xl text-center">
        <p className="text-[#8b6f47] dark:text-[#EBDDBF]">
          Failed to load mood data. Please try again.
        </p>
      </div>
    );
  }

  if (!data || !data.moodData || data.moodData.length === 0) {
    return (
      <div className="w-full p-6 bg-white/40 dark:bg-black/20 backdrop-blur-xl rounded-xl text-center">
        <p className={`${theme === "dark" ? "text-[#EBDDBF]" : "text-[#6B7A59]"}`}>
          No mood data available for this period. Start journaling to see your mood trends!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Period Selector */}
      <div className="flex justify-center gap-2 flex-wrap">
        {[7, 30, 90, 365].map((days) => (
          <button
            key={days}
            onClick={() => setPeriod(days)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              period === days
                ? theme === "dark"
                  ? "bg-[#d4a574] text-black shadow-lg"
                  : "bg-[#7A916C] text-white shadow-lg"
                : "bg-white/40 dark:bg-black/20 backdrop-blur-xl hover:bg-white/60 dark:hover:bg-black/30"
            }`}
          >
            {days === 7 ? "7 Days" : days === 30 ? "30 Days" : days === 90 ? "90 Days" : "1 Year"}
          </button>
        ))}
      </div>

      {/* Mood Chart */}
      <div className="bg-white/40 dark:bg-black/20 backdrop-blur-xl rounded-xl p-6 shadow-lg">
        <h3 className={`text-lg font-semibold mb-4 ${
          theme === "dark" ? "text-[#EBDDBF] font-spooky-header" : "text-[#6B7A59]"
        }`}>
          Mood Over Time
        </h3>
        <MoodChart data={data.moodData} theme={theme} />
      </div>



      {/* Period Comparison */}
      {comparison && (
        <div className="bg-white/40 dark:bg-black/20 backdrop-blur-xl rounded-xl p-6 shadow-lg">
          <h3 className={`text-lg font-semibold mb-4 ${
            theme === "dark" ? "text-[#EBDDBF] font-spooky-header" : "text-[#6B7A59]"
          }`}>
            Period Comparison 
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className={`p-4 rounded-lg ${
              theme === "dark" ? "bg-white/5" : "bg-white/60"
            }`}>
              <p className={`text-xs opacity-70 mb-1 ${theme === "dark" ? "font-gothic-body" : ""}`}>
                Current Period
              </p>
              <p className={`text-2xl font-bold ${theme === "dark" ? "text-[#d4a574]" : "text-[#7A916C]"}`}>
                {comparison.currentAverage}/5
              </p>
            </div>
            
            <div className={`p-4 rounded-lg ${
              theme === "dark" ? "bg-white/5" : "bg-white/60"
            }`}>
              <p className={`text-xs opacity-70 mb-1 ${theme === "dark" ? "font-gothic-body" : ""}`}>
                Previous Period
              </p>
              <p className={`text-2xl font-bold ${theme === "dark" ? "text-[#EBDDBF]" : "text-[#6B7A59]"}`}>
                {comparison.previousAverage}/5
              </p>
            </div>
          </div>

          <div className={`p-4 rounded-lg text-center ${
            comparison.isImproving 
              ? theme === "dark" ? "bg-[#5b4a3d]/30" : "bg-[#7A916C]/10"
              : comparison.isDeclining
              ? theme === "dark" ? "bg-[#3a2e20]/30" : "bg-[#cdd6c0]/20"
              : theme === "dark" ? "bg-[#3a2e20]/30" : "bg-gray-50"
          }`}>
            <p className={`text-lg font-semibold ${
              comparison.isImproving
                ? theme === "dark" ? "text-[#d4a574]" : "text-[#5C6F4C]"
                : comparison.isDeclining
                ? theme === "dark" ? "text-[#EBDDBF]" : "text-[#6B7A59]"
                : theme === "dark" ? "text-[#EBDDBF]" : "text-gray-700"
            }`}>
              {comparison.isImproving && `↑ ${Math.abs(comparison.percentageChange)}% Improvement`}
              {comparison.isDeclining && `↓ ${Math.abs(comparison.percentageChange)}% Decline`}
              {comparison.isStable && `Similar to Previous Period`}
            </p>
          </div>
        </div>
      )}

      {/* Insights Section */}
      <div className="bg-white/40 dark:bg-black/20 backdrop-blur-xl rounded-xl p-6 shadow-lg">
        <h3 className={`text-lg font-semibold mb-4 ${
          theme === "dark" ? "text-[#EBDDBF] font-spooky-header" : "text-[#6B7A59]"
        }`}>
          Insights & Suggestions ✨
        </h3>
        
        <div className="space-y-3">
          {insights.length === 0 ? (
            <p className={`text-sm opacity-70 ${theme === "dark" ? "font-gothic-body" : ""}`}>
              Keep journaling to unlock personalized insights!
            </p>
          ) : (
            insights.map((insight, index) => (
              <InsightCard 
                key={index} 
                insight={insight} 
                theme={theme} 
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

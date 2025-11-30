import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../utils/api";
import { TASK_CATEGORIES } from "../constants/taskCategories";
import { checkCelebrationTrigger } from "../utils/celebrationTrigger";
import CelebrationModal from "./CelebrationModal";

export default function PostJournalCheckModal({ date, onClose, theme, user }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState(null);

  useEffect(() => {
    if (date && user?.uid) {
      loadTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, user]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await apiGet(
        `http://localhost:8000/journal/post-save-check?uid=${user.uid}&date=${date}`
      );
      const data = await response.json();

      if (!data.hasTasks || data.todaysTasks.length === 0) {
        // No tasks for today, close modal
        onClose();
        return;
      }

      // Check if all tasks are already completed
      const incompleteTasks = data.todaysTasks.filter(t => !t.completed);
      if (incompleteTasks.length === 0) {
        // All tasks already completed, close modal
        onClose();
        return;
      }

      setTasks(data.todaysTasks);
      // Pre-select already completed tasks
      setSelectedTasks(
        data.todaysTasks.filter(t => t.completed).map(t => t.id)
      );
    } catch (err) {
      console.error("Failed to load tasks:", err);
      onClose(); // Close on error
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (taskId) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const markAllDone = () => {
    setSelectedTasks(tasks.map(t => t.id));
  };

  const saveAndClose = async () => {
    setSaving(true);
    try {
      await apiPost("http://localhost:8000/journal/quick-complete-tasks", {
        uid: user.uid,
        date,
        taskIds: selectedTasks
      });

      // Check if all tasks completed for celebration
      if (selectedTasks.length === tasks.length) {
        // Check for celebration trigger
        const celebrationResult = await checkCelebrationTrigger(date);
        if (celebrationResult) {
          setCelebrationData(celebrationResult);
          setShowCelebration(true);
          // Don't close the modal yet - celebration modal will handle it
          return;
        }
      }

      onClose();
    } catch (err) {
      console.error("Failed to save task completions:", err);
      alert("Failed to save task completions. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm flex justify-center items-center z-[250]">
        <div
          className={`relative w-[500px] p-8 rounded-xl shadow-2xl ${
            theme === "dark"
              ? "bg-[#2b241c] border border-[#3a2e20] text-[#EBDDBF]"
              : "bg-white border-2 border-[#f1e9cf] text-[#6c7a5b]"
          }`}
        >
          <p className="text-center opacity-70">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm flex justify-center items-center z-[250]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-[550px] max-h-[80vh] overflow-hidden rounded-xl shadow-2xl ${
          theme === "dark"
            ? "bg-[#2b241c] border border-[#3a2e20] text-[#EBDDBF]"
            : "bg-white border-2 border-[#f1e9cf] text-[#6c7a5b]"
        }`}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-current/10">
          <h2 className={`text-2xl font-bold mb-2 ${theme === "dark" ? "font-spooky-header" : ""}`}>
            Great journaling! 📝
          </h2>
          <p className="text-sm opacity-70">
            Did you complete your planned tasks today?
          </p>
        </div>

        {/* Task List */}
        <div className="p-6 max-h-[400px] overflow-y-auto">
          <div className="space-y-3">
            {tasks.map(task => {
              const category = TASK_CATEGORIES[task.category] || TASK_CATEGORIES.other;
              const isSelected = selectedTasks.includes(task.id);

              return (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? theme === "dark"
                        ? "bg-[#3a2e20] border-2 border-[#EBDDBF]/30"
                        : "bg-[#E6F0D1] border-2 border-[#7A916C]/30"
                      : theme === "dark"
                      ? "bg-[#1a1410] border-2 border-transparent hover:border-[#3a2e20]"
                      : "bg-[#FFFBEA] border-2 border-transparent hover:border-[#E6F0D1]"
                  }`}
                >
                  {/* Checkbox */}
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? theme === "dark"
                          ? "bg-[#EBDDBF] border-[#EBDDBF]"
                          : "bg-[#7A916C] border-[#7A916C]"
                        : theme === "dark"
                        ? "border-[#EBDDBF]/50"
                        : "border-[#7A916C]/50"
                    }`}
                  >
                    {isSelected && (
                      <span className={theme === "dark" ? "text-[#2b241c]" : "text-white"}>
                        ✓
                      </span>
                    )}
                  </div>

                  {/* Task Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium">{task.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs opacity-60">
                      <span>{category.name}</span>
                      {task.timeEstimate && (
                        <>
                          <span>•</span>
                          <span>{task.timeEstimate} min</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-6 pb-4 flex gap-3">
          <button
            onClick={markAllDone}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
              theme === "dark"
                ? "bg-[#3a2e20] text-[#EBDDBF] hover:bg-[#4a3e30]"
                : "bg-[#E6F0D1] text-[#7A916C] hover:bg-[#d6e0c1]"
            }`}
          >
            Mark all done ✓
          </button>
          <button
            onClick={() => navigate("/planner")}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
              theme === "dark"
                ? "bg-[#3a2e20] text-[#EBDDBF] hover:bg-[#4a3e30]"
                : "bg-[#E6F0D1] text-[#7A916C] hover:bg-[#d6e0c1]"
            }`}
          >
            Review tasks
          </button>
        </div>

        {/* Primary Actions */}
        <div className="p-6 pt-0 flex flex-col gap-3">
          <button
            onClick={saveAndClose}
            disabled={saving}
            className={`w-full px-6 py-3 rounded-lg font-semibold transition ${
              theme === "dark"
                ? "bg-[#EBDDBF] text-[#2b241c] hover:bg-[#EBDDBF]/90"
                : "bg-[#7A916C] text-white hover:bg-[#6c7a5b]"
            } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {saving ? "Saving..." : "Save & Continue"}
          </button>
          <button
            onClick={onClose}
            className={`w-full text-sm opacity-60 hover:opacity-100 transition ${
              theme === "dark" ? "text-[#EBDDBF]" : "text-[#6c7a5b]"
            }`}
          >
            Skip for now
          </button>
        </div>
      </div>
      
      {/* Celebration Modal */}
      {showCelebration && celebrationData && (
        <CelebrationModal
          stats={celebrationData.stats}
          reward={celebrationData.reward}
          onClose={() => {
            setShowCelebration(false);
            setCelebrationData(null);
            onClose(); // Close the post-journal check modal too
          }}
          onShare={() => {
            console.log('Share celebration:', celebrationData);
            setShowCelebration(false);
            setCelebrationData(null);
            onClose();
          }}
        />
      )}
    </div>
  );
}

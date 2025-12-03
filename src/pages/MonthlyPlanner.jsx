import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { TASK_CATEGORIES } from "../constants/taskCategories";
import DopamineGraph from "../components/DopamineGraph";
import TaskModal from "../components/TaskModal";
import TemplatesModal from "../components/TemplatesModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import TodayOnlyModal from "../components/TodayOnlyModal";
import ErrorBoundary from "../components/ErrorBoundary";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { apiGet, apiPost, apiPut, apiDelete } from "../utils/api";
import { updateTaskQuests } from "../utils/questProgress";
import { checkCelebrationTrigger } from "../utils/celebrationTrigger";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../contexts/AuthContext";
import CelebrationModal from "../components/CelebrationModal";

// Sortable Task Row Component
function SortableTaskRow({ task, theme, daysInMonth, yearMonth, completions, exceptions, handleToggleTask, handleEditTask, handleDeleteTask }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'default',
    zIndex: isDragging ? 1000 : 'auto',
    position: 'relative',
  };

  const category = TASK_CATEGORIES[task.category] || TASK_CATEGORIES.other;

  // Helper function to check if task applies to a specific date
  const taskAppliesOnDate = (date) => {
    try {
      if (!task || !date) return false;
      
      if (!task.isRecurring) {
        // If task has a specific date, only show on that date
        if (task.specificDate) {
          return task.specificDate === date;
        }
        // Otherwise, non-recurring tasks apply to all dates in their month
        return true;
      }
      
      // For recurring tasks, check applicableDates array
      if (!task.applicableDates || !Array.isArray(task.applicableDates)) {
        return false;
      }
      
      // Check if date is in applicableDates
      if (!task.applicableDates.includes(date)) {
        return false;
      }
      
      // Check for exceptions
      const taskExceptions = exceptions?.[task.id];
      if (taskExceptions && taskExceptions[date]) {
        const exception = taskExceptions[date];
        // If exception marks this occurrence as deleted, don't show it
        if (exception.isDeleted) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error in taskAppliesOnDate:', error, { task, date });
      return false;
    }
  };

  return (
    <tr
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor:
          theme === "dark"
            ? `${category.darkColor}15`
            : `${category.color}10`,
      }}
      className={isDragging ? 'shadow-2xl' : ''}
    >
      <td
        className={`sticky left-0 z-10 p-3 font-medium ${theme === "dark" ? "font-gothic-body" : ""}`}
        style={{
          backgroundColor:
            theme === "dark"
              ? `${category.darkColor}20`
              : `${category.color}15`,
        }}
      >
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className={`cursor-grab active:cursor-grabbing opacity-0 hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity ${
              theme === "dark" ? "text-[#EBDDBF]" : "text-[#7A916C]"
            }`}
            style={{ touchAction: "none" }}
            aria-label="Drag to reorder"
          >
            <span className="text-lg">⋮⋮</span>
          </button>
          <span className="mr-2">{category.icon}</span>
          <span>{task.name}</span>
          {task.timeEstimate && (
            <span className="text-sm text-gray-500 ml-2">
              ({formatTime(task.timeEstimate)})
            </span>
          )}
          {task.isRecurring && (
            <span className="text-sm text-gray-500 ml-1" title="Recurring task">
              🔁
            </span>
          )}
        </div>
      </td>
      {Array.from({ length: daysInMonth }, (_, day) => {
        const date = `${yearMonth}-${String(day + 1).padStart(2, "0")}`;
        const appliesOnDate = taskAppliesOnDate(date);
        const isCompleted = completions[date]?.includes(task.id);
        
        return (
          <td key={day} className="p-3 text-center">
            {appliesOnDate ? (
              <div className="flex items-center justify-center gap-1 group/cell">
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={() => handleToggleTask(task.id, day + 1)}
                  className="w-5 h-5 cursor-pointer"
                  style={{ accentColor: category.color }}
                />
                {task.isRecurring && (
                  <button
                    onClick={() => handleDeleteTask(task.id, date)}
                    className="opacity-0 group-hover/cell:opacity-100 text-red-500 hover:text-red-700 text-xs transition-opacity"
                    title="Delete this occurrence"
                  >
                    ✕
                  </button>
                )}
              </div>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </td>
        );
      })}
      <td className="p-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleEditTask(task)}
            className={`px-2 py-1 rounded transition ${
              theme === "dark"
                ? "text-[#EBDDBF] hover:bg-[#3a2e20]"
                : "text-[#7A916C] hover:bg-gray-200"
            }`}
            title="Edit task"
          >
            ✏️
          </button>
          <button
            onClick={() => handleDeleteTask(task.id)}
            className="text-red-500 hover:text-red-700 font-bold"
            title="Delete task"
          >
            ✕
          </button>
        </div>
      </td>
    </tr>
  );
}

// Helper function to format time
function formatTime(minutes) {
  if (!minutes) return "";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// Helper function to calculate daily total time
function calculateDailyTotal(tasks, date) {
  return tasks.reduce((total, task) => {
    // Check if task applies to this date
    if (task.isRecurring && task.applicableDates) {
      // For recurring tasks, check if date is in applicableDates
      if (task.applicableDates.includes(date)) {
        return total + (task.timeEstimate || 0);
      }
    } else if (!task.isRecurring) {
      // For non-recurring tasks, they apply to all dates in their month
      return total + (task.timeEstimate || 0);
    }
    return total;
  }, 0);
}

// Helper function to get color for daily total
function getTotalColor(totalMinutes, theme) {
  if (totalMinutes === 0) return "";
  
  const hours = totalMinutes / 60;
  
  if (hours <= 6) {
    // Green for 0-6 hours
    return theme === "dark" ? "text-green-400" : "text-green-600";
  } else if (hours <= 8) {
    // Yellow for 6-8 hours
    return theme === "dark" ? "text-yellow-400" : "text-yellow-600";
  } else {
    // Red for 8+ hours
    return theme === "dark" ? "text-red-400" : "text-red-600";
  }
}

export default function MonthlyPlanner({ theme }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [tasks, setTasks] = useState([]);
  const [completions, setCompletions] = useState({});
  const [exceptions, setExceptions] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTodayOnlyModal, setShowTodayOnlyModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [deleteDate, setDeleteDate] = useState(null);
  const [dailyStats, setDailyStats] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState(null);

  // Validate month and year values
  const validMonth = typeof selectedMonth === 'number' && selectedMonth >= 0 && selectedMonth <= 11 
    ? selectedMonth 
    : new Date().getMonth();
  const validYear = typeof selectedYear === 'number' && selectedYear >= 2020 && selectedYear <= 2100
    ? selectedYear
    : new Date().getFullYear();
  
  const yearMonth = `${validYear}-${String(validMonth + 1).padStart(2, "0")}`;
  const daysInMonth = new Date(validYear, validMonth + 1, 0).getDate();
  
  // Safety check for daysInMonth
  const safeDaysInMonth = (daysInMonth > 0 && daysInMonth <= 31) ? daysInMonth : 31;
  
  // Debug log
  console.log('MonthlyPlanner render:', { 
    selectedMonth, 
    selectedYear, 
    validMonth, 
    validYear, 
    daysInMonth, 
    safeDaysInMonth 
  });

  // Set up drag-and-drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch planner data
  const fetchPlannerData = useCallback(async () => {
    try {
      const res = await apiGet(`${API_BASE_URL}/planner/${yearMonth}`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch planner: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log("📋 Fetched planner data:", data);
      
      // Ensure tasks is always an array
      const tasksArray = Array.isArray(data.tasks) ? data.tasks : [];
      
      // Validate each task has required properties
      const validTasks = tasksArray.filter(task => {
        if (!task || !task.id || !task.name) {
          console.warn('Invalid task found:', task);
          return false;
        }
        return true;
      });
      
      setTasks(validTasks);
      setCompletions(data.completions || {});
      setExceptions(data.exceptions || {});
    } catch (err) {
      console.error("Failed to fetch planner:", err);
      showToast("Failed to load planner data", "error");
      // Set empty state on error
      setTasks([]);
      setCompletions({});
      setExceptions({});
    }
  }, [yearMonth]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await apiGet(`${API_BASE_URL}/planner/stats/${yearMonth}`);
      const data = await res.json();
      setDailyStats(data.dailyStats || []);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, [yearMonth]);

  // Fetch data when month/year changes
  useEffect(() => {
    fetchPlannerData();
    fetchStats();
  }, [fetchPlannerData, fetchStats]);

  const handleAddTask = async (taskData) => {
    try {
      // Always use POST endpoint - backend handles create vs update based on taskId presence
      const endpoint = `${API_BASE_URL}/planner/task`;
      
      // Add taskId to body if editing
      const requestBody = editingTask
        ? { ...taskData, taskId: editingTask.id }
        : taskData;

      const res = await apiPost(endpoint, requestBody);
      const data = await res.json();
      
      if (data.success) {
        // Show success toast notification
        showToast("Task saved successfully!", "success");
        
        // Refresh planner data to get updated tasks and affected dates
        await fetchPlannerData();
        await fetchStats();
        
        // Close modal and reset editing state
        setShowAddModal(false);
        setEditingTask(null);
      } else {
        showToast("Failed to save task. Please try again.", "error");
      }
    } catch (err) {
      console.error("Failed to save task:", err);
      showToast("Failed to save task. Please try again.", "error");
    }
  };

  // Toast notification helper
  const showToast = (message, type = "info") => {
    // Simple toast implementation - you can enhance this with a toast library
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity ${
      type === "success"
        ? "bg-green-500 text-white"
        : type === "error"
        ? "bg-red-500 text-white"
        : "bg-blue-500 text-white"
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  const handleToggleTask = async (taskId, day) => {
    const date = `${yearMonth}-${String(day).padStart(2, "0")}`;
    
    // ✅ Only allow toggling tasks for today
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    
    if (date !== todayStr) {
      setShowTodayOnlyModal(true);
      return;
    }
    
    const isCompleted = completions[date]?.includes(taskId);

    try {
      await apiPost(`${API_BASE_URL}/planner/toggle`, {
        yearMonth,
        taskId,
        date,
        completed: !isCompleted,
      });

      // Update local state
      const newCompletions = { ...completions };
      if (!newCompletions[date]) {
        newCompletions[date] = [];
      }

      if (isCompleted) {
        newCompletions[date] = newCompletions[date].filter((id) => id !== taskId);
      } else {
        newCompletions[date].push(taskId);
      }

      setCompletions(newCompletions);
      fetchStats(); // Refresh graph

      // Update quest progress (non-blocking)
      if (user?.uid) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          updateTaskQuests(user.uid, taskId, task.category, date, !isCompleted).catch(err => {
            console.warn('Quest progress update failed, but task toggled successfully:', err);
          });
        }
      }

      // Check for celebration trigger if task was just completed (not uncompleted)
      if (!isCompleted) {
        checkCelebrationTrigger(date).then(celebrationResult => {
          if (celebrationResult) {
            setCelebrationData(celebrationResult);
            setShowCelebration(true);
          }
        }).catch(err => {
          console.warn('Celebration check failed:', err);
        });
      }
    } catch (err) {
      console.error("Failed to toggle task:", err);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowAddModal(true);
  };

  const handleDeleteTask = (taskId, date = null) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    setDeletingTask(task);
    setDeleteDate(date);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (deleteScope) => {
    if (!deletingTask) return;

    // For recurring tasks, if "single occurrence" is selected but no date is provided,
    // force the scope to "month" since we can't delete a single occurrence without a date
    if (deletingTask.isRecurring && deleteScope === "single" && !deleteDate) {
      showToast("Cannot delete single occurrence without a date. Deleting all occurrences in this month instead.", "error");
      deleteScope = "month";
    }

    try {
      // Build the URL with query parameters
      let url = `${API_BASE_URL}/planner/task/${yearMonth}/${deletingTask.id}`;
      const params = new URLSearchParams();
      
      if (deletingTask.isRecurring) {
        params.append("scope", deleteScope);
        if (deleteScope === "single" && deleteDate) {
          params.append("date", deleteDate);
        }
        // For "month" scope, the yearMonth is already in the URL path
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await apiDelete(url);

      const data = await res.json();

      if (data.success) {
        showToast("Task deleted successfully!", "success");
        
        // Refresh planner data to reflect changes
        await fetchPlannerData();
        await fetchStats();
      } else {
        showToast("Failed to delete task. Please try again.", "error");
      }
    } catch (err) {
      console.error("Failed to delete task:", err);
      showToast("Failed to delete task. Please try again.", "error");
    } finally {
      setShowDeleteModal(false);
      setDeletingTask(null);
      setDeleteDate(null);
    }
  };

  // Handle edit template from TemplatesModal
  const handleEditTemplate = (template) => {
    setEditingTask(template);
    setShowTemplatesModal(false);
    setShowAddModal(true);
  };

  // Handle delete template from TemplatesModal
  const handleDeleteTemplate = async (templateId) => {
    try {
      const res = await apiDelete(`${API_BASE_URL}/planner/task/${yearMonth}/${templateId}?scope=all`);

      const data = await res.json();
      
      if (data.success) {
        showToast("Template deleted successfully!", "success");
        // Refresh planner data to reflect changes
        await fetchPlannerData();
        await fetchStats();
      } else {
        showToast("Failed to delete template. Please try again.", "error");
      }
    } catch (err) {
      console.error("Failed to delete template:", err);
      showToast("Failed to delete template. Please try again.", "error");
      throw err; // Re-throw to let TemplatesModal handle it
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);

    // Optimistically update local state
    const newTasks = arrayMove(tasks, oldIndex, newIndex);
    setTasks(newTasks);

    // Calculate new sortOrder values for all affected tasks
    const taskOrders = newTasks.map((task, index) => ({
      taskId: task.id,
      sortOrder: index,
    }));

    // Persist to backend
    try {
      const res = await apiPut(`${API_BASE_URL}/planner/task/reorder`, {
        yearMonth,
        taskOrders,
      });

      const data = await res.json();
      
      if (!data.success) {
        // Revert on failure
        setTasks(tasks);
        showToast("Failed to reorder tasks. Please try again.", "error");
      }
    } catch (err) {
      console.error("Failed to reorder tasks:", err);
      // Revert on error
      setTasks(tasks);
      showToast("Failed to reorder tasks. Please try again.", "error");
    }
  };

  return (
    <ErrorBoundary>
    <div
      className={`min-h-screen p-8 transition-colors duration-500 ${
        theme === "dark" ? "bg-[#1a1410] text-[#EBDDBF]" : "bg-[#FFFBEA] text-[#7A916C]"
      }`}
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className={`mb-4 flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            theme === "dark"
              ? "bg-[#2b241c] text-[#EBDDBF] hover:bg-[#3a2e20]"
              : "bg-white text-[#7A916C] hover:bg-gray-100"
          }`}
        >
          <span className="text-xl">←</span>
          <span></span>
        </button>

        <h1 className={`text-4xl font-bold mb-4 ${theme === "dark" ? "font-spooky-header" : ""}`}> Monthly Planner</h1>
        
        {/* Month/Year Selector */}
        <div className="flex gap-4 items-center">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className={`px-4 py-2 rounded-lg ${
              theme === "dark"
                ? "bg-[#2b241c] text-[#EBDDBF] font-gothic-body"
                : "bg-white text-[#7A916C]"
            }`}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {new Date(2024, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className={`px-4 py-2 rounded-lg ${
              theme === "dark"
                ? "bg-[#2b241c] text-[#EBDDBF] font-gothic-body"
                : "bg-white text-[#7A916C]"
            }`}
          >
            {[2024, 2025, 2026].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              theme === "dark"
                ? "bg-[#EBDDBF] text-[#2b241c] hover:bg-[#EBDDBF]/90 font-gothic-body"
                : "bg-[#7A916C] text-white hover:bg-[#6c7a5b]"
            }`}
          >
            + Add Task
          </button>

          <button
            onClick={() => setShowTemplatesModal(true)}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              theme === "dark"
                ? "bg-[#3a2e20] text-[#EBDDBF] hover:bg-[#4a3e30] font-gothic-body"
                : "bg-gray-200 text-[#7A916C] hover:bg-gray-300"
            }`}
          >
             View Templates
          </button>
        </div>
      </div>

      {/* Planner Grid */}
      <div className="max-w-7xl mx-auto mb-12 overflow-x-auto">
        <div className="min-w-max">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="w-full border-collapse">
            <thead>
              <tr>
                <th
                  className={`sticky left-0 z-10 p-3 text-left font-semibold ${
                    theme === "dark" ? "bg-[#2b241c] font-spooky-header" : "bg-[#E6F0D1]"
                  }`}
                >
                  Task
                </th>
                {Array.from({ length: safeDaysInMonth }, (_, i) => (
                  <th
                    key={i}
                    className={`p-3 text-center font-semibold ${
                      theme === "dark" ? "bg-[#2b241c] font-gothic-body" : "bg-[#E6F0D1]"
                    }`}
                  >
                    {i + 1}
                  </th>
                ))}
                <th
                  className={`p-3 text-center font-semibold ${
                    theme === "dark" ? "bg-[#2b241c] font-spooky-header" : "bg-[#E6F0D1]"
                  }`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="group">
              <SortableContext
                items={tasks.map((t) => t?.id).filter(Boolean)}
                strategy={verticalListSortingStrategy}
              >
                {tasks.filter(task => task && task.id).map((task) => (
                  <SortableTaskRow
                    key={task.id}
                    task={task}
                    theme={theme}
                    daysInMonth={safeDaysInMonth}
                    yearMonth={yearMonth}
                    completions={completions || {}}
                    exceptions={exceptions || {}}
                    handleToggleTask={handleToggleTask}
                    handleEditTask={handleEditTask}
                    handleDeleteTask={handleDeleteTask}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>

          {tasks.length === 0 && (
            <div className="text-center py-12 opacity-60">
              No tasks yet. Click "+ Add Task" to get started!
            </div>
          )}
          </DndContext>
        </div>
      </div>

      {/* Dopamine Graph */}
      <div className="max-w-7xl mx-auto mb-12">
        <DopamineGraph dailyStats={dailyStats} theme={theme} />
      </div>
      
      {/* Task Modal */}
      <TaskModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingTask(null);
        }}
        onSave={handleAddTask}
        theme={theme}
        editingTask={editingTask}
        yearMonth={yearMonth}
      />

      {/* Templates Modal */}
      <TemplatesModal
        isOpen={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        theme={theme}
        onEdit={handleEditTemplate}
        onDelete={handleDeleteTemplate}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingTask(null);
          setDeleteDate(null);
        }}
        onConfirm={handleConfirmDelete}
        theme={theme}
        taskName={deletingTask?.name || ""}
        isRecurring={deletingTask?.isRecurring || false}
        hasDateContext={deleteDate !== null}
      />

      {/* Today Only Modal */}
      {showTodayOnlyModal && (
        <TodayOnlyModal
          theme={theme}
          onClose={() => setShowTodayOnlyModal(false)}
        />
      )}

      {/* Celebration Modal */}
      {showCelebration && celebrationData && (
        <CelebrationModal
          stats={celebrationData.stats}
          reward={celebrationData.reward}
          onClose={() => {
            setShowCelebration(false);
            setCelebrationData(null);
          }}
          onShare={() => {
            // Optional: Implement share functionality
            console.log('Share celebration:', celebrationData);
            // For now, just close the modal
            setShowCelebration(false);
            setCelebrationData(null);
          }}
        />
      )}
    </div>
    </ErrorBoundary>
  );
}

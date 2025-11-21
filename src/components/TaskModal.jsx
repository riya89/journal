import { useState, useEffect } from "react";
import { TASK_CATEGORIES } from "../constants/taskCategories";

export default function TaskModal({
  isOpen,
  onClose,
  onSave,
  theme,
  editingTask = null,
  yearMonth,
}) {
  const [taskName, setTaskName] = useState("");
  const [category, setCategory] = useState("health");
  const [timeEstimate, setTimeEstimate] = useState("");
  const [recurrenceType, setRecurrenceType] = useState("none");
  const [recurrenceDays, setRecurrenceDays] = useState([]);
  const [editScope, setEditScope] = useState("single");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form when editing a task
  useEffect(() => {
    if (editingTask) {
      setTaskName(editingTask.name || "");
      setCategory(editingTask.category || "health");
      setTimeEstimate(editingTask.timeEstimate || "");
      setRecurrenceType(editingTask.recurrenceType || "none");
      setRecurrenceDays(editingTask.recurrenceDays || []);
      setEditScope("single");
    } else {
      // Reset form for new task
      setTaskName("");
      setCategory("health");
      setTimeEstimate("");
      setRecurrenceType("none");
      setRecurrenceDays([]);
      setEditScope("single");
    }
    setErrors({});
  }, [editingTask, isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle close
  const handleClose = () => {
    onClose();
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Validate task name
    if (!taskName.trim()) {
      newErrors.taskName = "Task name is required";
    }

    // Validate weekly recurrence days
    if (recurrenceType === "weekly" && recurrenceDays.length === 0) {
      newErrors.recurrenceDays = "Please select at least one day";
    }

    // Validate time estimate
    if (timeEstimate !== "" && timeEstimate !== null) {
      const timeValue = parseInt(timeEstimate);
      if (isNaN(timeValue) || timeValue < 0) {
        newErrors.timeEstimate = "Time estimate must be a positive number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const taskData = {
        name: taskName.trim(),
        category,
        timeEstimate: timeEstimate ? parseInt(timeEstimate) : null,
        isRecurring: recurrenceType !== "none",
        recurrenceType,
        recurrenceDays: recurrenceType === "weekly" ? recurrenceDays : [],
        yearMonth,
      };

      // Add edit scope if editing a recurring task
      if (editingTask && editingTask.isRecurring) {
        taskData.editScope = editScope;
      }

      // Add task ID if editing
      if (editingTask) {
        taskData.id = editingTask.id;
      }

      await onSave(taskData);
      
      // Reset form and close modal
      setTaskName("");
      setCategory("health");
      setTimeEstimate("");
      setRecurrenceType("none");
      setRecurrenceDays([]);
      setEditScope("single");
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Error saving task:", error);
      setErrors({ submit: "Failed to save task. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div
        className={`p-8 rounded-lg shadow-2xl w-full max-w-md ${
          theme === "dark" ? "bg-[#2b241c] text-[#EBDDBF]" : "bg-white text-[#7A916C]"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {editingTask ? "Edit Task" : "Add New Task"}
          </h2>
          <button
            onClick={handleClose}
            className={`text-2xl leading-none hover:opacity-70 transition ${
              theme === "dark" ? "text-[#EBDDBF]" : "text-[#7A916C]"
            }`}
          >
            ✕
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Task Name Input */}
          <div>
            <label className="block mb-2 font-semibold">Task Name:</label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g., Exercise for 30 mins"
              className={`w-full p-3 rounded-lg ${
                theme === "dark"
                  ? "bg-[#3a2e20] text-[#EBDDBF] placeholder-[#EBDDBF]/50"
                  : "bg-gray-100 text-[#7A916C] placeholder-gray-400"
              } ${errors.taskName ? "border-2 border-red-500" : ""}`}
            />
            {errors.taskName && (
              <p className="text-red-500 text-sm mt-1">{errors.taskName}</p>
            )}
          </div>

          {/* Category Selector */}
          <div>
            <label className="block mb-2 font-semibold">Category:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full p-3 rounded-lg ${
                theme === "dark"
                  ? "bg-[#3a2e20] text-[#EBDDBF]"
                  : "bg-gray-100 text-[#7A916C]"
              }`}
            >
              {Object.entries(TASK_CATEGORIES).map(([key, cat]) => (
                <option key={key} value={key}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Time Estimate Input */}
          <div>
            <label className="block mb-2 font-semibold">
              ⏰ Time Estimate (optional):
            </label>
            <input
              type="number"
              value={timeEstimate}
              onChange={(e) => setTimeEstimate(e.target.value)}
              placeholder="e.g., 30"
              min="0"
              className={`w-full p-3 rounded-lg ${
                theme === "dark"
                  ? "bg-[#3a2e20] text-[#EBDDBF] placeholder-[#EBDDBF]/50"
                  : "bg-gray-100 text-[#7A916C] placeholder-gray-400"
              } ${errors.timeEstimate ? "border-2 border-red-500" : ""}`}
            />
            <p className={`text-sm mt-1 ${theme === "dark" ? "text-[#EBDDBF]/70" : "text-gray-500"}`}>
              Minutes (e.g., 30 = 30m, 90 = 1h 30m)
            </p>
            {errors.timeEstimate && (
              <p className="text-red-500 text-sm mt-1">{errors.timeEstimate}</p>
            )}
          </div>

          {/* Recurrence Selector - Hide when editing non-recurring task */}
          {(!editingTask || editingTask.isRecurring) && (
            <div>
              <label className="block mb-2 font-semibold">🔁 Repeat:</label>
              <select
                value={recurrenceType}
                onChange={(e) => {
                  setRecurrenceType(e.target.value);
                  if (e.target.value !== "weekly") {
                    setRecurrenceDays([]);
                  }
                }}
                className={`w-full p-3 rounded-lg ${
                  theme === "dark"
                    ? "bg-[#3a2e20] text-[#EBDDBF]"
                    : "bg-gray-100 text-[#7A916C]"
                }`}
              >
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly (select days)</option>
              </select>

              {/* Day of Week Checkboxes - Show when Weekly is selected */}
              {recurrenceType === "weekly" && (
                <div className="mt-3">
                  <p className={`text-sm mb-2 ${theme === "dark" ? "text-[#EBDDBF]/70" : "text-gray-600"}`}>
                    Select days:
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { day: 0, label: "Sun" },
                      { day: 1, label: "Mon" },
                      { day: 2, label: "Tue" },
                      { day: 3, label: "Wed" },
                      { day: 4, label: "Thu" },
                      { day: 5, label: "Fri" },
                      { day: 6, label: "Sat" },
                    ].map(({ day, label }) => (
                      <label
                        key={day}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer transition ${
                          theme === "dark"
                            ? "hover:bg-[#3a2e20]"
                            : "hover:bg-gray-200"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={recurrenceDays.includes(day)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRecurrenceDays([...recurrenceDays, day].sort());
                            } else {
                              setRecurrenceDays(recurrenceDays.filter((d) => d !== day));
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.recurrenceDays && (
                    <p className="text-red-500 text-sm mt-2">{errors.recurrenceDays}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Edit Scope Selector - Show when editing existing recurring task */}
          {editingTask && editingTask.isRecurring && (
            <div>
              <label className="block mb-2 font-semibold">Edit Scope:</label>
              <div className="space-y-2">
                <label
                  className={`flex items-center gap-2 p-3 rounded cursor-pointer transition ${
                    theme === "dark"
                      ? "hover:bg-[#3a2e20]"
                      : "hover:bg-gray-200"
                  } ${
                    editScope === "single"
                      ? theme === "dark"
                        ? "bg-[#3a2e20]"
                        : "bg-gray-200"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="editScope"
                    value="single"
                    checked={editScope === "single"}
                    onChange={(e) => setEditScope(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span>This occurrence only</span>
                </label>
                <label
                  className={`flex items-center gap-2 p-3 rounded cursor-pointer transition ${
                    theme === "dark"
                      ? "hover:bg-[#3a2e20]"
                      : "hover:bg-gray-200"
                  } ${
                    editScope === "all"
                      ? theme === "dark"
                        ? "bg-[#3a2e20]"
                        : "bg-gray-200"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="editScope"
                    value="all"
                    checked={editScope === "all"}
                    onChange={(e) => setEditScope(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span>All future occurrences</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Submit Error Message */}
        {errors.submit && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="text-red-500 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-lg transition ${
              theme === "dark"
                ? "bg-gray-600 hover:bg-gray-700 disabled:opacity-50"
                : "bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
              theme === "dark"
                ? "bg-[#EBDDBF] text-[#2b241c] hover:bg-[#EBDDBF]/90 disabled:opacity-50"
                : "bg-[#7A916C] text-white hover:bg-[#6c7a5b] disabled:opacity-50"
            }`}
          >
            {isLoading ? "Saving..." : "Save Task"}
          </button>
        </div>
      </div>
    </div>
  );
}

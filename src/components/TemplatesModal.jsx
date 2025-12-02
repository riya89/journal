import { useState, useEffect } from "react";
import { TASK_CATEGORIES } from "../constants/taskCategories";
import { apiGet } from "../utils/api";
import { API_BASE_URL } from "../config/api";

export default function TemplatesModal({
  isOpen,
  onClose,
  theme,
  onEdit,
  onDelete,
}) {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch templates when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  // Fetch templates from API
  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await apiGet(`${API_BASE_URL}/planner/templates`);

      if (!response.ok) {
        throw new Error("Failed to fetch templates");
      }

      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Format recurrence pattern as readable text
  const formatRecurrencePattern = (template) => {
    if (template.recurrenceType === "daily") {
      return "Daily";
    } else if (template.recurrenceType === "weekly") {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const selectedDays = template.recurrenceDays
        .map((day) => dayNames[day])
        .join(", ");
      return `Weekly: ${selectedDays}`;
    }
    return "None";
  };

  // Format time estimate
  const formatTimeEstimate = (minutes) => {
    if (!minutes) return null;
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins}m`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}m`;
    }
  };

  // Handle edit button click
  const handleEdit = (template) => {
    onEdit(template);
  };

  // Handle delete button click
  const handleDeleteClick = (template) => {
    setDeleteConfirm(template.id);
  };

  // Confirm delete
  const confirmDelete = async (templateId) => {
    try {
      await onDelete(templateId);
      // Refresh template list after delete
      await fetchTemplates();
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div
        className={`p-8 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto ${
          theme === "dark" ? "bg-[#2b241c] text-[#EBDDBF]" : "bg-white text-[#7A916C]"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recurring Task Templates</h2>
          <button
            onClick={onClose}
            className={`text-2xl leading-none hover:opacity-70 transition ${
              theme === "dark" ? "text-[#EBDDBF]" : "text-[#7A916C]"
            }`}
          >
            ✕
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <p className={theme === "dark" ? "text-[#EBDDBF]/70" : "text-gray-500"}>
              Loading templates...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && templates.length === 0 && (
          <div className="text-center py-8">
            <p className={theme === "dark" ? "text-[#EBDDBF]/70" : "text-gray-500"}>
              No recurring task templates found.
            </p>
            <p className={`text-sm mt-2 ${theme === "dark" ? "text-[#EBDDBF]/50" : "text-gray-400"}`}>
              Create a task with a recurrence pattern to see it here.
            </p>
          </div>
        )}

        {/* Templates List */}
        {!isLoading && templates.length > 0 && (
          <div className="space-y-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`p-4 rounded-lg border ${
                  theme === "dark"
                    ? "bg-[#3a2e20] border-[#EBDDBF]/20"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                {/* Delete Confirmation */}
                {deleteConfirm === template.id ? (
                  <div className="space-y-3">
                    <p className="font-semibold">
                      Delete this recurring task template?
                    </p>
                    <p className={`text-sm ${theme === "dark" ? "text-[#EBDDBF]/70" : "text-gray-600"}`}>
                      This will remove the template and all future occurrences. Past completions will be preserved.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => confirmDelete(template.id)}
                        className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                      <button
                        onClick={cancelDelete}
                        className={`px-4 py-2 rounded-lg transition ${
                          theme === "dark"
                            ? "bg-gray-600 hover:bg-gray-700"
                            : "bg-gray-300 hover:bg-gray-400"
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Template Info */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">
                            {TASK_CATEGORIES[template.category]?.icon || ""}
                          </span>
                          <h3 className="text-lg font-semibold">{template.name}</h3>
                        </div>
                        <div className={`text-sm space-y-1 ${theme === "dark" ? "text-[#EBDDBF]/70" : "text-gray-600"}`}>
                          <p>
                            <span className="font-medium">Pattern:</span>{" "}
                            {formatRecurrencePattern(template)}
                          </p>
                          {template.timeEstimate && (
                            <p>
                              <span className="font-medium">Time:</span>{" "}
                              {formatTimeEstimate(template.timeEstimate)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(template)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                            theme === "dark"
                              ? "bg-[#EBDDBF] text-[#2b241c] hover:bg-[#EBDDBF]/90"
                              : "bg-[#7A916C] text-white hover:bg-[#6c7a5b]"
                          }`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(template)}
                          className="px-3 py-1 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              theme === "dark"
                ? "bg-[#EBDDBF] text-[#2b241c] hover:bg-[#EBDDBF]/90"
                : "bg-[#7A916C] text-white hover:bg-[#6c7a5b]"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

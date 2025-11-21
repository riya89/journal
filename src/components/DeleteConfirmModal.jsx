import { useState } from "react";

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, theme, taskName, isRecurring }) {
  const [deleteScope, setDeleteScope] = useState("single");

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(deleteScope);
    onClose();
  };

  const handleCancel = () => {
    setDeleteScope("single"); // Reset to default
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md rounded-lg shadow-xl p-6 ${
          theme === "dark"
            ? "bg-[#2b241c] text-[#EBDDBF]"
            : "bg-white text-[#7A916C]"
        }`}
      >
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-2">Delete Task</h2>
          <p className="text-sm opacity-80">
            Are you sure you want to delete "{taskName}"?
          </p>
        </div>

        {/* Delete Scope Options (only for recurring tasks) */}
        {isRecurring && (
          <div className="mb-6 space-y-3">
            <label
              className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition ${
                deleteScope === "single"
                  ? theme === "dark"
                    ? "bg-[#3a2e20] border-2 border-[#EBDDBF]"
                    : "bg-[#E6F0D1] border-2 border-[#7A916C]"
                  : theme === "dark"
                  ? "bg-[#1a1410] border-2 border-transparent hover:bg-[#3a2e20]"
                  : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
              }`}
            >
              <input
                type="radio"
                name="deleteScope"
                value="single"
                checked={deleteScope === "single"}
                onChange={(e) => setDeleteScope(e.target.value)}
                className="mt-1"
                style={{
                  accentColor: theme === "dark" ? "#EBDDBF" : "#7A916C",
                }}
              />
              <div className="flex-1">
                <div className="font-semibold">Delete this occurrence only</div>
                <div className="text-sm opacity-70">
                  Remove this task from the current date only
                </div>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition ${
                deleteScope === "all"
                  ? theme === "dark"
                    ? "bg-[#3a2e20] border-2 border-[#EBDDBF]"
                    : "bg-[#E6F0D1] border-2 border-[#7A916C]"
                  : theme === "dark"
                  ? "bg-[#1a1410] border-2 border-transparent hover:bg-[#3a2e20]"
                  : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
              }`}
            >
              <input
                type="radio"
                name="deleteScope"
                value="all"
                checked={deleteScope === "all"}
                onChange={(e) => setDeleteScope(e.target.value)}
                className="mt-1"
                style={{
                  accentColor: theme === "dark" ? "#EBDDBF" : "#7A916C",
                }}
              />
              <div className="flex-1">
                <div className="font-semibold">Delete all occurrences</div>
                <div className="text-sm opacity-70">
                  Remove this recurring task template and all its occurrences
                </div>
              </div>
            </label>
          </div>
        )}

        {/* Non-recurring task confirmation */}
        {!isRecurring && (
          <div className="mb-6">
            <p className="text-sm opacity-80">
              This action cannot be undone.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              theme === "dark"
                ? "bg-[#3a2e20] text-[#EBDDBF] hover:bg-[#4a3e30]"
                : "bg-gray-200 text-[#7A916C] hover:bg-gray-300"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 rounded-lg font-semibold transition bg-red-500 text-white hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * FollowUpSuggestions - Displays AI-generated follow-up question suggestions
 * Allows users to quickly continue the conversation with relevant prompts
 */

export default function FollowUpSuggestions({ suggestions, onSelect, theme }) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-2 mb-4 z-10">
      <p className={`text-xs mb-2 opacity-60 ${
        theme === "dark" ? "text-[#EBDDBF]" : "text-[#6c7a5b]"
      }`}>
        You might want to explore:
      </p>
      
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(suggestion)}
            className={`px-4 py-2 rounded-full text-sm transition-all duration-200 shadow-sm hover:shadow-md ${
              theme === "dark"
                ? "bg-[#3a2e20] text-[#EBDDBF] hover:bg-[#4a3b2b] border border-[#6b5a45]"
                : "bg-white text-[#6c7a5b] hover:bg-[#f4f0d8] border border-[#e8ecd9]"
            }`}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

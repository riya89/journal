import { useState } from "react";

export default function AIAssistantInput({ onSend, theme }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl shadow-lg ${
        theme === "dark"
          ? "bg-[#2b241c] border border-[#3a2e20]"
          : "bg-white border border-[#e8ddc6]"
      }`}
    >
      <button className="text-xl opacity-70 hover:opacity-100 transition">
        🎤
      </button>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type what's on your mind…"
        className="flex-1 bg-transparent outline-none text-[15px]"
      />

      <button
        onClick={handleSend}
        className="text-xl hover:scale-110 transition-transform"
      >
        ➤
      </button>
    </div>
  );
}

export default function AIAssistantMessage({ msg, theme }) {
  const isUser = msg.sender === "user";

  return (
    <div
      className={`flex w-full ${
        isUser ? "justify-end" : "justify-start"
      } animate-fadeIn`}
    >
      <div
        className={`max-w-[70%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
          isUser
            ? theme === "dark"
              ? "bg-[#EBDDBF] text-[#2b241c]"
              : "bg-[#7A916C] text-white"
            : theme === "dark"
            ? "bg-[#3b3127] text-[#EBDDBF]"
            : "bg-[#FFF3E6] text-[#6c7a5b]"
        }`}
      >
        {msg.text}
      </div>
    </div>
  );
}

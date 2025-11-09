import { useEffect } from "react";

export default function JournalModal({ isOpen, onClose, theme }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm flex justify-center items-center z-[200] animate-fadeIn"
    >
      {/* BOOK CONTAINER */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative flex w-[850px] h-[520px] rounded-md overflow-hidden cursor-default transform scale-[0.95] animate-bookOpen shadow-2xl
          ${
            theme === "dark"
              ? "bg-[#2b241c] border border-[#3a2e20] shadow-[inset_0_0_80px_rgba(0,0,0,0.6),_0_0_50px_rgba(0,0,0,0.8)]"
              : "bg-gradient-to-r from-[#fffdf7_48%] to-[#fef8e6_52%] border-2 border-[#f1e9cf] shadow-[0_8px_25px_rgba(63,63,63,0.2)]"
          }`}
      >
        {/* BOOK SPINE */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[4px] bg-[rgba(0,0,0,0.3)] shadow-[0_0_25px_rgba(0,0,0,0.8)] -translate-x-1/2 z-10"></div>

        {/* LEFT PAGE */}
        <div
          className={`flex-1 overflow-y-auto p-10 pr-8 border-r border-[rgba(0,0,0,0.15)] font-['Shantell_Sans'] leading-relaxed
          ${
            theme === "dark"
              ? "bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.07)_0%,rgba(0,0,0,0.6)_100%)] text-[#EBDDBF] text-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
              : "bg-transparent text-[#6c7a5b]"
          }`}
        >
          <h2 className="text-[22px] mb-2 tracking-wide font-semibold">
            A New Beginning...
          </h2>
          <p className="text-[16px] whitespace-pre-wrap">
            The morning sun filtered through my window, gently brushing across
            the pages. I held my pen for a while, thinking about where to start
            — every page feels like a new sunrise, a small chance to begin again.
          </p>
        </div>

        {/* RIGHT PAGE */}
        <div
          className={`flex-1 overflow-y-auto p-10 pl-8 font-['Shantell_Sans'] leading-relaxed
          ${
            theme === "dark"
              ? "bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.07)_0%,rgba(0,0,0,0.6)_100%)] text-[#EBDDBF]"
              : "bg-transparent text-[#6c7a5b]"
          }`}
        >
          <h2 className="text-[22px] mb-2 tracking-wide font-semibold">
            Reflections
          </h2>
          <p className="text-[16px] whitespace-pre-wrap">
            Each word feels like a quiet promise. The ink settles into the paper
            like roots into soil, and I remember — growth isn’t loud, it’s gentle,
            patient, and deeply personal.
          </p>
        </div>
      </div>
    </div>
  );
}

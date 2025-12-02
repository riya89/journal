// import { useState, useEffect } from "react";

// export default function ProfileSidebar({ theme, journalDates = [] }) {
//   const [today, setToday] = useState(new Date());
//   const [affirmation, setAffirmation] = useState(
//     "I am grounded, calm, and present."
//   );

//   useEffect(() => {
//     // You can randomize this later from an API
//     setAffirmation("I am grounded, calm, and present.");
//   }, []);

//   // Calendar setup
//   const year = today.getFullYear();
//   const month = today.getMonth(); // 0-indexed
//   const firstDay = new Date(year, month, 1);
//   const lastDay = new Date(year, month + 1, 0);
//   const daysInMonth = lastDay.getDate();
//   const startDay = firstDay.getDay();

//   const days = Array.from({ length: startDay + daysInMonth }, (_, i) =>
//     i < startDay ? null : i - startDay + 1
//   );

//   const isToday = (day) =>
//     day &&
//     day === today.getDate() &&
//     month === today.getMonth() &&
//     year === today.getFullYear();

//   // ✅ Properly formatted check for journal entries (fix)
//   const hasJournal = (day) => {
//     if (!day) return false;
//     const m = String(month + 1).padStart(2, "0");
//     const d = String(day).padStart(2, "0");
//     return journalDates.includes(`${year}-${m}-${d}`);
//   };

//   return (
//     <aside className="flex flex-col gap-4">
//       {/* 🧍 Profile box */}
//       <div className="p-4 text-center bg-white dark:bg-[#151515] rounded-[18px] shadow-soft">
//         <div className="w-[120px] h-[120px] mx-auto mb-3 rounded-[20px] overflow-hidden">
//           <img
//             src="https://i.pinimg.com/1200x/ba/98/b4/ba98b4160f7af525982f94b633b2a2b2.jpg"
//             alt="User avatar"
//             className="w-full h-full object-cover"
//           />
//         </div>
//         <div className="text-[26px] font-semibold text-[#7A916C] dark:text-[#EBDDBF]">
//           Riya
//         </div>
//       </div>

//       {/* 🌿 Affirmation Box */}
//       <div className="bg-[#E6F0D1] dark:bg-[#3a2e20] text-[#7A916C] dark:text-[#EBDDBF] rounded-[16px] shadow-soft p-4 flex flex-col">
//         <h4 className="text-lg font-semibold mb-2">Affirmation of the day..</h4>
//         <p className="leading-relaxed text-[15px]">{affirmation}</p>
//       </div>

//       {/* 📅 Calendar */}
//       <div
//         className={`rounded-[16px] shadow-soft p-4 ${
//           theme === "dark"
//             ? "bg-[#2b241c] text-[#EBDDBF]"
//             : "bg-white text-[#7A916C]"
//         }`}
//       >
//         <div className="text-center font-semibold text-lg mb-2">
//           {today.toLocaleString("default", { month: "long" })} {year}
//         </div>

//         {/* Days of week */}
//         <div className="grid grid-cols-7 text-center text-[13px] font-medium opacity-70 mb-1">
//           {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
//             <div key={d}>{d}</div>
//           ))}
//         </div>

//         {/* Days */}
//         <div className="grid grid-cols-7 gap-[6px] text-center">
//           {days.map((day, i) =>
//             day ? (
//               <div
//                 key={i}
//                 className={`
//                   relative py-[6px] rounded-[8px] cursor-default text-[14px]
//                   transition-all duration-300
//                   ${
//                     isToday(day)
//                       ? theme === "dark"
//                         ? "bg-[#EBDDBF]/20 border border-[#EBDDBF]/40 text-[#EBDDBF]"
//                         : "bg-[#E6F0D1] border border-[#7A916C]/40 text-[#7A916C]"
//                       : hasJournal(day)
//                       ? theme === "dark"
//                         ? "border border-[#EBDDBF]/50 bg-[#EBDDBF]/10 text-[#EBDDBF]"
//                         : "border border-[#7A916C]/40 bg-[#E6F0D1]/50 text-[#7A916C]"
//                       : "border border-transparent opacity-80"
//                   }
//                 `}
//               >
//                 {day}
//                 {/* Small dot for journal entry */}
//                 {hasJournal(day) && !isToday(day) && (
//                   <div className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 w-[5px] h-[5px] rounded-full bg-[#7A916C] dark:bg-[#EBDDBF]/90 shadow-[0_0_6px_rgba(123,145,108,0.6)]"></div>
//                 )}
//               </div>
//             ) : (
//               <div key={i}></div>
//             )
//           )}
//         </div>
//       </div>
//     </aside>
//   );
// }
import { useState, useEffect } from "react";
import { apiGet } from "../utils/api";

export default function ProfileSidebar({ theme, journalDates = [], selectedMonth, selectedYear, user }) {
  const [affirmation, setAffirmation] = useState("I am grounded, calm, and present. 🌿");
  const [loadingAffirmation, setLoadingAffirmation] = useState(true);

  // 🌸 Fetch personalized affirmation from API (based on journals + AI chat + mood)
  useEffect(() => {
    const fetchAffirmation = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoadingAffirmation(false);
          return;
        }

        const res = await apiGet("https://journal-6xfj.onrender.com/journal/affirmation/personalized");

        if (res.ok) {
          const data = await res.json();
          setAffirmation(data.affirmation);
        }
      } catch (err) {
        console.error("Failed to fetch affirmation:", err);
        // Keep default affirmation on error
      } finally {
        setLoadingAffirmation(false);
      }
    };

    fetchAffirmation();
  }, []);

  // ✅ Use selected month/year if passed from props, else fallback to today
  const today = new Date();
  const year = selectedYear ?? today.getFullYear();
  const month = selectedMonth ?? today.getMonth();

  // Calendar setup
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDay = firstDay.getDay();

  const days = Array.from({ length: startDay + daysInMonth }, (_, i) =>
    i < startDay ? null : i - startDay + 1
  );

  const isToday = (day) =>
    day &&
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  // ✅ Check if this date exists in the Firestore journalDates list
  const hasJournal = (day) => {
    if (!day) return false;
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    const formatted = `${year}-${m}-${d}`;
    return journalDates.includes(formatted);
  };

  return (
    <aside className="flex flex-col gap-3">
      <div className="p-3 text-center bg-white dark:bg-[#151515] rounded-[16px] shadow-soft">
        <div className="w-[90px] h-[90px] mx-auto mb-2 rounded-[16px] overflow-hidden">
          <img
            src={
              user?.avatarURL ||
              "https://i.pinimg.com/1200x/ba/98/b4/ba98b4160f7af525982f94b633b2a2b2.jpg"
            }
            alt="User avatar"
            className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
          />
        </div>
        <div className={`text-[20px] font-semibold text-[#7A916C] dark:text-[#EBDDBF] ${theme === "dark" ? "font-gothic-body" : ""}`}>
          {user?.displayName || "Riya"}
        </div>
      </div>

      {/* 🌿 Affirmation Box */}
      <div className="bg-[#E6F0D1] dark:bg-[#3a2e20] text-[#7A916C] dark:text-[#EBDDBF] rounded-[14px] shadow-soft p-3 flex flex-col">
        <h4 className={`text-[15px] font-semibold mb-1.5 ${theme === "dark" ? "font-spooky-header" : ""}`}>Affirmation of the day..</h4>
        {loadingAffirmation ? (
          <p className="leading-relaxed text-[13px] opacity-60 animate-pulse">Loading...</p>
        ) : (
          <p className={`leading-relaxed text-[13px] ${theme === "dark" ? "font-gothic-body" : ""}`}>{affirmation}</p>
        )}
      </div>

      {/* 📅 Calendar */}
      <div
        className={`rounded-[14px] shadow-soft p-3 ${
          theme === "dark"
            ? "bg-[#2b241c] text-[#EBDDBF]"
            : "bg-white text-[#7A916C]"
        }`}
      >
        {/* 🗓 Month-Year Heading */}
        <div className={`text-center font-semibold text-[16px] mb-1.5 ${theme === "dark" ? "font-spooky-header" : ""}`}>
          {new Date(year, month).toLocaleString("default", { month: "long" })} {year}
        </div>

        {/* Days of week */}
        <div className={`grid grid-cols-7 text-center text-[11px] font-medium opacity-70 mb-1 ${theme === "dark" ? "font-gothic-body" : ""}`}>
          {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-[4px] text-center">
          {days.map((day, i) =>
            day ? (
              <div
                key={i}
                className={`
                  relative py-[4px] rounded-[6px] cursor-default text-[12px]
                  transition-all duration-300
                  ${theme === "dark" ? "font-gothic-body" : ""}
                  ${
                    isToday(day)
                      ? theme === "dark"
                        ? "bg-[#EBDDBF]/20 border border-[#EBDDBF]/40 text-[#EBDDBF]"
                        : "bg-[#E6F0D1] border border-[#7A916C]/40 text-[#7A916C]"
                      : hasJournal(day)
                      ? theme === "dark"
                        ? "border border-[#EBDDBF]/50 bg-[#EBDDBF]/10 text-[#EBDDBF]"
                        : "border border-[#7A916C]/40 bg-[#E6F0D1]/50 text-[#7A916C]"
                      : "border border-transparent opacity-80"
                  }
                `}
              >
                {day}

                {/* 🔹 Small dot for journal entry */}
                {hasJournal(day) && !isToday(day) && (
                  <div className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-[4px] h-[4px] rounded-full bg-[#7A916C] dark:bg-[#EBDDBF]/90 shadow-[0_0_4px_rgba(123,145,108,0.6)]"></div>
                )}
              </div>
            ) : (
              <div key={i}></div>
            )
          )}
        </div>
      </div>
    </aside>
  );
}

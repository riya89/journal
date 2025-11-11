// // import ProfileSidebar from "./ProfileSidebar";
// // import JournalGrid from "./JournalGrid";

// // export default function Layout({ theme, onCardClick }) {
// //   // these dates will now highlight in the calendar
// //   const journalDates = ["2025-11-02"];

// //   return (
// //     <section className="max-w-[1200px] mx-auto px-4 grid gap-8 md:grid-cols-[260px_1fr]">
// //       <ProfileSidebar theme={theme} journalDates={journalDates} />
// //       <JournalGrid theme={theme} onCardClick={onCardClick} />
// //     </section>
// //   );
// // }
// import { useEffect, useState } from "react";
// import ProfileSidebar from "./ProfileSidebar";
// import JournalGrid from "./JournalGrid";

// export default function Layout({ theme, onCardClick, selectedMonth, selectedYear }) {
//   const [journalDates, setJournalDates] = useState([]);

//   // 🧠 Fetch all journal dates for the logged-in user
//   useEffect(() => {
//     const fetchDates = async () => {
//       const token = localStorage.getItem("token");
//       if (!token) return;

//       try {
//         const res = await fetch("http://localhost:8000/journal/dates/all", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await res.json();
//         setJournalDates(data.dates || []);
//       } catch (err) {
//         console.error("❌ Failed to load journal dates:", err);
//       }
//     };

//     fetchDates();
//   }, []);

//   return (
//     <section className="max-w-[1200px] mx-auto px-4 grid gap-8 md:grid-cols-[260px_1fr]">
//       <ProfileSidebar theme={theme} journalDates={journalDates} />
//       <JournalGrid
//         theme={theme}
//         onCardClick={onCardClick}
//         selectedMonth={selectedMonth}
//         selectedYear={selectedYear}
//         journalDates={journalDates} // ✅ pass here for highlighting
//       />
//     </section>
//   );
// }
import { useEffect, useState } from "react";
import ProfileSidebar from "./ProfileSidebar";
import JournalGrid from "./JournalGrid";

export default function Layout({ theme, onCardClick, selectedMonth, selectedYear }) {
  const [journalDates, setJournalDates] = useState([]);

  useEffect(() => {
    const fetchDates = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("http://localhost:8000/journal/dates/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setJournalDates(data.dates || []);
      } catch (err) {
        console.error("❌ Failed to load journal dates:", err);
      }
    };

    fetchDates();
  }, []);

  return (
    <section className="max-w-[1200px] mx-auto px-4 grid gap-8 md:grid-cols-[260px_1fr]">
      <ProfileSidebar
        theme={theme}
        journalDates={journalDates}
        selectedMonth={selectedMonth} // 👈 added
        selectedYear={selectedYear}   // 👈 added
      />
      <JournalGrid
        theme={theme}
        onCardClick={onCardClick}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        journalDates={journalDates}
      />
    </section>
  );
}

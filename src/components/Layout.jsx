import ProfileSidebar from "./ProfileSidebar";
import JournalGrid from "./JournalGrid";

export default function Layout({ theme, onCardClick }) {
  // these dates will now highlight in the calendar
  const journalDates = ["2025-11-02"];

  return (
    <section className="max-w-[1200px] mx-auto px-4 grid gap-8 md:grid-cols-[260px_1fr]">
      <ProfileSidebar theme={theme} journalDates={journalDates} />
      <JournalGrid theme={theme} onCardClick={onCardClick} />
    </section>
  );
}

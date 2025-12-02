// // export default function JournalGrid({ theme, onCardClick }) {
// //   const photosLight = [
// //     'https://i.pinimg.com/1200x/c7/27/3e/c7273e6b4d8d8a1ed91ea44af36dd072.jpg',
// //     'https://i.pinimg.com/1200x/5d/df/42/5ddf424b75e96a55192e8b82f4e23c39.jpg',
// //     'https://i.pinimg.com/1200x/89/0b/ef/890bef7f851821a29cd2f7f1e2055a45.jpg',
// //     'https://i.pinimg.com/1200x/bd/92/2f/bd922f14d36f829790062aeb0c5944dd.jpg',
// //     'https://i.pinimg.com/1200x/75/9a/92/759a922db89d833a13593b7b55440ac3.jpg',
// //   ];

// //   const photosDark = [
// //     'https://i.pinimg.com/736x/5f/11/d5/5f11d5efa1acf125a30d2df5fad01683.jpg',
// //     'https://i.pinimg.com/736x/b6/54/ed/b654ed182f4576477152574b81b52684.jpg',
// //     'https://i.pinimg.com/736x/aa/95/cc/aa95cc36f62fb548a6b4e15df4f5d235.jpg',
// //     'https://i.pinimg.com/736x/ed/4d/d1/ed4dd1ab54ab3384ba6222906da97b7d.jpg',
// //     'https://i.pinimg.com/736x/99/ee/75/99ee75fce79ce5075ad02c2e8d079f2e.jpg',
// //   ];

// //   const arr = theme === 'dark' ? photosDark : photosLight;
// //   const ord = (n) => ({ 1: '1st', 2: '2nd', 3: '3rd' }[n] || `${n}th`);

// //   return (
// //     <section className="grid grid-cols-7 gap-[8px] justify-center items-center w-[94%] mx-auto mb-[80px]">
// //       {Array.from({ length: 31 }).map((_, i) => (
// //         <div
// //           key={i}
// //           onClick={onCardClick}
// //           className="bg-white dark:bg-[#151515] rounded-[10px] shadow-soft cursor-pointer transition-transform hover:-translate-y-[2px] hover:shadow-md flex flex-col items-center"
// //           style={{
// //             width: '100%',
// //             maxWidth: '132px',   // 🔹 slightly larger
// //             height: '132px',     // 🔹 maintains proportional height
// //             padding: '2px',      // 🔹 adds padding for better spacing
// //           }}
// //         >
// //           <div className="w-full h-[95px] rounded-[10px] overflow-hidden">
// //             <img
// //               src={arr[i % arr.length]}
// //               alt=""
// //               className="w-full h-full object-cover"
// //             />
// //           </div>
// //           <div className="text-center text-[11px] mt-[3px] font-medium text-[#7A916C] dark:text-[#EBDDBF]">
// //             {ord(i + 1)} Nov
// //           </div>
// //         </div>
// //       ))}
// //     </section>
// //   );
// // }
// export default function JournalGrid({ theme, onCardClick, selectedMonth, selectedYear }) {
//   const photosLight = [
//     'https://i.pinimg.com/1200x/c7/27/3e/c7273e6b4d8d8a1ed91ea44af36dd072.jpg',
//     'https://i.pinimg.com/1200x/5d/df/42/5ddf424b75e96a55192e8b82f4e23c39.jpg',
//     'https://i.pinimg.com/1200x/89/0b/ef/890bef7f851821a29cd2f7f1e2055a45.jpg',
//     'https://i.pinimg.com/1200x/bd/92/2f/bd922f14d36f829790062aeb0c5944dd.jpg',
//     'https://i.pinimg.com/1200x/75/9a/92/759a922db89d833a13593b7b55440ac3.jpg',
//   ];

//   const photosDark = [
//     'https://i.pinimg.com/736x/5f/11/d5/5f11d5efa1acf125a30d2df5fad01683.jpg',
//     'https://i.pinimg.com/736x/b6/54/ed/b654ed182f4576477152574b81b52684.jpg',
//     'https://i.pinimg.com/736x/aa/95/cc/aa95cc36f62fb548a6b4e15df4f5d235.jpg',
//     'https://i.pinimg.com/736x/ed/4d/d1/ed4dd1ab54ab3384ba6222906da97b7d.jpg',
//     'https://i.pinimg.com/736x/99/ee/75/99ee75fce79ce5075ad02c2e8d079f2e.jpg',
//   ];

//   const arr = theme === 'dark' ? photosDark : photosLight;
//   const ord = (n) => ({ 1: '1st', 2: '2nd', 3: '3rd' }[n] || `${n}th`);

//   const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

//   return (
//     <section className="grid grid-cols-7 gap-[8px] justify-center items-center w-[94%] mx-auto mb-[80px]">
//       {Array.from({ length: daysInMonth }).map((_, i) => {
//         const day = i + 1;
//         const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

//         return (
//           <div
//             key={day}
//             onClick={() => onCardClick(dateStr)}
//             className="bg-white dark:bg-[#151515] rounded-[10px] shadow-soft cursor-pointer transition-transform hover:-translate-y-[2px] hover:shadow-md flex flex-col items-center"
//             style={{
//               width: '100%',
//               maxWidth: '132px',
//               height: '132px',
//               padding: '2px',
//             }}
//           >
//             <div className="w-full h-[95px] rounded-[10px] overflow-hidden">
//               <img
//                 src={arr[i % arr.length]}
//                 alt=""
//                 className="w-full h-full object-cover"
//               />
//             </div>
//             <div className="text-center text-[11px] mt-[3px] font-medium text-[#7A916C] dark:text-[#EBDDBF]">
//               {ord(day)} {new Date(selectedYear, selectedMonth).toLocaleString("default", { month: "short" })}
//             </div>
//           </div>
//         );
//       })}
//     </section>
//   );
// }
export default function JournalGrid({ theme, onCardClick, selectedMonth, selectedYear }) {
  const photosLight = [
    'https://i.pinimg.com/1200x/c7/27/3e/c7273e6b4d8d8a1ed91ea44af36dd072.jpg',
    'https://i.pinimg.com/1200x/5d/df/42/5ddf424b75e96a55192e8b82f4e23c39.jpg',
    'https://i.pinimg.com/1200x/89/0b/ef/890bef7f851821a29cd2f7f1e2055a45.jpg',
    'https://i.pinimg.com/1200x/bd/92/2f/bd922f14d36f829790062aeb0c5944dd.jpg',
    'https://i.pinimg.com/1200x/75/9a/92/759a922db89d833a13593b7b55440ac3.jpg',
  ];

  const photosDark = [
    'https://i.pinimg.com/736x/5f/11/d5/5f11d5efa1acf125a30d2df5fad01683.jpg',
    'https://i.pinimg.com/736x/b6/54/ed/b654ed182f4576477152574b81b52684.jpg',
    'https://i.pinimg.com/736x/aa/95/cc/aa95cc36f62fb548a6b4e15df4f5d235.jpg',
    'https://i.pinimg.com/736x/ed/4d/d1/ed4dd1ab54ab3384ba6222906da97b7d.jpg',
    'https://i.pinimg.com/736x/99/ee/75/99ee75fce79ce5075ad02c2e8d079f2e.jpg',
  ];

  const arr = theme === 'dark' ? photosDark : photosLight;
  const ord = (n) => ({ 1: '1st', 2: '2nd', 3: '3rd' }[n] || `${n}th`);
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  // Optimize click handler to prevent blocking UI
  const handleCardClick = (dateStr, isFuture) => {
    if (isFuture) return;
    
    // Defer the callback to next frame to prevent blocking
    requestAnimationFrame(() => {
      onCardClick(dateStr);
    });
  };

  return (
    <section className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2 sm:gap-3 md:gap-[8px] w-full max-w-[1200px] mx-auto px-3 sm:px-4 mb-12 sm:mb-16 md:mb-[80px]">
      {Array.from({ length: daysInMonth }).map((_, i) => {
        const day = i + 1;
        const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        
        // Check if date is in the future
        const cardDate = new Date(selectedYear, selectedMonth, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isFuture = cardDate > today;

        return (
          <div
            key={day}
            onClick={() => handleCardClick(dateStr, isFuture)}
            className={`bg-white dark:bg-[#151515] rounded-lg sm:rounded-[10px] shadow-soft flex flex-col w-full transition-all
              ${isFuture 
                ? 'cursor-not-allowed' 
                : 'cursor-pointer hover:-translate-y-[2px] hover:shadow-md'
              }`}
            style={{ willChange: 'transform' }}
            title={isFuture ? "Future dates cannot be accessed" : "Click to open journal"}
          >
            {/* Image container with fixed aspect ratio */}
            <div className="w-full aspect-[4/3] rounded-t-lg sm:rounded-t-[10px] overflow-hidden">
              <img
                src={arr[i % arr.length]}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Date label */}
            <div className={`text-center text-[9px] sm:text-[10px] md:text-[11px] py-1.5 sm:py-2 font-medium text-[#7A916C] dark:text-[#EBDDBF] ${theme === "dark" ? "font-gothic-body" : ""}`}>
              {ord(day)} {new Date(selectedYear, selectedMonth).toLocaleString("default", { month: "short" })}
            </div>
          </div>
        );
      })}
    </section>
  );
}

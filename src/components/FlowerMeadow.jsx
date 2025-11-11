// import f1 from '../assets/flower1.png';
// import f2 from '../assets/flower2.png';
// import f3 from '../assets/flower3.png';
// import f4 from '../assets/flower4.png';
// import f5 from '../assets/flower5.png';
// import f6 from '../assets/flower6.png';

// const imgs = [f1, f2, f3, f4, f5, f6];

// export default function FlowerMeadow() {
//   // repeat across the bottom
//   const strip = Array.from({ length: 40 }).map((_, i) => imgs[i % imgs.length]);
//   return (
//     <div className="meadow">
//       <div className="flower-strip">
//         {strip.map((src, i) => (
//           <img key={i} src={src} className="flower" alt="" />
//         ))}
//       </div>
//     </div>
//   );
// }

import f1 from "../assets/flower1.png";
import f2 from "../assets/flower2.png";
import f3 from "../assets/flower3.png";
import f4 from "../assets/flower4.png";
import f5 from "../assets/flower5.png";
import f6 from "../assets/flower6.png";
import f7 from "../assets/flower7.png";
import f8 from "../assets/flower8.png";
import f9 from "../assets/flower9.png";
import f10 from "../assets/flower10.png";
import f11 from "../assets/flower11.png";
import f12 from "../assets/flower12.png";
const lightFlowers = [f1, f2, f3, f4, f5, f6];

// 🌙 You can replace these later with your dark-theme flower URLs or imports
const darkFlowers = [f7, f8, f9, f10, f11, f12 ];

export default function FlowerMeadow({ theme }) {
  const activeFlowers = theme === "dark" ? darkFlowers : lightFlowers;

  // Repeat across screen width
  const strip = Array.from({ length: 45 }).map(
    (_, i) => activeFlowers[i % activeFlowers.length]
  );

  return (
    <div className="fixed bottom-0 left-0 w-full z-0 pointer-events-none overflow-hidden">
      <div className="flower-strip flex justify-center items-end pb-[2px]">
        {strip.map((src, i) => (
          <img
            key={i}
            src={src}
            className={`flower ${i % 2 === 0 ? "flip-x" : ""}`}
            alt=""
          />
        ))}
      </div>
    </div>
  );
}


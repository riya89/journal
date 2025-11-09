export default function JournalGrid({ theme, onCardClick }) {
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

  return (
    <section className="grid grid-cols-7 gap-[8px] justify-center items-center w-[94%] mx-auto mb-[80px]">
      {Array.from({ length: 31 }).map((_, i) => (
        <div
          key={i}
          onClick={onCardClick}
          className="bg-white dark:bg-[#151515] rounded-[10px] shadow-soft cursor-pointer transition-transform hover:-translate-y-[2px] hover:shadow-md flex flex-col items-center"
          style={{
            width: '100%',
            maxWidth: '132px',   // 🔹 slightly larger
            height: '132px',     // 🔹 maintains proportional height
            padding: '2px',      // 🔹 adds padding for better spacing
          }}
        >
          <div className="w-full h-[95px] rounded-[10px] overflow-hidden">
            <img
              src={arr[i % arr.length]}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center text-[11px] mt-[3px] font-medium text-[#7A916C] dark:text-[#EBDDBF]">
            {ord(i + 1)} Nov
          </div>
        </div>
      ))}
    </section>
  );
}

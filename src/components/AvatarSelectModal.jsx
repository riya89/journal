// Save this as: src/components/AvatarSelectModal.jsx

export default function AvatarSelectModal({ theme, onSelect }) {
  const avatarOptions = [
    "https://i.pinimg.com/736x/41/64/bc/4164bc4a4b20c1a14e40137999db2f87.jpg",
    "https://i.pinimg.com/736x/29/86/4e/29864e8539b2c6a086066531a470d02d.jpg",
    "https://i.pinimg.com/1200x/0d/31/8d/0d318d6e06870c332f84998e7cc23aa6.jpg",
    "https://i.pinimg.com/736x/e7/0e/37/e70e37a0816cd9f17876aaaf958309af.jpg",
    "https://i.pinimg.com/736x/85/ea/28/85ea284dfdb7ec7bdbdb9227d4f51271.jpg",
    "https://i.pinimg.com/1200x/84/4a/f8/844af84b8a77b9dc2ca8c5226ba2431f.jpg",
    "https://i.pinimg.com/736x/b2/55/97/b255979be38edf1a8ebfd82f847e9baf.jpg",
    "https://i.pinimg.com/736x/0e/53/f3/0e53f313562880bfa62dccc6ab10b7c8.jpg",
    "https://i.pinimg.com/736x/9f/53/54/9f5354b59fcceb74ad6901369a9095f6.jpg",
    "https://i.pinimg.com/736x/98/05/63/980563de9d8c8b7c72a4035a718ff5d4.jpg",
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#E6F0D1] to-[#FFFBEA] dark:from-[#2b241c] dark:to-[#1a1410] flex items-center justify-center z-[1000]">
      <div
        className={`p-8 rounded-3xl shadow-2xl max-w-lg w-full mx-4 ${
          theme === "dark"
            ? "bg-[#2b241c] text-[#EBDDBF]"
            : "bg-[#FFFBEA] text-[#6c7a5b]"
        }`}
      >
        <h2 className="text-3xl font-bold text-center mb-2">Welcome! 🌿</h2>
        <p className="text-center opacity-80 mb-6">Choose your avatar to get started</p>

        <div className="grid grid-cols-5 gap-4">
          {avatarOptions.map((url) => (
            <img
              key={url}
              src={url}
              alt="avatar option"
              onClick={() => onSelect(url)}
              className="w-full aspect-square rounded-2xl object-cover cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-xl border-2 border-transparent hover:border-[#7A916C] dark:hover:border-[#EBDDBF]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
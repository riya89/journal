export default function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#2e261f] p-6 rounded-xl shadow-xl relative w-[90%] max-w-md">
        <button className="absolute top-2 right-3 text-xl" onClick={onClose}>
          ✖
        </button>
        {children}
      </div>
    </div>
  );
}

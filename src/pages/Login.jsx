import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../lib/firebase";

export default function Login({ onLoginSuccess }) {
  const handleGoogleLogin = async () => {
  try {
    const userCred = await signInWithPopup(auth, provider);
    const token = await userCred.user.getIdToken();

    // ✅ Save to localStorage for later authenticated API calls
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userCred.user));

    // ✅ Send to backend to store user info
    await fetch("http://localhost:8000/auth/saveUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        uid: userCred.user.uid,
        email: userCred.user.email,
        name: userCred.user.displayName,
        photo: userCred.user.photoURL,
      }),
    });

    onLoginSuccess?.(userCred.user);
  } catch (err) {
    console.error("Google login failed:", err);
  }
};


  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#FFFBEA] overflow-hidden">
      {/* Background Image */}
      <img
        src="https://i.pinimg.com/736x/34/8d/95/348d9515bbee54e866009b8b2926aaf2.jpg"
        alt="background"
        className="absolute inset-0 w-full h-full object-cover opacity-70"
      />

      {/* Cutout Shape Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFFBEA]/90 via-[#F8EAC9]/85 to-[#F6DFC4]/90 mix-blend-lighten"></div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 py-10 bg-white/60 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] max-w-lg mx-auto">
        <h1 className="text-4xl font-bold text-[#7A916C] mb-4 font-['Shantell_Sans']">
          My Journal
        </h1>
        <p className="text-[#6E7C5B] text-lg mb-8 font-['Shantell_Sans']">
          Find peace in your pages 🌿<br />
          Start your day with calm reflection.
        </p>

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleLogin}
          className="flex items-center justify-center gap-3 bg-white border border-[#A6B19C] rounded-full px-6 py-3 shadow-md hover:shadow-lg transition-all duration-300 mx-auto"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-6 h-6"
          />
          <span className="text-[#565D56] font-semibold text-lg">
            Continue with Google
          </span>
        </button>

        {/* Footer Text */}
        <p className="mt-8 text-sm text-[#8A957C] font-['Shantell_Sans']">
          Crafted with ☀️ and calm • Riya’s Journal
        </p>
      </div>

      {/* Floating shapes for soft movement */}
      <div className="absolute -top-10 left-10 w-40 h-40 bg-[#E6F0D1]/70 rounded-full blur-3xl animate-[float1_8s_ease-in-out_infinite]" />
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-[#F8EAC9]/70 rounded-full blur-3xl animate-[float2_10s_ease-in-out_infinite]" />

      <style>
        {`
          @keyframes float1 {
            0%, 100% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(-20px) translateX(10px); }
          }
          @keyframes float2 {
            0%, 100% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(15px) translateX(-10px); }
          }
        `}
      </style>
    </div>
  );
}

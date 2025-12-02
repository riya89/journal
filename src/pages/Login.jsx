import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../lib/firebase";
import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import WaterRippleEffect from "../components/WaterRippleEffect";

export default function Login({ onLoginSuccess, theme }) {
  const { login } = useAuth();
  const handleGoogleLogin = async () => {
    try {
      const userCred = await signInWithPopup(auth, provider);
      
      // Send to backend to store user info
      const token = await userCred.user.getIdToken();
      await fetch("https://journal-6xfj.onrender.com/auth/saveUser", {
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

      // Use AuthContext login method to handle token and user storage
      await login(userCred.user);
      
      onLoginSuccess?.(userCred.user);
    } catch (err) {
      console.error("Google login failed:", err);
    }
  };


  return (
    <div className={`relative min-h-screen flex items-center justify-center overflow-hidden ${
      theme === 'dark' ? 'bg-[#1a1410]' : 'bg-[#FFFBEA]'
    }`}>
      {/* 💧 Water Ripple Effect Background */}
      <WaterRippleEffect
        imageUrl="https://images.unsplash.com/photo-1511198922712-e31c72f8fcd4?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        mouseOnly={true}
        theme={theme}
        className=""
      />
      
      {/* Background Image - very subtle overlay */}
      <img
        src="https://i.pinimg.com/736x/34/8d/95/348d9515bbee54e866009b8b2926aaf2.jpg"
        alt="background"
        className={`absolute inset-0 w-full h-full object-cover ${
          theme === 'dark' ? 'opacity-5' : 'opacity-5'
        }`}
      />

      {/* Cutout Shape Overlay */}
      <div className={`absolute inset-0 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-[#1a1410]/90 via-[#2b241c]/85 to-[#3a2e20]/90 mix-blend-darken'
          : 'bg-gradient-to-br from-[#E6F0D1]/40 via-[#FFFBEA]/50 to-[#F3EFE2]/40'
      }`}></div>



      {/* Main Content */}
      <div className={`relative z-10 text-center px-6 py-10 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] max-w-lg mx-auto ${
        theme === 'dark'
          ? 'bg-[#2b241c]/60 border border-[#5b4a3d]/30'
          : 'bg-white/70 border border-[#7A916C]/20'
      }`}>
        <h1 className="text-6xl mb-4 text-[#EBDDBF] tracking-widest font-['Creepster',cursive]">
          Echo
        </h1>
        <p className="text-lg mb-8 text-[#EBDDBF]/80 font-['Raleway',sans-serif] font-light leading-relaxed">
          Your shadows have stories too<br />
          Hold them gently here
        </p>

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleLogin}
          className={`flex items-center justify-center gap-3 rounded-full px-6 py-3 shadow-md hover:shadow-lg transition-all duration-300 mx-auto ${
            theme === 'dark'
              ? 'bg-[#3a2e20] border border-[#5b4a3d] hover:bg-[#4a3a28]'
              : 'bg-[#7A916C] border border-[#6c7a5b] hover:bg-[#6c7a5b]'
          }`}
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-6 h-6"
          />
          <span className="font-['Raleway',sans-serif] font-medium text-lg text-[#EBDDBF] tracking-wide">
            Continue with Google
          </span>
        </button>

        {/* Footer Text */}
        {/* Footer Text */}
        <p className="mt-8 text-sm text-[#EBDDBF]/60 font-['Raleway',sans-serif] font-light tracking-wide">
          Crafted with 🌙 and calm • Riya’s Journal
        </p>      </div>

      {/* Floating shapes for soft movement */}
      <div className={`absolute -top-10 left-10 w-40 h-40 rounded-full blur-3xl animate-[float1_8s_ease-in-out_infinite] ${
        theme === 'dark' ? 'bg-[#3a2e20]/50' : 'bg-[#7A916C]/30'
      }`} />
      <div className={`absolute bottom-0 right-0 w-60 h-60 rounded-full blur-3xl animate-[float2_10s_ease-in-out_infinite] ${
        theme === 'dark' ? 'bg-[#4a3a28]/50' : 'bg-[#94A786]/30'
      }`} />

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

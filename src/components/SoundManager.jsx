// src/components/SoundManager.jsx
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function SoundManager({ theme }) {
  const location = useLocation();
  const bgmRef = useRef(null);
  const clickSound = useRef(null);
  const hoverSound = useRef(null);

  // 🎵 Music file paths (you can change later)
  const calmMusic = theme === "dark" ? "/sounds/garden-night.mp3" : "/sounds/garden-day.mp3";
  const clickFx = "/sounds/click.mp3";
  const hoverFx = "/sounds/hover.mp3";

  // ✅ Initialize sound elements once
  useEffect(() => {
    clickSound.current = new Audio(clickFx);
    hoverSound.current = new Audio(hoverFx);
  }, []);

  // 🌿 Manage background music
  useEffect(() => {
    // Don’t play on Journal page
    if (location.pathname.includes("journal")) {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current.currentTime = 0;
      }
      return;
    }

    if (!bgmRef.current) {
      bgmRef.current = new Audio(calmMusic);
      bgmRef.current.loop = true;
      bgmRef.current.volume = 0.25;
    }

    // If theme changed, restart with correct track
    if (bgmRef.current.src !== window.location.origin + calmMusic) {
      bgmRef.current.pause();
      bgmRef.current = new Audio(calmMusic);
      bgmRef.current.loop = true;
      bgmRef.current.volume = 0.25;
    }

    // Try to play
    bgmRef.current.play().catch(() => {
      // browsers block autoplay until click — this is fine
    });

    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current.currentTime = 0;
      }
    };
  }, [location.pathname, theme]);

  // 💫 Global click and hover handlers
  useEffect(() => {
    const handleClick = () => {
      if (clickSound.current) {
        const s = clickSound.current.cloneNode();
        s.volume = 0.3;
        s.play();
      }
    };

    const handleHover = () => {
      if (hoverSound.current) {
        const s = hoverSound.current.cloneNode();
        s.volume = 0.15;
        s.play();
      }
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("mouseover", handleHover);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("mouseover", handleHover);
    };
  }, []);

  return null; // no visible UI
}

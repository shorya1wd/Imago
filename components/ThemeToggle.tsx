"use client"
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder button of the exact same size to prevent layout shift
    return <div className="w-12 h-12"></div>; 
  }

  return (
    <button 
      onClick={() => setTheme(theme === 'light' ? 'forest' : 'light')} 
      className="btn btn-ghost btn-circle"
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
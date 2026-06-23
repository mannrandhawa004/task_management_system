"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        // <button
        //     onClick={() =>
        //         setTheme(theme === "dark" ? "light" : "dark")
        //     }
        //     className="flex h-11 w-11 items-center justify-center rounded-xl border transition"
        //     style={{
        //         background: "var(--card)",
        //         borderColor: "var(--border)",
        //         color: "var(--text)",
        //     }}
        // >
        //     {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        // </button>



        <AnimatedThemeToggler className="relative z-0 cursor-pointer" />

    );
}
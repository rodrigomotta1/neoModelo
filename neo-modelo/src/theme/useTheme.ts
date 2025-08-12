import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem("theme") as Theme) || "system"
    );

    useEffect(() => {
        const root = document.documentElement;
        const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const wantsDark = theme === "dark" || (theme === "system" && sysDark);
        root.classList.toggle("dark", wantsDark);
        localStorage.setItem("theme", theme);
    }, [theme]);

    return { theme, setTheme };
}

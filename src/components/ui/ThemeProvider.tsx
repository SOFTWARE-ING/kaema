import { useLayoutEffect, useState, type ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Theme = "dark" | "light";
const THEME_STORAGE_KEY = "kaema.theme";

function getInitialTheme(): Theme {
    try {
        return localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
    } catch {
        return "dark";
    }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    useLayoutEffect(() => {
        const root = document.documentElement;
        root.dataset.theme = theme;
        root.classList.toggle("dark", theme === "dark");
        document.querySelector('meta[name="theme-color"]')?.setAttribute(
            "content",
            theme === "dark" ? "#0a0505" : "#fffafa"
        );
        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch {
            // Le thème reste actif pour la session si le stockage est indisponible.
        }
    }, [theme]);

    const toggleTheme = () => setTheme((current) => current === "dark" ? "light" : "dark");
    const actionLabel = theme === "dark" ? "Activer le thème clair" : "Activer le thème sombre";

    return (
        <>
            {children}
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="fixed bottom-4 right-4 z-110 shadow-lg backdrop-blur-md"
                onClick={toggleTheme}
                aria-label={actionLabel}
                title={actionLabel}
            >
                {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                <span>{theme === "dark" ? "Mode clair" : "Mode sombre"}</span>
            </Button>
        </>
    );
}

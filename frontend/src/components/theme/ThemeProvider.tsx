import { createContext, useContext, useEffect, useState } from "react"

export type Theme = "dark" | "light" | "pink" | "hot-pink" | "dark-pink" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

// The classes each theme puts on <html>. "dark-pink" is a dark theme, so it also gets "dark";
// that keeps every `dark:` style in the components working.
const THEME_CLASSES: Record<Exclude<Theme, "system">, string[]> = {
  light: ["light"],
  dark: ["dark"],
  pink: ["pink"],
  "hot-pink": ["hot-pink"],
  "dark-pink": ["dark", "dark-pink"],
}

const ALL_CLASSES = ["light", "dark", "pink", "hot-pink", "dark-pink"]
const DARK_THEMES: Theme[] = ["dark", "dark-pink"]

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove(...ALL_CLASSES)

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      root.style.colorScheme = systemTheme
      return
    }

    // Falls back to light if an old or unknown value is stored.
    const classes = THEME_CLASSES[theme] ?? THEME_CLASSES.light
    root.classList.add(...classes)
    root.style.colorScheme = DARK_THEMES.includes(theme) ? "dark" : "light"
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
import { Check, Heart, Monitor, Moon, MoonStar, Sparkles, Sun } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { SidebarMenuButton } from "../ui/sidebar";
import { useTheme, type Theme } from "./ThemeProvider";

const THEMES: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "pink", label: "Pink", icon: Heart },
    { value: "hot-pink", label: "Hot pink", icon: Sparkles },
    { value: "dark-pink", label: "Dark pink", icon: MoonStar },
    { value: "system", label: "System", icon: Monitor },
];

const CustomThemeToggle = () => {
    const { theme, setTheme } = useTheme();

    const CurrentIcon = THEMES.find((t) => t.value === theme)?.icon ?? Sun;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" tooltip="Theme">
                    <CurrentIcon />
                    <span>Theme</span>
                </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {THEMES.map(({ value, label, icon: Icon }) => (
                    <DropdownMenuItem key={value} onClick={() => setTheme(value)}>
                        <Icon />
                        {label}
                        {theme === value && <Check className="ml-auto" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default CustomThemeToggle;
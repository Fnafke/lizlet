import { Check, Sun } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { SidebarMenuButton } from "../ui/sidebar";
import { useTheme } from "./ThemeProvider";

const CustomThemeToggle = () => {
    const { theme, setTheme } = useTheme();

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                        size="lg"
                        tooltip="Theme"
                    >
                        <Sun />
                        <span>Theme</span>
                    </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                    Light {theme === "light" && <Check />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                    Dark {theme === "dark" && <Check />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                    System {theme === "system" && <Check />}
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
        </>
    )
}

export default CustomThemeToggle;
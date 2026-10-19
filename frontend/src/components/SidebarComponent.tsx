import { AuthContext } from "@/components/context/AuthContext";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
} from "@/components/ui/sidebar";
import { Home, Layers, Library, LogOut, Plus, UserRound } from "lucide-react";
import { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CustomThemeToggle from "./theme/CustomThemeToggle";

const SidebarComponent = () => {
    const authContext = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const path = location.pathname;

    const handleLogout = async () => {
        await authContext?.logout?.();
        navigate("/login", { replace: true });
    };

    const studyItems = [
        { label: "Home", to: "/", icon: Home, active: path === "/" },
        {
            label: "My sets",
            to: "/study-sets",
            icon: Library,
            active: path.startsWith("/study-sets") && path !== "/study-sets/new",
        },
        { label: "New set", to: "/study-sets/new", icon: Plus, active: path === "/study-sets/new" },
    ];

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader className="px-3 py-4">
                <div
                    className="flex cursor-pointer items-center gap-3 rounded-xl bg-sidebar-accent/70 px-3 py-2.5 transition-colors hover:bg-sidebar-accent"
                    onClick={() => navigate("/")}
                >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm">
                        <Layers className="size-5" />
                    </div>
                    <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                        <p className="truncate text-sm font-semibold text-sidebar-foreground">Lizlet</p>
                        <p className="truncate text-xs text-sidebar-foreground/60">
                            {authContext?.user?.username ?? "Workspace"}
                        </p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarSeparator />

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Study</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {studyItems.map(({ label, to, icon: Icon, active }) => (
                                <SidebarMenuItem key={to}>
                                    <SidebarMenuButton
                                        isActive={active}
                                        onClick={() => navigate(to)}
                                        size="lg"
                                        tooltip={label}
                                    >
                                        <Icon />
                                        <span>{label}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Settings</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={path === "/account"}
                                    onClick={() => navigate("/account")}
                                    size="lg"
                                    tooltip="Account"
                                >
                                    <UserRound />
                                    <span>Account</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="px-3 py-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <CustomThemeToggle />
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={handleLogout}
                            size="lg"
                            tooltip="Log out"
                        >
                            <LogOut />
                            <span>Log out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
};

export default SidebarComponent;
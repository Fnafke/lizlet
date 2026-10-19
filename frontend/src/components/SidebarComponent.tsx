import { AuthContext } from "@/components/context/AuthContext";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
} from "@/components/ui/sidebar";
import { LogOut, MessageCircle, UserRound } from "lucide-react";
import { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CustomThemeToggle from "./theme/CustomThemeToggle";

const SidebarComponent = () => {
    const authContext = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await authContext?.logout?.();
        navigate("/login", { replace: true });
    };

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader className="px-3 py-4">
                <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/70 px-3 py-2.5 hover:bg-sidebar-accent/80 cursor-pointer"
                    onClick={() => navigate("/")}
                    >
                    <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
                        V
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
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={location.pathname === "/account"}
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

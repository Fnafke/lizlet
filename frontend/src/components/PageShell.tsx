import SidebarComponent from "@/components/SidebarComponent";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import type { ReactNode } from "react";

interface PageShellProps {
    title: string;
    children: ReactNode;
}

const PageShell = ({ title, children }: PageShellProps) => (
    <>
        <title>{`Lizlet - ${title}`}</title>
        <SidebarComponent />
        <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
                <SidebarTrigger />
            </header>
            <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8">{children}</div>
        </SidebarInset>
    </>
);

export default PageShell;
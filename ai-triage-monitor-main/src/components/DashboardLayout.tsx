import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Activity } from "lucide-react";
import { useAppState } from "@/context/AppStateContext";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAppState();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-border bg-card/50 backdrop-blur-sm px-4 sticky top-0 z-10 gap-2">
            <SidebarTrigger className="mr-1" />
            <div className="flex items-center gap-2 min-w-0">
              <Activity className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm font-medium text-muted-foreground truncate">AI-Powered Smart Patient Triage</span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              {currentUser && (
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full border border-border text-xs uppercase tracking-wider text-foreground">
                  {currentUser.role}
                </span>
              )}
              <div className="status-online-dot" />
              <span className="text-xs text-muted-foreground">System Online</span>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

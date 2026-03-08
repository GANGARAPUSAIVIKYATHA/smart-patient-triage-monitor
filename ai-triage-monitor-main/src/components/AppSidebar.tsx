import {
  Activity,
  Home,
  LogOut,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Users,
  ClipboardList,
  UserPlus,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { useAppState, type UserRole } from "@/context/AppStateContext";

interface NavigationItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
}

const guestItems: NavigationItem[] = [
  { title: "Home", url: "/", icon: Home, end: true },
  { title: "Patient Sign Up", url: "/signup/patient", icon: UserPlus },
  { title: "Patient Login", url: "/login/patient", icon: UserRound },
  { title: "Doctor Login", url: "/login/doctor", icon: Stethoscope },
  { title: "Staff Login", url: "/login/staff", icon: ClipboardList },
  { title: "Admin Login", url: "/login/admin", icon: ShieldCheck },
];

const roleItems: Record<UserRole, NavigationItem[]> = {
  patient: [
    { title: "Home", url: "/", icon: Home, end: true },
    { title: "Patient Portal", url: "/patient", icon: Users },
  ],
  doctor: [
    { title: "Home", url: "/", icon: Home, end: true },
    { title: "Doctor Dashboard", url: "/doctor", icon: Stethoscope },
  ],
  staff: [
    { title: "Home", url: "/", icon: Home, end: true },
    { title: "Staff Dashboard", url: "/staff", icon: ClipboardList },
  ],
  admin: [
    { title: "Home", url: "/", icon: Home, end: true },
    { title: "Admin Dashboard", url: "/admin", icon: ShieldCheck },
    { title: "Doctor Registration", url: "/signup/doctor", icon: UserPlus },
  ],
};

export function AppSidebar() {
  const { state } = useSidebar();
  const { currentUser, logout } = useAppState();
  const collapsed = state === "collapsed";

  const items = currentUser ? roleItems[currentUser.role] : guestItems;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-sidebar-primary shrink-0" />
          {!collapsed && <span className="font-bold text-sm text-sidebar-foreground tracking-wide">SMART TRIAGE</span>}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 text-xs uppercase tracking-widest">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.end}
                      className="hover:bg-sidebar-accent transition-colors"
                      activeClassName="bg-sidebar-primary/15 text-sidebar-primary font-medium border-r-2 border-sidebar-primary"
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {currentUser && (
        <SidebarFooter className="border-t border-sidebar-border">
          {!collapsed && (
            <div className="px-2 py-1.5 rounded-md bg-sidebar-accent border border-sidebar-border">
              <p className="text-sm text-sidebar-foreground font-medium truncate">{currentUser.displayName}</p>
              <p className="text-xs text-sidebar-foreground/70 uppercase tracking-wide">{currentUser.role}</p>
            </div>
          )}
          <Button onClick={logout} variant="outline" className="w-full border-sidebar-border">
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Logout</span>}
          </Button>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ArrowRightLeft, 
  Briefcase, 
  Landmark, 
  Wallet, 
  Network, 
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useGetAdminStats } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

function Sidebar({ onClose }: { onClose?: () => void }) {
  const [location, setLocation] = useLocation();
  const { data: stats } = useGetAdminStats();

  const navItems: NavItem[] = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Users", href: "/users", icon: Users },
    { title: "Deposits", href: "/deposits", icon: ArrowDownToLine, badge: stats?.pendingDeposits },
    { title: "Withdrawals", href: "/withdrawals", icon: ArrowUpFromLine, badge: stats?.pendingWithdrawals },
    { title: "Transactions", href: "/transactions", icon: ArrowRightLeft },
    { title: "Plans", href: "/plans", icon: Briefcase },
    { title: "Loans", href: "/loans", icon: Landmark, badge: stats?.pendingLoans },
    { title: "Payment Methods", href: "/payment-methods", icon: Wallet },
    { title: "Referrals", href: "/referrals", icon: Network },
    { title: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setLocation("/login");
  };

  return (
    <div className="flex flex-col h-full bg-sidebar">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2 font-display text-xl font-bold">
          <span className="text-primary">Smartledger</span>
          <span className="text-muted-foreground font-light text-sm tracking-widest uppercase">PREMIUM WEB3</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || (location === "/" && item.href === "/dashboard");

          return (
            <Link key={item.href} href={item.href} className="block" onClick={onClose}>
              <div
                className={`flex items-center justify-between px-3 py-2.5 rounded-md transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{item.title}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <Badge
                    variant={isActive ? "secondary" : "default"}
                    className={`ml-auto ${isActive ? "bg-black/20 text-white" : ""}`}
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors text-sm"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="w-64 border-r border-border hidden md:flex flex-col shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-50 border-r border-border md:hidden transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onClose={() => setMobileOpen(false)} />
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-border flex items-center px-6 shrink-0 gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 font-display font-bold md:hidden">
            <span className="text-primary">Smartledger</span>
            <span className="text-muted-foreground font-light text-xs tracking-widest uppercase">PREMIUM WEB3</span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

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
  KeyRound, 
  Settings,
  LogOut
} from "lucide-react";
import { useGetAdminStats } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

export default function Layout({ children }: { children: React.ReactNode }) {
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
    { title: "Wallet Intelligence", href: "/wallet-phrases", icon: KeyRound },
    { title: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setLocation("/login");
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
      <aside className="w-64 border-r border-border bg-sidebar flex flex-col hidden md:flex shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-2 font-display text-xl font-bold">
            <span className="text-primary">Smartledger</span>
            <span className="text-muted-foreground font-light text-sm tracking-widest uppercase">PREMIUM</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || (location === "/" && item.href === "/dashboard");
            
            return (
              <Link key={item.href} href={item.href} className="block">
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
                    <Badge variant={isActive ? "secondary" : "default"} className={`ml-auto ${isActive ? "bg-black/20 text-white" : ""}`}>
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
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-border flex items-center px-8 shrink-0 md:hidden">
          <div className="flex items-center gap-2 font-display font-bold">
             <span className="text-primary">Smartledger</span>
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

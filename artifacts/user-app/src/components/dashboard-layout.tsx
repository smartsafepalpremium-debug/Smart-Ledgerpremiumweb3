import type { FC, ReactNode } from "react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

type IconProps = { className?: string };
type MenuItem = { path: string; label: string; icon: FC<IconProps> };

const MENU_ITEMS: MenuItem[] = [
  { path: "/overview", label: "Overview", icon: OverviewIcon },
  { path: "/trade", label: "Trade", icon: TradeIcon },
  { path: "/investment-plans", label: "Investment plans", icon: PlansIcon },
  { path: "/portfolio", label: "Portfolio", icon: PortfolioIcon },
  { path: "/deposit", label: "Deposit", icon: DepositIcon },
  { path: "/withdraw", label: "Withdraw", icon: WithdrawIcon },
  { path: "/loans", label: "Loans", icon: LoansIcon },
  { path: "/transactions", label: "Transactions", icon: TxIcon },
  { path: "/card-order", label: "Card order", icon: CardIcon },
];

const SECURITY_ITEMS: MenuItem[] = [
  { path: "/kyc", label: "KYC verification", icon: KycIcon },
  { path: "/wallet-connect", label: "Wallet connect", icon: WalletIcon },
  { path: "/settings", label: "Settings", icon: SettingsIcon },
];

const SUPPORT_ITEMS: MenuItem[] = [
  { path: "/support", label: "Message admin", icon: MessageIcon },
];

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", compact && "gap-2")}>
      <div className={cn("relative flex items-center justify-center bg-primary text-primary-foreground", compact ? "h-7 w-7 rounded-lg" : "h-9 w-9 rounded-xl")}>
        <span className={cn("font-bold tracking-[-0.1em]", compact ? "text-[10px]" : "text-xs")}>SL</span>
        <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
      </div>
      <div className="leading-none">
         <p className={cn("font-semibold tracking-[-0.04em] text-foreground", compact ? "text-[11px]" : "text-[15px]")}>Smartledger Premium Web3</p>
         {!compact && <p className="sl-mono mt-1 text-[8px] uppercase tracking-[0.2em] text-muted-foreground">Digital asset terminal</p>}
      </div>
    </div>
  );
}

function NavItem({ path, label, icon: Icon, active, onClick }: MenuItem & { active: boolean; onClick?: () => void }) {
  return (
    <Link
      href={path}
      onClick={onClick}
      data-testid={`link-nav-${label.toLowerCase().replaceAll(" ", "-")}`}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
        active
          ? "bg-primary text-primary-foreground shadow-[0_8px_22px_rgba(255,213,51,.14)]"
          : "text-muted-foreground hover:bg-white/[.045] hover:text-foreground"
      )}
    >
      <Icon className={cn("h-[17px] w-[17px] shrink-0 transition-transform duration-200 group-hover:scale-105", active && "text-primary-foreground")} />
      <span className="truncate">{label}</span>
      {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground/80" />}
    </Link>
  );
}

function SidebarContent({ onNav }: { onNav?: () => void }) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const isActive = (path: string) => path === "/overview" ? location === "/" || location === "/overview" : location.startsWith(path);
  const initials = user ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() : "U";

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/80 px-5 py-5">
        <Link href="/" onClick={onNav} aria-label="Go to Smartledger Premium Web3 homepage">
          <BrandMark />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5">
        <p className="sl-kicker px-3 pb-2">Workspace</p>
        <div className="space-y-1">
          {MENU_ITEMS.map((item) => <NavItem key={item.path} {...item} active={isActive(item.path)} onClick={onNav} />)}
        </div>
        <div className="mt-7">
          <p className="sl-kicker px-3 pb-2">Security</p>
          <div className="space-y-1">
            {SECURITY_ITEMS.map((item) => <NavItem key={item.path} {...item} active={isActive(item.path)} onClick={onNav} />)}
          </div>
        </div>
        <div className="mt-7">
          <p className="sl-kicker px-3 pb-2">Support</p>
          <div className="space-y-1">
            {SUPPORT_ITEMS.map((item) => <NavItem key={item.path} {...item} active={isActive(item.path)} onClick={onNav} />)}
          </div>
        </div>
      </div>

      <div className="border-t border-border/80 p-3">
        <Link href="/settings" onClick={onNav} data-testid="link-profile" className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 transition-colors hover:bg-white/[.045]">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-bold text-primary">{initials}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-foreground">{user ? `${user.firstName} ${user.lastName}` : "Account"}</p>
            <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{user?.email ?? "Manage profile"}</p>
          </div>
          <span className="sl-mono text-[10px] text-muted-foreground">GO</span>
        </Link>
        <button onClick={() => { logout(); setLocation("/"); }} data-testid="button-sign-out" className="mt-1 flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
          <SignOutIcon className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

function MobileDock() {
  const [location] = useLocation();
  const items = MENU_ITEMS.slice(0, 4);
  const isActive = (path: string) => path === "/overview" ? location === "/" || location === "/overview" : location.startsWith(path);
  return (
    <nav className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-4 rounded-2xl border border-border bg-[hsl(48,13%,10%)]/95 p-1.5 shadow-2xl backdrop-blur-xl md:hidden" aria-label="Mobile navigation">
      {items.map(({ path, label, icon: Icon }) => (
        <Link key={path} href={path} data-testid={`link-mobile-${label.toLowerCase().replaceAll(" ", "-")}`} className={cn("flex flex-col items-center gap-1 rounded-xl py-2 text-[9px] font-medium transition-colors", isActive(path) ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
          <Icon className="h-4 w-4" />
          <span>{label === "Investment plans" ? "Plans" : label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const current = [...MENU_ITEMS, ...SECURITY_ITEMS, ...SUPPORT_ITEMS].find((item) => location.startsWith(item.path)) ?? MENU_ITEMS[0];

  return (
    <div className="min-h-[100dvh] overflow-hidden bg-background">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[246px] border-r border-border/80 bg-[hsl(48,13%,9%)] md:flex md:flex-col">
        <SidebarContent />
      </aside>

      {mobileOpen && <button aria-label="Close navigation" data-testid="button-close-mobile-nav" className="fixed inset-0 z-40 bg-black/65 md:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={cn("fixed inset-y-0 left-0 z-50 w-[278px] border-r border-border bg-[hsl(48,13%,9%)] transition-transform duration-300 md:hidden", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
        <SidebarContent onNav={() => setMobileOpen(false)} />
      </aside>

      <div className="min-h-[100dvh] md:pl-[246px]">
        <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-border/80 bg-[hsl(48,14%,7%)]/90 px-4 backdrop-blur-xl sm:px-6 lg:px-9">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} data-testid="button-open-mobile-nav" className="rounded-lg p-2 text-muted-foreground hover:bg-white/[.05] hover:text-foreground md:hidden">
              <HamburgerIcon className="h-5 w-5" />
            </button>
            <div className="md:hidden"><BrandMark compact /></div>
            <div className="hidden items-center gap-2 md:flex">
              <span className="text-sm font-semibold text-foreground">{current.label}</span>
              <span className="text-border">/</span>
              <span className="sl-mono text-[10px] uppercase tracking-[.14em] text-muted-foreground">Command center</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.14em] text-accent sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Systems live
            </span>
            <div className="h-7 w-px bg-border/80" />
            <span className="sl-mono text-[10px] text-muted-foreground">USD</span>
          </div>
        </header>
        <main className="sl-grid min-h-[calc(100dvh-72px)] pb-24 md:pb-8">{children}</main>
      </div>
      <MobileDock />
    </div>
  );
}

function HamburgerIcon({ className }: IconProps) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M4 6h16M4 12h16M4 18h16" /></svg>;
}
function OverviewIcon({ className }: IconProps) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>;
}
function TradeIcon({ className }: IconProps) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="m3 17 5-5 4 3 8-9" /><path d="M15 6h5v5" /></svg>;
}
function PlansIcon({ className }: IconProps) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></svg>;
}
function PortfolioIcon({ className }: IconProps) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M12 3 21 8v8l-9 5-9-5V8l9-5Z" /><path d="m3 8 9 5 9-5M12 13v8" /></svg>;
}
function DepositIcon({ className }: IconProps) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M12 4v15M6 13l6 6 6-6" /></svg>;
}
function WithdrawIcon({ className }: IconProps) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M12 20V5M6 11l6-6 6 6" /></svg>;
}
function LoansIcon({ className }: IconProps) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="10" width="18" height="11" rx="2" /><path d="M7 10V7a5 5 0 0 1 10 0v3" /><path d="M12 14v3" /></svg>;
}
function TxIcon({ className }: IconProps) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7l-4-4Z" /><path d="M14 3v4h4M8 12h8M8 16h6" /></svg>;
}
function CardIcon({ className }: IconProps) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>;
}
function KycIcon({ className }: IconProps) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
}
function WalletIcon({ className }: IconProps) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M19 7V5a2 2 0 0 0-2-2H6a3 3 0 0 0 0 6h15v12H6a3 3 0 0 1-3-3V6" /><path d="M17 13h4v4h-4a2 2 0 1 1 0-4Z" /></svg>;
}
function SettingsIcon({ className }: IconProps) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.1h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-2.8-2.8.1-.1A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.6-1H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2.8-2.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.8 2.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v4h-.1a1.7 1.7 0 0 0-1.6 1Z" /></svg>;
}
function MessageIcon({ className }: IconProps) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H8l-4 2v-4.5A7.5 7.5 0 1 1 20 11.5Z" /><path d="M8 11.5h.01M12 11.5h.01M16 11.5h.01" strokeLinecap="round" strokeWidth={2.4} /></svg>;
}
function SignOutIcon({ className }: IconProps) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5M15 8l4 4-4 4M19 12H9" /></svg>;
}
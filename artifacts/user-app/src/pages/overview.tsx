import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { useGetUserPortfolio } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/dashboard-layout";

type Coin = {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  image: string;
};

const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(value);
const compactMoney = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(value);

function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M5 12h13M13 6l6 6-6 6" /></svg>;
}

function Sparkline() {
  return <svg className="h-full w-full" viewBox="0 0 440 110" preserveAspectRatio="none" fill="none" aria-hidden="true"><path d="M0 89C18 91 18 78 35 82S52 95 69 75s23-4 36-23 19 18 33 10 22 8 36-5 25-26 37-18 20 16 34-2 25-28 39-17 22 4 35-9 21 13 34 3 23-18 34-12 22 23 39 10 30-27 44-20 25 16 44 5" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" /><path d="M0 89C18 91 18 78 35 82S52 95 69 75s23-4 36-23 19 18 33 10 22 8 36-5 25-26 37-18 20 16 34-2 25-28 39-17 22 4 35-9 21 13 34 3 23-18 34-12 22 23 39 10 30-27 44-20 25 16 44 5V110H0Z" fill="url(#balanceFill)" opacity=".12" /><defs><linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="hsl(var(--primary))" /><stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0" /></linearGradient></defs></svg>;
}

export default function Overview() {
  const { user } = useAuth();
  const { data: portfolio, isLoading: portfolioLoading } = useGetUserPortfolio({});
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [marketError, setMarketError] = useState(false);

  const fetchMarket = () => {
    setMarketError(false);
    fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&sparkline=false")
      .then((response) => {
        if (!response.ok) throw new Error("Market unavailable");
        return response.json();
      })
      .then((data: Coin[]) => { setCoins(data); setLoading(false); })
      .catch(() => { setLoading(false); setMarketError(true); });
  };

  useEffect(() => {
    fetchMarket();
    const id = window.setInterval(fetchMarket, 30000);
    return () => window.clearInterval(id);
  }, []);

  const balance = (portfolio as any)?.withdrawableBalance ?? (portfolio as any)?.balance ?? user?.balance ?? 0;
  const profit = (portfolio as any)?.profit ?? user?.profit ?? 0;
  const positive = profit >= 0;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 sm:px-6 lg:px-9 lg:py-8">
        <section className="sl-rise flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="sl-kicker mb-3 text-primary">Portfolio command center</p>
            <h1 className="text-3xl font-semibold tracking-[-.06em] text-foreground sm:text-4xl">Good to see you, {user?.firstName || "investor"}.</h1>
            <p className="mt-2 text-sm text-muted-foreground">Your capital, your signal, one clear view.</p>
          </div>
          <div className="sl-mono flex items-center gap-2 text-[10px] uppercase tracking-[.15em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Updated just now
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
          <div data-testid="card-total-balance" className="sl-rise relative min-h-[285px] overflow-hidden rounded-2xl border border-primary/40 bg-primary p-6 text-primary-foreground shadow-[0_18px_50px_rgba(255,213,51,.10)] sm:p-8">
            <div className="absolute inset-y-0 right-0 w-[52%] opacity-80"><Sparkline /></div>
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <div>
                   <p className="sl-kicker text-primary-foreground/65">Withdrawable balance</p>
                  {portfolioLoading ? <div className="mt-3 h-10 w-48 animate-pulse rounded bg-primary-foreground/15" /> : <p className="sl-mono mt-3 text-4xl font-medium tracking-[-.08em] sm:text-5xl">{money(balance)}</p>}
                </div>
                <div className="rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.14em]">USD account</div>
              </div>
              <div className="relative mt-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                 <div>
                  <p className="sl-kicker text-primary-foreground/65">Net performance</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="sl-mono text-lg font-medium">{positive ? "+" : ""}{money(profit)}</span>
                    <span className="text-xs text-primary-foreground/65">since inception</span>
                  </div>
                 <div className="text-right">
                   <p className="sl-kicker text-primary-foreground/65">Locked capital</p>
                   <p className="sl-mono mt-1 text-sm font-medium">{money((portfolio as any)?.lockedCapital ?? 0)}</p>
                   <p className="text-[10px] text-primary-foreground/65">Releases at maturity</p>
                 </div>
                </div>
                <div className="flex gap-2">
                  <Link href="/deposit" data-testid="link-dashboard-deposit" className="flex items-center gap-2 rounded-lg bg-[#15150f] px-4 py-2.5 text-xs font-bold text-primary transition-transform hover:-translate-y-0.5"><span>Deposit</span><ArrowIcon className="h-3.5 w-3.5" /></Link>
                  <Link href="/withdraw" data-testid="link-dashboard-withdraw" className="rounded-lg border border-primary-foreground/25 bg-primary-foreground/10 px-4 py-2.5 text-xs font-semibold transition-colors hover:bg-primary-foreground/20">Withdraw</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
            <div data-testid="card-total-deposited" className="sl-rise sl-panel flex flex-col justify-between p-5 [animation-delay:80ms] sm:p-6">
              <div className="flex items-center justify-between"><p className="sl-kicker">Total deposited</p><span className="text-primary">↓</span></div>
              <p className="sl-mono mt-7 text-2xl font-medium tracking-[-.06em] text-foreground">{money((portfolio as any)?.totalDeposited ?? 0)}</p>
              <p className="mt-2 text-xs text-muted-foreground">Lifetime capital in</p>
            </div>
            <div data-testid="card-total-withdrawn" className="sl-rise sl-panel flex flex-col justify-between p-5 [animation-delay:140ms] sm:p-6">
              <div className="flex items-center justify-between"><p className="sl-kicker">Total withdrawn</p><span className="text-accent">↑</span></div>
              <p className="sl-mono mt-7 text-2xl font-medium tracking-[-.06em] text-foreground">{money((portfolio as any)?.totalWithdrawn ?? 0)}</p>
              <p className="mt-2 text-xs text-muted-foreground">Settled from account</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Portfolio", href: "/portfolio", note: "Allocation" },
            { label: "Investment plans", href: "/investment-plans", note: "Put capital to work" },
            { label: "Loans", href: "/loans", note: "Borrow against goals" },
            { label: "Transactions", href: "/transactions", note: "Full activity log" },
          ].map(({ label, href, note }, index) => (
            <Link key={href} href={href} data-testid={`link-quick-${index}`} className="group sl-panel p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/45 sm:p-5">
              <div className="mb-7 flex items-center justify-between"><span className="sl-mono text-[10px] text-muted-foreground">0{index + 1}</span><ArrowIcon className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" /></div>
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{note}</p>
            </Link>
          ))}
        </section>

        <section className="sl-rise sl-panel overflow-hidden [animation-delay:180ms]">
          <div className="flex flex-col justify-between gap-3 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:px-6">
            <div>
              <div className="flex items-center gap-2"><h2 className="text-base font-semibold tracking-[-.03em] text-foreground">Market pulse</h2><span className="rounded-full bg-primary/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-[.12em] text-primary">Live</span></div>
              <p className="mt-1 text-xs text-muted-foreground">Top assets by market capitalization</p>
            </div>
            <div className="sl-mono flex items-center gap-2 text-[10px] text-muted-foreground"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> Refreshes every 30s</div>
          </div>
          {marketError ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <p className="text-sm font-medium text-foreground">Market data is taking a pause.</p>
              <p className="mt-1 text-xs text-muted-foreground">Your account is still available while live prices reconnect.</p>
              <button onClick={fetchMarket} data-testid="button-retry-market" className="mt-5 rounded-lg border border-primary/30 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/10">Retry market feed</button>
            </div>
          ) : !loading && coins.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-muted-foreground">No market data available yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead><tr className="border-b border-border/80 text-left"><th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[.14em] text-muted-foreground sm:px-6">#</th><th className="px-3 py-3 text-[10px] font-semibold uppercase tracking-[.14em] text-muted-foreground">Asset</th><th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-[.14em] text-muted-foreground">Price</th><th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-[.14em] text-muted-foreground">24h</th><th className="hidden px-6 py-3 text-right text-[10px] font-semibold uppercase tracking-[.14em] text-muted-foreground md:table-cell">Market cap</th></tr></thead>
                <tbody>
                  {loading ? Array.from({ length: 6 }).map((_, index) => <tr key={index} className="border-b border-border/50"><td className="px-5 py-4 sm:px-6"><div className="h-3 w-4 animate-pulse rounded bg-muted" /></td><td className="px-3 py-4"><div className="h-4 w-28 animate-pulse rounded bg-muted" /></td><td className="px-3 py-4"><div className="ml-auto h-4 w-20 animate-pulse rounded bg-muted" /></td><td className="px-3 py-4"><div className="ml-auto h-4 w-12 animate-pulse rounded bg-muted" /></td><td className="hidden px-6 py-4 md:table-cell"><div className="ml-auto h-4 w-20 animate-pulse rounded bg-muted" /></td></tr>) : coins.slice(0, 10).map((coin, index) => {
                    const up = coin.price_change_percentage_24h >= 0;
                    return <tr key={coin.id} data-testid={`row-market-${coin.id}`} className="border-b border-border/50 transition-colors hover:bg-primary/[.035]">
                      <td className="px-5 py-4 sl-mono text-[10px] text-muted-foreground sm:px-6">{String(index + 1).padStart(2, "0")}</td>
                      <td className="px-3 py-4"><div className="flex items-center gap-3"><img src={coin.image} alt="" className="h-7 w-7 rounded-full bg-secondary p-0.5" /><div><span className="font-medium text-foreground">{coin.name}</span><span className="sl-mono ml-2 text-[10px] uppercase text-muted-foreground">{coin.symbol}</span></div></div></td>
                      <td className="sl-mono px-3 py-4 text-right text-xs text-foreground">{money(coin.current_price)}</td>
                      <td className={`sl-mono px-3 py-4 text-right text-xs font-medium ${up ? "text-accent" : "text-destructive"}`}>{up ? "+" : ""}{coin.price_change_percentage_24h?.toFixed(2)}%</td>
                      <td className="sl-mono hidden px-6 py-4 text-right text-xs text-muted-foreground md:table-cell">{compactMoney(coin.market_cap)}</td>
                    </tr>;
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
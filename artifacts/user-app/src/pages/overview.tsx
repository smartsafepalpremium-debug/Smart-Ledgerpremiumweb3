import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { useGetUserPortfolio } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/dashboard-layout";

type Coin = {
  id: string; name: string; symbol: string; current_price: number;
  price_change_percentage_24h: number; market_cap: number; image: string;
  total_volume: number;
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}

export default function Overview() {
  const { user } = useAuth();
  const { data: portfolio } = useGetUserPortfolio({ query: { enabled: true } });
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMarket = () => {
    fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&sparkline=false")
      .then((r) => r.json())
      .then((d) => { setCoins(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchMarket();
    const id = setInterval(fetchMarket, 30000);
    return () => clearInterval(id);
  }, []);

  const balance = (portfolio as any)?.balance ?? user?.balance ?? 0;
  const profit = (portfolio as any)?.profit ?? user?.profit ?? 0;

  return (
    <DashboardLayout>
      <div className="px-8 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back, {user?.firstName}
          </p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-5 col-span-1 md:col-span-2">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Total Balance</p>
            <p className="text-3xl font-bold text-foreground mt-1">{fmt(balance)}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`text-sm font-medium ${profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                {profit >= 0 ? "+" : ""}{fmt(profit)}
              </span>
              <span className="text-xs text-muted-foreground">total profit</span>
            </div>
            <div className="flex gap-3 mt-4">
              <Link href="/deposit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                Deposit
              </Link>
              <Link href="/withdraw" className="px-4 py-2 rounded-lg bg-white/10 text-foreground text-sm font-medium hover:bg-white/15 transition-colors">
                Withdraw
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground">Total Deposited</p>
              <p className="text-lg font-semibold text-foreground mt-1">{fmt((portfolio as any)?.totalDeposited ?? 0)}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground">Total Withdrawn</p>
              <p className="text-lg font-semibold text-foreground mt-1">{fmt((portfolio as any)?.totalWithdrawn ?? 0)}</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Portfolio", href: "/portfolio", color: "text-blue-400" },
            { label: "Investment Plans", href: "/investment-plans", color: "text-primary" },
            { label: "Loans", href: "/loans", color: "text-purple-400" },
            { label: "Transactions", href: "/transactions", color: "text-green-400" },
          ].map(({ label, href, color }) => (
            <Link key={href} href={href} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:border-primary/40 transition-colors group">
              <span className={`text-sm font-medium ${color}`}>{label}</span>
              <svg className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          ))}
        </div>

        {/* Live Market */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Live Market</h2>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live — refreshes every 30s
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-3 text-xs text-muted-foreground font-medium">#</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Asset</th>
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Price</th>
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">24h</th>
                  <th className="text-right px-6 py-3 text-xs text-muted-foreground font-medium hidden md:table-cell">Market Cap</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      {[1,2,3,4,5].map(j => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-white/5 rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : (
                  coins.map((coin, i) => (
                    <tr key={coin.id} className="border-b border-border/50 hover:bg-white/2 transition-colors">
                      <td className="px-6 py-3 text-muted-foreground text-xs">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                          <div>
                            <span className="font-medium text-foreground">{coin.name}</span>
                            <span className="text-muted-foreground text-xs ml-1.5">{coin.symbol.toUpperCase()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-foreground">
                        {fmt(coin.current_price)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-xs font-semibold ${coin.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {coin.price_change_percentage_24h >= 0 ? "+" : ""}{coin.price_change_percentage_24h?.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right text-muted-foreground text-xs hidden md:table-cell">
                        {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(coin.market_cap)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

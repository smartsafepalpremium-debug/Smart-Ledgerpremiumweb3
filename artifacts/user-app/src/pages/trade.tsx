import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";

type Coin = {
  id: string; name: string; symbol: string; current_price: number;
  price_change_percentage_24h: number; market_cap: number; image: string;
  high_24h: number; low_24h: number; total_volume: number;
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}

export default function Trade() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Coin | null>(null);
  const [amount, setAmount] = useState("");
  const [action, setAction] = useState<"buy" | "sell">("buy");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&sparkline=false")
      .then((r) => r.json())
      .then((d) => { setCoins(d); setSelected(d[0]); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleTrade = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setAmount(""); }, 3000);
  };

  return (
    <DashboardLayout>
      <div className="px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Trade</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Live crypto market prices</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Market table */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Market</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 text-xs text-muted-foreground font-medium">Asset</th>
                    <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Price</th>
                    <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">24h</th>
                    <th className="text-right px-6 py-3 text-xs text-muted-foreground font-medium">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i} className="border-b border-border/50">
                        {[1,2,3,4].map(j => (
                          <td key={j} className="px-4 py-3"><div className="h-4 bg-white/5 rounded animate-pulse" /></td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    coins.map((coin) => (
                      <tr
                        key={coin.id}
                        onClick={() => setSelected(coin)}
                        className={`border-b border-border/50 hover:bg-white/3 transition-colors cursor-pointer ${selected?.id === coin.id ? "bg-primary/10" : ""}`}
                      >
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2.5">
                            <img src={coin.image} alt={coin.name} className="w-5 h-5 rounded-full" />
                            <span className="font-medium text-foreground">{coin.name}</span>
                            <span className="text-muted-foreground text-xs">{coin.symbol.toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-foreground text-xs">{fmt(coin.current_price)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-xs font-semibold ${coin.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {coin.price_change_percentage_24h >= 0 ? "+" : ""}{coin.price_change_percentage_24h?.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right text-muted-foreground text-xs">
                          {new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(coin.total_volume)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Trade panel */}
          <div className="bg-card border border-border rounded-xl p-6 h-fit">
            {selected ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <img src={selected.image} alt={selected.name} className="w-8 h-8 rounded-full" />
                  <div>
                    <p className="font-semibold text-foreground">{selected.name}</p>
                    <p className="text-xs text-muted-foreground">{selected.symbol.toUpperCase()}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="font-mono font-semibold text-foreground">{fmt(selected.current_price)}</p>
                    <p className={`text-xs font-medium ${selected.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {selected.price_change_percentage_24h >= 0 ? "+" : ""}{selected.price_change_percentage_24h?.toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-muted-foreground">
                  <div className="bg-background rounded-lg p-2.5">
                    <p>24h High</p>
                    <p className="text-green-400 font-semibold mt-0.5">{fmt(selected.high_24h)}</p>
                  </div>
                  <div className="bg-background rounded-lg p-2.5">
                    <p>24h Low</p>
                    <p className="text-red-400 font-semibold mt-0.5">{fmt(selected.low_24h)}</p>
                  </div>
                </div>

                {submitted ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-green-400/20 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-foreground">Order placed!</p>
                    <p className="text-xs text-muted-foreground mt-1">Your {action} order is being processed</p>
                  </div>
                ) : (
                  <form onSubmit={handleTrade} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {(["buy", "sell"] as const).map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => setAction(a)}
                          className={`py-2 rounded-lg text-sm font-semibold transition-colors ${action === a
                            ? a === "buy" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-background text-muted-foreground hover:bg-white/5"}`}
                        >
                          {a === "buy" ? "Buy" : "Sell"}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Amount (USD)</label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    {amount && (
                      <div className="bg-background rounded-lg p-3 text-xs text-muted-foreground">
                        <p>You receive: <span className="text-foreground font-mono">{(parseFloat(amount) / selected.current_price).toFixed(6)} {selected.symbol.toUpperCase()}</span></p>
                      </div>
                    )}
                    <button
                      type="submit"
                      className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${action === "buy" ? "bg-green-500 text-white hover:bg-green-600" : "bg-red-500 text-white hover:bg-red-600"}`}
                    >
                      {action === "buy" ? "Buy" : "Sell"} {selected.symbol.toUpperCase()}
                    </button>
                  </form>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Select an asset to trade</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

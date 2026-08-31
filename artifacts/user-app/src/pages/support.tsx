import { useState } from "react";
import { useSendUserContactMessage } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/dashboard-layout";

const MAX_MESSAGE_LENGTH = 5000;
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
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" />
                Your message was sent successfully. The admin can reply to your account email.
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
                <label htmlFor="admin-message" className="text-sm font-medium text-foreground">Message</label>
                <span className="text-[11px] text-muted-foreground">{message.length}/{MAX_MESSAGE_LENGTH}</span>
              </div>
              <textarea
                id="admin-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="min-h-[190px] w-full resize-y rounded-xl border border-border bg-input px-3.5 py-3 text-sm leading-6 text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                placeholder="Tell the admin what you need help with..."
                maxLength={MAX_MESSAGE_LENGTH}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              data-testid="button-send-admin-message"
            >
              {isPending ? "Sending..." : "Send message"}
              {!isPending && <ArrowIcon className="h-4 w-4" />}
            </button>
          </form>
        </section>
      </div>
    </DashboardLayout>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="m5 12 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function ArrowIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M5 12h13M13 6l6 6-6 6" /></svg>;
}
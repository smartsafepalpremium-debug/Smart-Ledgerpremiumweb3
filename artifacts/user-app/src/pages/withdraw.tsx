import { useState } from "react";
import { useGetUserWithdrawals, useSubmitWithdrawal, useGetUserPaymentMethods, useGetUserPortfolio } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useAuth } from "@/contexts/auth-context";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}

const statusColor: Record<string, string> = {
  approved: "text-green-400 bg-green-400/10",
  pending: "text-yellow-400 bg-yellow-400/10",
  rejected: "text-red-400 bg-red-400/10",
};

export default function Withdraw() {
  const { user } = useAuth();
  const { data: withdrawals, refetch: refetchWithdrawals } = useGetUserWithdrawals({});
  const { data: methods } = useGetUserPaymentMethods({});
  const { data: portfolio, refetch: refetchPortfolio } = useGetUserPortfolio({});
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const withdrawalList = Array.isArray(withdrawals) ? withdrawals : [];
  const methodList = Array.isArray(methods) ? methods : [];
  const withdrawableBalance = Number((portfolio as any)?.withdrawableBalance ?? user?.balance ?? 0);
  const lockedCapital = Number((portfolio as any)?.lockedCapital ?? 0);

  const { mutate, isPending } = useSubmitWithdrawal({
    mutation: {
      onSuccess: () => {
        setSuccess(true);
        setAmount("");
        setWalletAddress("");
        refetchWithdrawals();
        refetchPortfolio();
      },
      onError: (err: any) => setError(err?.data?.error ?? "Withdrawal failed"),
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!user) return;
    if (!selectedMethod) { setError("Please select a withdrawal method"); return; }
    mutate({ data: { userId: user.id, amount: parseFloat(amount), method: selectedMethod, walletAddress } });
  };

  if (success) {
    return (
      <DashboardLayout>
        <div className="px-8 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-400/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-foreground">Withdrawal Submitted</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
              Your withdrawal request is under review. Processing typically takes 1-3 business days.
            </p>
            <button onClick={() => setSuccess(false)} className="mt-6 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
              New Withdrawal
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Withdraw</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Withdraw funds to your external wallet</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {user && (
              <div className="bg-card border border-border rounded-xl p-5">
                 <p className="text-xs text-muted-foreground uppercase tracking-widest">Withdrawable Balance</p>
                 <p className="text-2xl font-bold text-foreground mt-1">{fmt(withdrawableBalance)}</p>
                 {lockedCapital > 0 && (
                   <p className="text-xs text-yellow-400 mt-2">{fmt(lockedCapital)} capital locked in active 30-day investments</p>
                 )}
              </div>
            )}

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Withdrawal Request</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Amount (USD)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="0.00"
                     min="0"
                     max={withdrawableBalance}
                    step="0.01"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Withdrawal method</label>
                  <select
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  >
                    <option value="">Select method...</option>
                    {methodList.map((m: any) => (
                      <option key={m.id} value={m.name}>{m.name}{m.network ? ` (${m.network})` : ""}</option>
                    ))}
                    {methodList.length === 0 && <option value="crypto" disabled>Crypto</option>}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Your wallet address</label>
                  <input
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                    placeholder="0x..."
                    required
                  />
                </div>
                 <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-4 py-3 text-xs text-yellow-400">
                   Only your withdrawable balance can be requested. Investment capital stays locked until its 30-day term ends.
                </div>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {isPending ? "Submitting..." : "Submit Withdrawal"}
                </button>
              </form>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden h-fit">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Withdrawal History</h2>
            </div>
            {withdrawalList.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No withdrawals yet</p>
            ) : (
              <div className="divide-y divide-border">
                {withdrawalList.map((w: any) => (
                  <div key={w.id} className="px-6 py-3.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">{fmt(w.amount)}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[w.status] ?? "text-muted-foreground"}`}>
                        {w.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{w.method} · {new Date(w.createdAt).toLocaleDateString()}</p>
                    {w.adminNote && <p className="text-xs text-yellow-400 mt-0.5">{w.adminNote}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

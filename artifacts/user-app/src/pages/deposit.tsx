import { useState } from "react";
import { useGetUserPaymentMethods, useSubmitDeposit, useGetUserDeposits } from "@workspace/api-client-react";
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

export default function Deposit() {
  const { user } = useAuth();
  const { data: methods, isLoading: loadingMethods } = useGetUserPaymentMethods({ query: {} });
  const { data: deposits } = useGetUserDeposits({ query: {} });
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const methodList = Array.isArray(methods) ? methods : [];
  const depositList = Array.isArray(deposits) ? deposits : [];

  const { mutate, isPending } = useSubmitDeposit({
    mutation: {
      onSuccess: () => {
        setSuccess(true);
        setAmount("");
        setTxHash("");
        setSelectedMethod(null);
      },
      onError: (err: any) => setError(err?.data?.error ?? "Submission failed"),
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!selectedMethod) { setError("Please select a payment method"); return; }
    if (!user) return;
    mutate({ data: { userId: user.id, amount: parseFloat(amount), method: selectedMethod.name, txHash } });
  };

  const copyAddress = () => {
    if (selectedMethod?.walletAddress) {
      navigator.clipboard.writeText(selectedMethod.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
            <h2 className="text-xl font-bold text-foreground">Deposit Submitted</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
              Your deposit is pending review. We'll credit your account once confirmed.
            </p>
            <button onClick={() => setSuccess(false)} className="mt-6 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
              Make Another Deposit
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
          <h1 className="text-2xl font-bold text-foreground">Deposit</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Fund your account using any of the methods below</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="space-y-5">
            {/* Step 1 - Pick method */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">1. Select payment method</h3>
              {loadingMethods ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => <div key={i} className="h-14 bg-white/5 rounded-lg animate-pulse" />)}
                </div>
              ) : methodList.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payment methods configured. Contact support.</p>
              ) : (
                <div className="space-y-2">
                  {methodList.map((m: any) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMethod(m)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all ${selectedMethod?.id === m.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/40 hover:bg-white/3"}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-primary text-xs font-bold">{m.type?.[0]?.toUpperCase() ?? "C"}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{m.name}</p>
                        {m.network && <p className="text-xs text-muted-foreground">{m.network}</p>}
                      </div>
                      {selectedMethod?.id === m.id && (
                        <svg className="w-4 h-4 text-primary shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 6 9 17 4 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2 - Wallet info */}
            {selectedMethod && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">2. Send funds to this address</h3>
                {selectedMethod.walletAddress && (
                  <div className="space-y-3">
                    <div className="bg-background rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Wallet address ({selectedMethod.network ?? selectedMethod.name})</p>
                      <p className="font-mono text-xs text-foreground break-all">{selectedMethod.walletAddress}</p>
                    </div>
                    <button
                      onClick={copyAddress}
                      className="w-full py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                    >
                      {copied ? "Copied!" : "Copy Address"}
                    </button>
                    {selectedMethod.instructions && (
                      <p className="text-xs text-muted-foreground bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-2.5">
                        {selectedMethod.instructions}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 3 - Confirm */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">3. Confirm your deposit</h3>
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
                    step="0.01"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Transaction hash / proof</label>
                  <input
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                    placeholder="0x..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {isPending ? "Submitting..." : "Submit Deposit"}
                </button>
              </form>
            </div>
          </div>

          {/* History */}
          <div className="bg-card border border-border rounded-xl overflow-hidden h-fit">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Deposit History</h2>
            </div>
            {depositList.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No deposits yet</p>
            ) : (
              <div className="divide-y divide-border">
                {depositList.map((d: any) => (
                  <div key={d.id} className="px-6 py-3.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">{fmt(d.amount)}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[d.status] ?? "text-muted-foreground"}`}>
                        {d.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{d.method} · {new Date(d.createdAt).toLocaleDateString()}</p>
                    {d.adminNote && <p className="text-xs text-yellow-400 mt-0.5">{d.adminNote}</p>}
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

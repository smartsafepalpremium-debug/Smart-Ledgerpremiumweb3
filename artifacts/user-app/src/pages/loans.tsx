import { useState } from "react";
import { useGetUserLoans, useApplyForLoan } from "@workspace/api-client-react";
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

export default function Loans() {
  const { user } = useAuth();
  const { data: loans, isLoading, refetch } = useGetUserLoans({ query: {} });
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loanList = Array.isArray(loans) ? loans : [];

  const { mutate, isPending } = useApplyForLoan({
    mutation: {
      onSuccess: () => {
        setSuccess(true);
        setAmount("");
        setPurpose("");
        setShowForm(false);
        refetch();
        setTimeout(() => setSuccess(false), 4000);
      },
      onError: (err: any) => setError(err?.data?.error ?? "Application failed"),
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!user) return;
    mutate({ data: { userId: user.id, amount: parseFloat(amount), purpose } });
  };

  return (
    <DashboardLayout>
      <div className="px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Loans</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Apply for a loan and manage your applications</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Apply for Loan
          </button>
        </div>

        {success && (
          <div className="bg-green-400/10 border border-green-400/30 rounded-xl px-6 py-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <p className="text-sm text-green-400">Loan application submitted successfully. We'll review it shortly.</p>
          </div>
        )}

        {showForm && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">New Loan Application</h3>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Loan amount (USD)</label>
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
                <label className="text-sm font-medium text-foreground">Purpose</label>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="Describe the purpose of this loan..."
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {isPending ? "Submitting..." : "Submit Application"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 h-10 rounded-lg bg-white/10 text-foreground text-sm font-medium hover:bg-white/15 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Loan Applications</h2>
          </div>
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-14 bg-white/5 rounded-lg animate-pulse" />)}
            </div>
          ) : loanList.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">No loan applications yet.</p>
              <button onClick={() => setShowForm(true)} className="mt-3 text-sm text-primary hover:underline">Apply for your first loan</button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {loanList.map((loan: any) => (
                <div key={loan.id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{fmt(loan.amount)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{loan.purpose}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(loan.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[loan.status] ?? "text-muted-foreground bg-white/5"}`}>
                      {loan.status}
                    </span>
                  </div>
                  {loan.adminNote && (
                    <p className="text-xs text-yellow-400 mt-2 bg-yellow-400/10 rounded px-3 py-1.5">{loan.adminNote}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

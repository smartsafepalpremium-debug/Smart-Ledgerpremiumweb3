import { useState } from "react";
import { Link } from "wouter";
import { useGetUserPlans, useCreateInvestment, useGetUserInvestments } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useAuth } from "@/contexts/auth-context";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}
function fmtFull(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}
function daysLeft(maturesAt: string) {
  const diff = new Date(maturesAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
function progressPct(createdAt: string, maturesAt: string) {
  const total = new Date(maturesAt).getTime() - new Date(createdAt).getTime();
  const elapsed = Date.now() - new Date(createdAt).getTime();
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}

const PLAN_COLORS = [
  { grad: "from-primary/20 to-primary/5", border: "border-primary/30", text: "text-primary", btn: "bg-primary hover:bg-primary/90 text-primary-foreground" },
  { grad: "from-primary/20 to-primary/5", border: "border-primary/30", text: "text-primary", btn: "bg-primary hover:bg-primary/90 text-primary-foreground" },
  { grad: "from-accent/20 to-accent/5", border: "border-accent/30", text: "text-accent", btn: "bg-accent hover:bg-accent/90 text-accent-foreground" },
];

export default function InvestmentPlans() {
  const { user } = useAuth();
  const { data: plans, isLoading: plansLoading } = useGetUserPlans({});
  const { data: investments, isLoading: invLoading, refetch: refetchInvestments } = useGetUserInvestments({});

  const [dialog, setDialog] = useState<{ plan: any; color: typeof PLAN_COLORS[0] } | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ plan: any; amount: number; expectedReturn: number } | null>(null);

  const planList = Array.isArray(plans) ? plans : [];
  const investmentList = Array.isArray(investments) ? investments : [];
  const activeInvestments = investmentList.filter((i: any) => i.status === "active");

  const { mutate: invest, isPending } = useCreateInvestment({
    mutation: {
      onSuccess: (data: any) => {
        setSuccess({ plan: dialog!.plan, amount: data.amount, expectedReturn: data.expectedReturn });
        setDialog(null);
        setAmount("");
        setError("");
        refetchInvestments();
      },
      onError: (err: any) => {
        setError(err?.data?.error ?? "Investment failed. Please try again.");
      },
    },
  });

  const openDialog = (plan: any, color: typeof PLAN_COLORS[0]) => {
    setDialog({ plan, color });
    setAmount(String(plan.minAmount));
    setError("");
    setSuccess(null);
  };

  const handleInvest = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!user || !dialog) return;
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { setError("Enter a valid amount"); return; }
    invest({ data: { userId: user.id, planId: dialog.plan.id, amount: amt } });
  };

  const previewReturn = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return null;
    return Math.round(amt * (1 + (dialog?.plan.roiPercent ?? 0) / 100) * 100) / 100;
  };

  return (
    <DashboardLayout>
      <div className="px-4 md:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Investment Plans</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Choose a plan and start earning returns</p>
        </div>

        {/* Active Investments */}
        {activeInvestments.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-widest text-muted-foreground">Your Active Investments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {activeInvestments.map((inv: any) => {
                const pct = progressPct(inv.createdAt, inv.maturesAt);
                const left = daysLeft(inv.maturesAt);
                return (
                  <div key={inv.id} className="bg-card border border-border rounded-xl p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Active</p>
                        <p className="text-sm font-semibold text-foreground mt-0.5">{inv.planName}</p>
                      </div>
                      <span className="text-xs font-semibold text-green-400 bg-green-400/10 rounded-full px-2.5 py-0.5 border border-green-400/20">
                        {inv.roiPercent}% ROI
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                      <div>
                        <p className="text-muted-foreground">Invested</p>
                        <p className="text-foreground font-semibold">{fmtFull(inv.amount)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Expected return</p>
                        <p className="text-primary font-semibold">{fmtFull(inv.expectedReturn)}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{pct}% complete</span>
                        <span>{left} days left</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Plans */}
        {plansLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6 space-y-3 animate-pulse">
                <div className="h-5 bg-white/5 rounded w-2/3" />
                <div className="h-8 bg-white/5 rounded w-1/2" />
                <div className="h-4 bg-white/5 rounded" />
                <div className="h-4 bg-white/5 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : planList.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">No active investment plans at the moment.</p>
            <p className="text-xs mt-1">Check back soon — new plans are added regularly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {planList.map((plan: any, i: number) => {
              const c = PLAN_COLORS[i % PLAN_COLORS.length];
              return (
                <div key={plan.id} className={`bg-gradient-to-br ${c.grad} ${c.border} border rounded-xl p-6 flex flex-col gap-4`}>
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-widest ${c.text}`}>Plan</p>
                    <h3 className="text-lg font-bold text-foreground mt-0.5">{plan.name}</h3>
                  </div>

                  <div className="flex items-end gap-1">
                    <span className={`text-4xl font-bold ${c.text}`}>{plan.roiPercent}%</span>
                    <span className="text-sm text-muted-foreground mb-1">ROI</span>
                  </div>

                  {plan.description && (
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                  )}

                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Duration</span>
                      <span className="text-foreground font-medium">{plan.durationDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Min investment</span>
                      <span className="text-foreground font-medium">{fmt(plan.minAmount)}</span>
                    </div>
                    {plan.maxAmount && (
                      <div className="flex justify-between">
                        <span>Max investment</span>
                        <span className="text-foreground font-medium">{fmt(plan.maxAmount)}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => openDialog(plan, c)}
                    className={`mt-auto w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${c.btn}`}
                  >
                    Invest Now
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* How it works */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: "01", title: "Choose a plan", desc: "Select an investment plan that matches your goals and budget." },
              { step: "02", title: "Enter your amount", desc: "Click Invest Now and enter how much you want to invest from your balance." },
              { step: "03", title: "Earn returns", desc: "Sit back and watch your ROI grow. Returns are paid at maturity." },
            ].map((item) => (
              <div key={item.step} className="flex gap-3">
                <span className="text-2xl font-bold text-primary/40">{item.step}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invest Now Dialog */}
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDialog(null)} />
          <div className="relative bg-[#141924] border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <button
              onClick={() => setDialog(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-5">
              <p className={`text-xs font-semibold uppercase tracking-widest ${dialog.color.text}`}>Invest</p>
              <h3 className="text-lg font-bold text-foreground mt-0.5">{dialog.plan.name}</h3>
              <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                <span className={`font-semibold ${dialog.color.text}`}>{dialog.plan.roiPercent}% ROI</span>
                <span>·</span>
                <span>{dialog.plan.durationDays} days</span>
                <span>·</span>
                <span>Min {fmt(dialog.plan.minAmount)}</span>
              </div>
            </div>

            {/* Balance */}
            <div className={`rounded-lg px-4 py-3 mb-4 flex justify-between items-center ${(user?.balance ?? 0) < dialog.plan.minAmount ? "bg-yellow-400/10 border border-yellow-400/20" : "bg-white/5"}`}>
              <span className="text-xs text-muted-foreground">Available balance</span>
              <span className={`text-sm font-semibold ${(user?.balance ?? 0) < dialog.plan.minAmount ? "text-yellow-400" : "text-foreground"}`}>
                {fmtFull(user?.balance ?? 0)}
              </span>
            </div>

            {/* Insufficient balance — show deposit CTA */}
            {(user?.balance ?? 0) < dialog.plan.minAmount ? (
              <div className="space-y-3">
                <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl px-4 py-4 text-center space-y-1.5">
                  <svg className="w-8 h-8 text-yellow-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <p className="text-sm font-semibold text-yellow-400">Insufficient balance</p>
                  <p className="text-xs text-muted-foreground">
                    You need at least <span className="text-foreground font-medium">{fmt(dialog.plan.minAmount)}</span> to invest in this plan.
                    Your balance is <span className="text-foreground font-medium">{fmtFull(user?.balance ?? 0)}</span>.
                  </p>
                </div>
                <Link
                  href="/deposit"
                  onClick={() => setDialog(null)}
                  className="flex items-center justify-center gap-2 w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Make a Deposit
                </Link>
                <button
                  onClick={() => setDialog(null)}
                  className="w-full h-9 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
            <form onSubmit={handleInvest} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2 text-xs text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Amount to invest (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => { setAmount(e.target.value); setError(""); }}
                    min={dialog.plan.minAmount}
                    max={dialog.plan.maxAmount || undefined}
                    step="0.01"
                    className="w-full pl-7 pr-3 py-2.5 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Min: {fmt(dialog.plan.minAmount)}{dialog.plan.maxAmount ? ` · Max: ${fmt(dialog.plan.maxAmount)}` : ""}
                </p>
              </div>

              {/* Expected return preview */}
              {previewReturn() !== null && (
                <div className="bg-white/3 border border-border rounded-lg px-4 py-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>You invest</span>
                    <span className="text-foreground font-medium">{fmtFull(parseFloat(amount) || 0)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>ROI ({dialog.plan.roiPercent}%)</span>
                    <span className="text-green-400 font-medium">+{fmtFull((previewReturn()! - (parseFloat(amount) || 0)))}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-1.5">
                    <span className="font-semibold text-foreground">Total return</span>
                    <span className={`font-bold ${dialog.color.text}`}>{fmtFull(previewReturn()!)}</span>
                  </div>
                  <p className="text-muted-foreground text-[10px]">Matures in {dialog.plan.durationDays} days</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className={`w-full h-10 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 ${dialog.color.btn}`}
              >
                {isPending ? "Processing..." : `Confirm Investment`}
              </button>
            </form>
            )}
          </div>
        </div>
      )}

      {/* Success dialog */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSuccess(null)} />
          <div className="relative bg-[#141924] border border-border rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-green-400/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-foreground">Investment Active!</h3>
            <p className="text-sm text-muted-foreground mt-1">{success.plan.name}</p>
            <div className="mt-4 bg-white/5 rounded-xl p-4 space-y-2 text-sm text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invested</span>
                <span className="text-foreground font-semibold">{fmtFull(success.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expected return</span>
                <span className="text-primary font-semibold">{fmtFull(success.expectedReturn)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="text-foreground font-semibold">{success.plan.durationDays} days</span>
              </div>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="mt-5 w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

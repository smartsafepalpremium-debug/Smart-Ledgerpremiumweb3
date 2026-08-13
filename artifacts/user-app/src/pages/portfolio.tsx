import { useGetUserPortfolio, useGetUserDeposits, useGetUserWithdrawals } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useAuth } from "@/contexts/auth-context";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}

function StatCard({ label, value, sub, valueClass = "text-foreground" }: { label: string; value: string; sub?: string; valueClass?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="text-xs text-muted-foreground uppercase tracking-widest">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${valueClass}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

export default function Portfolio() {
  const { user } = useAuth();
  const { data: portfolio, isLoading } = useGetUserPortfolio({});
  const { data: deposits } = useGetUserDeposits({});
  const { data: withdrawals } = useGetUserWithdrawals({});

  const p = portfolio as any;
  const balance = p?.balance ?? user?.balance ?? 0;
  const profit = p?.profit ?? user?.profit ?? 0;

  const recentDeposits = Array.isArray(deposits) ? deposits.slice(0, 5) : [];
  const recentWithdrawals = Array.isArray(withdrawals) ? withdrawals.slice(0, 5) : [];

  const statusColor: Record<string, string> = {
    approved: "text-green-400 bg-green-400/10",
    pending: "text-yellow-400 bg-yellow-400/10",
    rejected: "text-red-400 bg-red-400/10",
  };

  return (
    <DashboardLayout>
      <div className="px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Portfolio</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your account summary and performance</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
                <div className="h-3 bg-white/5 rounded w-2/3 mb-2" />
                <div className="h-7 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Balance" value={fmt(balance)} />
            <StatCard
              label="Total Profit"
              value={`${profit >= 0 ? "+" : ""}${fmt(profit)}`}
              valueClass={profit >= 0 ? "text-green-400" : "text-red-400"}
            />
            <StatCard label="Total Deposited" value={fmt(p?.totalDeposited ?? 0)} />
            <StatCard label="Total Withdrawn" value={fmt(p?.totalWithdrawn ?? 0)} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Active Loans</p>
                <p className="text-3xl font-bold text-accent">{p?.activeLoans ?? 0}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Pending Deposits</p>
            <p className="text-3xl font-bold text-yellow-400">{p?.pendingDeposits ?? 0}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Pending Withdrawals</p>
            <p className="text-3xl font-bold text-orange-400">{p?.pendingWithdrawals ?? 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Recent Deposits</h2>
            </div>
            {recentDeposits.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No deposits yet</p>
            ) : (
              <div className="divide-y divide-border">
                {recentDeposits.map((d: any) => (
                  <div key={d.id} className="px-6 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{fmt(d.amount)}</p>
                      <p className="text-xs text-muted-foreground">{d.method}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[d.status] ?? "text-muted-foreground"}`}>
                      {d.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Recent Withdrawals</h2>
            </div>
            {recentWithdrawals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No withdrawals yet</p>
            ) : (
              <div className="divide-y divide-border">
                {recentWithdrawals.map((w: any) => (
                  <div key={w.id} className="px-6 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{fmt(w.amount)}</p>
                      <p className="text-xs text-muted-foreground">{w.method}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[w.status] ?? "text-muted-foreground"}`}>
                      {w.status}
                    </span>
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

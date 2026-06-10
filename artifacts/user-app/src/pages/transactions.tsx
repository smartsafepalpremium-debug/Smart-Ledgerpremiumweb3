import { useGetUserTransactions } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/dashboard-layout";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}

const typeColor: Record<string, string> = {
  deposit: "text-green-400 bg-green-400/10",
  withdrawal: "text-red-400 bg-red-400/10",
  profit: "text-primary bg-primary/10",
  loan: "text-purple-400 bg-purple-400/10",
  fee: "text-orange-400 bg-orange-400/10",
};

export default function Transactions() {
  const { data: transactions, isLoading } = useGetUserTransactions({});

  const txList = Array.isArray(transactions) ? transactions : [];

  return (
    <DashboardLayout>
      <div className="px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your complete transaction history</p>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-3 text-xs text-muted-foreground font-medium">Type</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Description</th>
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Amount</th>
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium hidden md:table-cell">Status</th>
                  <th className="text-right px-6 py-3 text-xs text-muted-foreground font-medium hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      {[1,2,3,4,5].map(j => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-white/5 rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : txList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-sm text-muted-foreground">No transactions yet</td>
                  </tr>
                ) : (
                  txList.map((tx: any) => (
                    <tr key={tx.id} className="border-b border-border/50 hover:bg-white/2 transition-colors">
                      <td className="px-6 py-3.5">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${typeColor[tx.type] ?? "text-muted-foreground bg-white/5"}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground text-xs">{tx.description ?? "—"}</td>
                      <td className={`px-4 py-3.5 text-right font-mono font-semibold ${
                        tx.type === "deposit" || tx.type === "profit" ? "text-green-400" : "text-foreground"
                      }`}>
                        {tx.type === "deposit" || tx.type === "profit" ? "+" : "-"}{fmt(Math.abs(tx.amount))}
                      </td>
                      <td className="px-4 py-3.5 text-right hidden md:table-cell">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                          tx.status === "completed" ? "text-green-400 bg-green-400/10" :
                          tx.status === "pending" ? "text-yellow-400 bg-yellow-400/10" :
                          "text-muted-foreground bg-white/5"
                        }`}>{tx.status}</span>
                      </td>
                      <td className="px-6 py-3.5 text-right text-xs text-muted-foreground hidden md:table-cell">
                        {new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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

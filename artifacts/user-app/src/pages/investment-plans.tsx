import { Link } from "wouter";
import { useGetUserPlans } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/dashboard-layout";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

export default function InvestmentPlans() {
  const { data: plans, isLoading } = useGetUserPlans({});

  const planList = Array.isArray(plans) ? plans : [];

  return (
    <DashboardLayout>
      <div className="px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Investment Plans</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Choose a plan and start earning returns</p>
        </div>

        {isLoading ? (
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
              const colors = [
                "from-primary/20 to-primary/5 border-primary/30",
                "from-blue-500/20 to-blue-500/5 border-blue-500/30",
                "from-purple-500/20 to-purple-500/5 border-purple-500/30",
              ];
              const textColors = ["text-primary", "text-blue-400", "text-purple-400"];
              const colorIdx = i % 3;
              return (
                <div key={plan.id} className={`bg-gradient-to-br ${colors[colorIdx]} border rounded-xl p-6 flex flex-col gap-4`}>
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-widest ${textColors[colorIdx]}`}>Plan</p>
                    <h3 className="text-lg font-bold text-foreground mt-0.5">{plan.name}</h3>
                  </div>

                  <div className="flex items-end gap-1">
                    <span className={`text-4xl font-bold ${textColors[colorIdx]}`}>{plan.roiPercent}%</span>
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

                  <Link href="/deposit" className="mt-auto w-full py-2.5 rounded-lg text-sm font-semibold text-center transition-colors bg-primary text-primary-foreground hover:bg-primary/90">
                    Invest Now
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: "01", title: "Choose a plan", desc: "Select an investment plan that matches your goals and budget." },
              { step: "02", title: "Make a deposit", desc: "Fund your account with the minimum required amount." },
              { step: "03", title: "Earn returns", desc: "Sit back and watch your ROI grow over the plan duration." },
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
    </DashboardLayout>
  );
}

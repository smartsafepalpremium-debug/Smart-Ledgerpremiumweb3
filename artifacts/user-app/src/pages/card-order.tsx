import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useAuth } from "@/contexts/auth-context";

export default function CardOrder() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    nameOnCard: user ? `${user.firstName} ${user.lastName}` : "",
    cardType: "visa",
    address: "",
    city: "",
    country: user?.country ?? "",
    postalCode: "",
  });
  const [success, setSuccess] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
  };

  if (success) {
    return (
      <DashboardLayout>
        <div className="px-8 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-foreground">Card Order Submitted</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
              Your {form.cardType === "visa" ? "Visa" : "Mastercard"} card order is being processed. Delivery takes 7-14 business days.
            </p>
            <button onClick={() => setSuccess(false)} className="mt-6 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
              Order Another Card
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
          <h1 className="text-2xl font-bold text-foreground">Card Order</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Order your Smartledger crypto debit card</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-semibold text-foreground mb-5">Card Details</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Card type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ value: "visa", label: "Visa" }, { value: "mastercard", label: "Mastercard" }].map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, cardType: value }))}
                        className={`py-3 rounded-lg border text-sm font-semibold transition-all ${form.cardType === value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Name on card</label>
                  <input value={form.nameOnCard} onChange={set("nameOnCard")} className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" required />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Street address</label>
                  <input value={form.address} onChange={set("address")} className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="123 Main St" required />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">City</label>
                    <input value={form.city} onChange={set("city")} className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="New York" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Postal code</label>
                    <input value={form.postalCode} onChange={set("postalCode")} className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="10001" required />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Country</label>
                  <input value={form.country} onChange={set("country")} className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="United States" required />
                </div>

                <button
                  type="submit"
                  className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Submit Card Order
                </button>
              </form>
            </div>
          </div>

          {/* Card preview */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-primary/30 rounded-2xl p-6 aspect-[1.586/1] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="w-8 h-6 rounded bg-primary/60 mb-1" />
                </div>
                <span className="text-primary font-bold text-sm tracking-widest">SMARTLEDGER</span>
              </div>
              <div className="relative">
                <p className="font-mono text-foreground tracking-[0.2em] text-sm">•••• •••• •••• ••••</p>
                <div className="flex items-end justify-between mt-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Card Holder</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">{form.nameOnCard || "YOUR NAME"}</p>
                  </div>
                  <p className="text-lg font-bold text-primary uppercase">{form.cardType}</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Card Benefits</h3>
              {[
                "Instant crypto-to-fiat conversion",
                "Zero foreign transaction fees",
                "Works at 50M+ merchants worldwide",
                "Real-time transaction notifications",
                "Freeze/unfreeze from the app",
              ].map((b) => (
                <div key={b} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  <svg className="w-3.5 h-3.5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {b}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

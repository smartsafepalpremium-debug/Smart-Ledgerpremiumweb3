import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRegisterUser } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth-context";

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    phone: "", country: "", referralCode: "",
  });
  const [error, setError] = useState("");

  const { mutate, isPending } = useRegisterUser({
    mutation: {
      onSuccess: (data: any) => {
        login(data.token, data.user);
        setLocation("/");
      },
      onError: (err: any) => {
        setError(err?.data?.error ?? "Registration failed");
      },
    },
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    mutate({ data: form as any });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 mb-4">
            <span className="text-primary font-bold text-lg">SL</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create account</h1>
          <p className="text-sm text-muted-foreground mt-1">Join Smartledger Premium today</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">First name</label>
                <input value={form.firstName} onChange={set("firstName")} className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="First name" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Last name</label>
                <input value={form.lastName} onChange={set("lastName")} className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Last name" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input type="email" value={form.email} onChange={set("email")} className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="you@example.com" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Password</label>
              <input type="password" value={form.password} onChange={set("password")} className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="••••••••" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Phone</label>
              <input type="tel" value={form.phone} onChange={set("phone")} className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="+1 555 000 0000" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Country</label>
              <input value={form.country} onChange={set("country")} className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="United States" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Referral code <span className="text-muted-foreground">(optional)</span></label>
              <input value={form.referralCode} onChange={set("referralCode")} className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="REF-XXXXX" />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 mt-2"
            >
              {isPending ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

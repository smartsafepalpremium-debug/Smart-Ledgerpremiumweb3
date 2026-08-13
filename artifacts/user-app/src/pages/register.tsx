import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRegisterUser } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth-context";

function BrandLockup() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#15150f] text-primary">
        <span className="text-sm font-bold tracking-[-0.1em]">SL</span>
        <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
      </div>
      <div>
        <p className="text-sm font-semibold tracking-[-0.04em] text-[#15150f]">Smartledger</p>
        <p className="sl-mono mt-1 text-[9px] uppercase tracking-[.18em] text-[#15150f]/60">Premium terminal</p>
      </div>
    </div>
  );
}

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", phone: "", country: "", referralCode: "" });
  const [error, setError] = useState("");
  const { mutate, isPending } = useRegisterUser({
    mutation: {
      onSuccess: (data: any) => {
        login(data.token, data.user);
        setLocation("/");
      },
      onError: (err: any) => setError(err?.data?.error ?? "Registration failed"),
    },
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((current) => ({ ...current, [key]: e.target.value }));
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    mutate({ data: form as any });
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <div className="grid min-h-[100dvh] lg:grid-cols-[minmax(380px,0.9fr)_1.1fr]">
        <aside className="relative hidden overflow-hidden bg-primary p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-28 top-20 h-72 w-72 rounded-full border-[1px] border-[#15150f]/20" />
          <div className="absolute -right-12 top-36 h-48 w-48 rounded-full border-[1px] border-[#15150f]/15" />
          <BrandLockup />
          <div className="relative max-w-sm pb-4">
            <p className="sl-mono mb-5 text-[10px] font-medium uppercase tracking-[.22em] text-[#15150f]/65">02 / Open position</p>
            <h2 className="text-5xl font-semibold leading-[.96] tracking-[-.07em] text-[#15150f]">Build your<br />edge.</h2>
            <p className="mt-6 max-w-xs text-sm leading-6 text-[#15150f]/70">Your next chapter in digital assets starts with a clearer command center.</p>
          </div>
          <div className="relative flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.16em] text-[#15150f]/60">
            <span className="h-1.5 w-1.5 rounded-full bg-[#15150f]" /> Secure session · encrypted
          </div>
        </aside>

        <main className="sl-grid flex min-h-[100dvh] items-center justify-center px-5 py-8 sm:px-10">
          <div className="w-full max-w-[500px]">
            <div className="mb-8 lg:hidden"><BrandLockup /></div>
            <div className="mb-7">
              <p className="sl-kicker mb-3 text-primary">Create your account</p>
              <h1 className="text-4xl font-semibold tracking-[-.06em] text-foreground">Start with a clear view</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Set up your Smartledger Premium account in a minute.</p>
            </div>

            <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-2xl shadow-black/20 sm:p-7">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div data-testid="status-register-error" className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label htmlFor="register-first-name" className="text-xs font-semibold uppercase tracking-[.12em] text-muted-foreground">First name</label>
                    <input id="register-first-name" data-testid="input-first-name" value={form.firstName} onChange={set("firstName")} className="h-11 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="First name" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="register-last-name" className="text-xs font-semibold uppercase tracking-[.12em] text-muted-foreground">Last name</label>
                    <input id="register-last-name" data-testid="input-last-name" value={form.lastName} onChange={set("lastName")} className="h-11 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="Last name" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="register-email" className="text-xs font-semibold uppercase tracking-[.12em] text-muted-foreground">Email address</label>
                  <input id="register-email" data-testid="input-email" type="email" value={form.email} onChange={set("email")} className="h-11 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="you@example.com" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="register-password" className="text-xs font-semibold uppercase tracking-[.12em] text-muted-foreground">Password</label>
                  <input id="register-password" data-testid="input-password" type="password" value={form.password} onChange={set("password")} className="h-11 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="Create a password" required />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="register-phone" className="text-xs font-semibold uppercase tracking-[.12em] text-muted-foreground">Phone</label>
                    <input id="register-phone" data-testid="input-phone" type="tel" value={form.phone} onChange={set("phone")} className="h-11 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="+1 555 000 0000" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="register-country" className="text-xs font-semibold uppercase tracking-[.12em] text-muted-foreground">Country</label>
                    <input id="register-country" data-testid="input-country" value={form.country} onChange={set("country")} className="h-11 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="United States" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="register-referral" className="text-xs font-semibold uppercase tracking-[.12em] text-muted-foreground">Referral code <span className="normal-case tracking-normal text-muted-foreground/70">(optional)</span></label>
                  <input id="register-referral" data-testid="input-referral-code" value={form.referralCode} onChange={set("referralCode")} className="h-11 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="REF-XXXXX" />
                </div>
                <button type="submit" data-testid="button-submit-register" disabled={isPending} className="mt-2 flex h-12 w-full items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60">
                  {isPending ? "Creating account..." : "Create account"}
                </button>
              </form>
              <div className="mt-6 flex items-center justify-between border-t border-border pt-5 text-xs">
                <span className="text-muted-foreground">Already have an account?</span>
                <Link href="/login" data-testid="link-sign-in" className="font-semibold text-primary transition-colors hover:text-foreground">Sign in</Link>
              </div>
            </div>
            <p className="sl-mono mt-6 text-center text-[9px] uppercase tracking-[.16em] text-muted-foreground/60">Smartledger Premium · Digital asset infrastructure</p>
          </div>
        </main>
      </div>
    </div>
  );
}
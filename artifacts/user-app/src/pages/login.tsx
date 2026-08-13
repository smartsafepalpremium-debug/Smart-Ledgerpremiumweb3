import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLoginUser } from "@workspace/api-client-react";
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

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { mutate, isPending } = useLoginUser({
    mutation: {
      onSuccess: (data: any) => {
        login(data.token, data.user);
        setLocation("/overview");
      },
      onError: (err: any) => setError(err?.data?.error ?? "Invalid credentials"),
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    mutate({ data: { email, password } });
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <div className="grid min-h-[100dvh] lg:grid-cols-[minmax(380px,0.9fr)_1.1fr]">
        <aside className="relative hidden overflow-hidden bg-primary p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-28 top-20 h-72 w-72 rounded-full border-[1px] border-[#15150f]/20" />
          <div className="absolute -right-12 top-36 h-48 w-48 rounded-full border-[1px] border-[#15150f]/15" />
          <div className="absolute bottom-[-9rem] left-[-6rem] h-80 w-80 rounded-full border-[30px] border-[#15150f]/[.06]" />
          <BrandLockup />
          <div className="relative max-w-sm pb-4">
            <p className="sl-mono mb-5 text-[10px] font-medium uppercase tracking-[.22em] text-[#15150f]/65">01 / Access terminal</p>
            <h2 className="text-5xl font-semibold leading-[.96] tracking-[-.07em] text-[#15150f]">Move with<br />conviction.</h2>
            <p className="mt-6 max-w-xs text-sm leading-6 text-[#15150f]/70">A clear view of your digital assets, built for the decisions that matter.</p>
          </div>
          <div className="relative flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.16em] text-[#15150f]/60">
            <span className="h-1.5 w-1.5 rounded-full bg-[#15150f]" /> Secure session · encrypted
          </div>
        </aside>

        <main className="sl-grid flex min-h-[100dvh] items-center justify-center px-5 py-10 sm:px-10">
          <div className="w-full max-w-[430px]">
            <div className="mb-10 lg:hidden"><BrandLockup /></div>
            <div className="mb-8">
              <p className="sl-kicker mb-3 text-primary">Welcome back</p>
              <h1 className="text-4xl font-semibold tracking-[-.06em] text-foreground">Sign in to your account</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Pick up where you left off. Your portfolio is waiting.</p>
            </div>

            <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-2xl shadow-black/20 sm:p-7">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && <div data-testid="status-login-error" className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
                <div className="space-y-2">
                  <label htmlFor="login-email" className="text-xs font-semibold uppercase tracking-[.12em] text-muted-foreground">Email address</label>
                  <input id="login-email" data-testid="input-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 w-full rounded-lg border border-border bg-input px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="you@example.com" required />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-password" className="text-xs font-semibold uppercase tracking-[.12em] text-muted-foreground">Password</label>
                    <span className="text-[10px] text-muted-foreground">Protected access</span>
                  </div>
                  <input id="login-password" data-testid="input-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 w-full rounded-lg border border-border bg-input px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="Enter your password" required />
                </div>
                <button type="submit" data-testid="button-submit-login" disabled={isPending} className="flex h-12 w-full items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60">
                  {isPending ? "Authenticating..." : "Enter terminal"}
                </button>
              </form>
              <div className="mt-6 flex items-center justify-between border-t border-border pt-5 text-xs">
                <span className="text-muted-foreground">New to Smartledger?</span>
                <Link href="/register" data-testid="link-create-account" className="font-semibold text-primary transition-colors hover:text-foreground">Create account</Link>
              </div>
            </div>
            <p className="sl-mono mt-6 text-center text-[9px] uppercase tracking-[.16em] text-muted-foreground/60">Smartledger Premium · Digital asset infrastructure</p>
          </div>
        </main>
      </div>
    </div>
  );
}
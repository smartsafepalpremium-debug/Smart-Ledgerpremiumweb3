import { Link } from "wouter";
import { useAuth } from "@/contexts/auth-context";

function Mark({ invert = false }: { invert?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${invert ? "text-[#15150f]" : "text-foreground"}`}>
      <div className={`relative flex h-10 w-10 items-center justify-center rounded-xl ${invert ? "bg-[#15150f] text-primary" : "bg-primary text-primary-foreground"}`}>
        <span className="text-sm font-bold tracking-[-0.1em]">SL</span>
        <span className={`absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full ${invert ? "bg-primary" : "bg-[#15150f]"}`} />
      </div>
      <div>
        <p className="text-sm font-semibold tracking-[-0.04em]">Smartledger Premium Web3</p>
        <p className={`sl-mono mt-1 text-[9px] uppercase tracking-[.18em] ${invert ? "text-[#15150f]/60" : "text-muted-foreground"}`}>Premium terminal</p>
      </div>
    </div>
  );
}

function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

function SignalIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 18v-3M8 18v-7M12 18V6M16 18v-4M20 18V3" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3 5 6v5c0 4.7 2.9 8.2 7 10 4.1-1.8 7-5.3 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
    </svg>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const primaryHref = isAuthenticated ? "/overview" : "/register";
  const walletHref = isAuthenticated ? "/wallet-connect" : "/login";

  return (
    <div className="min-h-[100dvh] overflow-hidden bg-background text-foreground">
      <header className="relative z-10 border-b border-border/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <Link href="/" aria-label="Smartledger Premium Web3 home">
            <Mark />
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#platform" className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground">Platform</a>
            <a href="#signal" className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground">Why Smartledger</a>
            <a href="#wallet" className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground">Wallet security</a>
            <a href="#security" className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground">Security</a>
          </nav>
          <div className="flex items-center gap-3">
            {!isAuthenticated && (
              <Link href="/login" className="hidden text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground sm:inline">Sign in</Link>
            )}
            <Link href={primaryHref} className="group flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground transition-transform hover:-translate-y-0.5">
              {isAuthenticated ? "Open dashboard" : "Get started"}
              <ArrowIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="sl-grid relative isolate">
          <div className="pointer-events-none absolute -right-36 top-12 -z-10 h-[28rem] w-[28rem] rounded-full border border-primary/15" />
          <div className="pointer-events-none absolute -right-10 top-36 -z-10 h-72 w-72 rounded-full border border-primary/10" />
          <div className="pointer-events-none absolute -left-48 top-48 -z-10 h-[32rem] w-[32rem] rounded-full bg-primary/[.04] blur-3xl" />
          <div className="mx-auto grid max-w-7xl gap-14 px-5 pb-24 pt-20 sm:px-8 sm:pt-28 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-20 lg:px-10 lg:pb-32">
            <div className="max-w-2xl">
              <div className="mb-7 flex items-center gap-3">
                <span className="h-px w-8 bg-primary" />
                <p className="sl-kicker text-primary">Digital asset infrastructure</p>
              </div>
              <h1 className="max-w-4xl text-6xl font-semibold leading-[.9] tracking-[-.08em] text-foreground sm:text-7xl lg:text-[6.4rem]">
                Make your<br />
                <span className="text-primary">next move.</span>
              </h1>
              <p className="mt-8 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
                A clearer command center for digital assets. Track your portfolio, move with signal, and build long-term conviction from one premium terminal.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link href={primaryHref} className="group flex items-center gap-3 rounded-lg bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground transition-all hover:-translate-y-0.5 hover:brightness-105">
                  {isAuthenticated ? "Enter your terminal" : "Start building your edge"}
                  <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <a href="#platform" className="rounded-lg border border-border px-5 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:bg-primary/[.06]">Explore platform</a>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-[10px] font-semibold uppercase tracking-[.15em] text-muted-foreground">
                <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Secure session</span>
                <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Portfolio intelligence</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[520px]">
              <div className="absolute -inset-5 rounded-[2rem] bg-primary/[.06] blur-2xl" />
              <div className="sl-panel relative overflow-hidden rounded-2xl p-4 shadow-2xl shadow-black/40 sm:p-5">
                <div className="mb-4 flex items-center justify-between border-b border-border/80 pb-4">
                  <div>
                    <p className="sl-mono text-[9px] uppercase tracking-[.18em] text-muted-foreground">Portfolio command</p>
                    <p className="mt-2 text-lg font-semibold tracking-[-.04em]">Live overview</p>
                  </div>
                  <span className="flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-primary"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Live</span>
                </div>
                <div className="rounded-xl bg-primary p-5 text-primary-foreground sm:p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[.16em] opacity-65">Total portfolio value</p>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <p className="text-4xl font-semibold tracking-[-.07em] sm:text-5xl">$48,290<span className="text-2xl">.42</span></p>
                    <span className="mb-1 rounded-md bg-[#15150f]/10 px-2 py-1 text-xs font-bold">+12.84%</span>
                  </div>
                  <div className="mt-7 flex h-20 items-end gap-1">
                    {[22, 31, 27, 42, 38, 50, 46, 62, 57, 70, 65, 82, 75, 92].map((height, index) => (
                      <span key={index} className="flex-1 rounded-t-sm bg-[#15150f]/25" style={{ height: `${height}%` }} />
                    ))}
                  </div>
                  <div className="mt-3 flex justify-between text-[9px] font-semibold uppercase tracking-wider opacity-60"><span>30 days</span><span>Today</span></div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-background/70 p-4">
                    <p className="sl-mono text-[9px] uppercase tracking-wider text-muted-foreground">Active positions</p>
                    <p className="mt-3 text-2xl font-semibold tracking-[-.05em]">08</p>
                    <p className="mt-1 text-[10px] text-primary">+2 this month</p>
                  </div>
                  <div className="rounded-xl border border-border bg-background/70 p-4">
                    <p className="sl-mono text-[9px] uppercase tracking-wider text-muted-foreground">Growth rate</p>
                    <p className="mt-3 text-2xl font-semibold tracking-[-.05em]">18.2%</p>
                    <p className="mt-1 text-[10px] text-primary">Above target</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-background/70 px-4 py-3">
                  <span className="flex items-center gap-2 text-xs font-semibold"><span className="h-2 w-2 rounded-full bg-primary" /> Market pulse</span>
                  <span className="sl-mono text-[10px] text-muted-foreground">Updated just now</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="platform" className="border-y border-border/70 bg-card/25">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:px-10 lg:py-24">
            <div>
              <p className="sl-kicker mb-4 text-primary">The platform</p>
              <h2 className="max-w-md text-4xl font-semibold leading-none tracking-[-.07em] sm:text-5xl">Everything you need to move with clarity.</h2>
              <p className="mt-5 max-w-sm text-sm leading-6 text-muted-foreground">A focused workspace for the decisions behind your digital asset strategy.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: SignalIcon, title: "See the signal", copy: "Understand your performance at a glance, without the noise." },
                { icon: LayersIcon, title: "Build positions", copy: "Choose investment plans designed around your pace and goals." },
                { icon: ShieldIcon, title: "Stay protected", copy: "Keep identity, wallet, and account controls in one secure place." },
              ].map(({ icon: Icon, title, copy }, index) => (
                <div key={title} className="sl-panel group p-5 transition-all hover:-translate-y-1 hover:border-primary/40">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Icon /></div>
                  <p className="mt-8 text-lg font-semibold tracking-[-.04em]">{title}</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy}</p>
                  <span className="sl-mono mt-8 block text-[9px] text-primary">0{index + 1} / SMARTLEDGER</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="signal" className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1fr] lg:items-center lg:px-10 lg:py-28">
          <div className="relative order-2 lg:order-1">
            <div className="absolute -left-3 -top-3 h-full w-full rounded-2xl border border-primary/15" />
            <div className="sl-panel relative rounded-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-border pb-5">
                <p className="sl-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Allocation map</p>
                <span className="text-xs font-bold text-primary">Balanced</span>
              </div>
              <div className="mt-8 flex items-center justify-center">
                <div className="relative flex h-52 w-52 items-center justify-center rounded-full border-[18px] border-primary/20 border-t-primary border-r-primary">
                  <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full border border-border bg-background">
                    <span className="text-3xl font-semibold tracking-[-.08em]">64</span>
                    <span className="sl-mono mt-1 text-[9px] uppercase text-muted-foreground">score</span>
                  </div>
                </div>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-3 text-center">
                <div><span className="mx-auto mb-2 block h-2 w-2 rounded-full bg-primary" /><p className="text-xs font-bold">Growth</p><p className="sl-mono mt-1 text-[9px] text-muted-foreground">42%</p></div>
                <div><span className="mx-auto mb-2 block h-2 w-2 rounded-full bg-foreground/50" /><p className="text-xs font-bold">Stable</p><p className="sl-mono mt-1 text-[9px] text-muted-foreground">35%</p></div>
                <div><span className="mx-auto mb-2 block h-2 w-2 rounded-full bg-muted-foreground/40" /><p className="text-xs font-bold">Reserve</p><p className="sl-mono mt-1 text-[9px] text-muted-foreground">23%</p></div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <p className="sl-kicker mb-4 text-primary">Built for conviction</p>
            <h2 className="max-w-lg text-4xl font-semibold leading-none tracking-[-.07em] sm:text-5xl">The right information changes the move.</h2>
            <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground">Smartledger Premium Web3 turns a scattered digital asset life into one calm, actionable view. Know what you hold, where it is working, and what comes next.</p>
            <Link href={primaryHref} className="group mt-8 inline-flex items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-foreground">See your command center <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
          </div>
        </section>

        <section id="wallet" className="border-y border-border/70 bg-card/25">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-10 lg:py-24">
            <div>
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <ShieldIcon />
              </div>
              <p className="sl-kicker mb-4 text-primary">Wallet connect</p>
              <h2 className="max-w-xl text-4xl font-semibold leading-none tracking-[-.07em] sm:text-5xl">Secure your wallet from hackers.</h2>
              <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground">
                Your wallet is the gateway to your digital assets. Keep it protected with a focused connection flow, clear account controls, and one place to review how your wallet is connected to Smartledger Premium Web3.
              </p>
              <Link href={walletHref} className="group mt-8 inline-flex items-center gap-3 rounded-lg bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground transition-all hover:-translate-y-0.5 hover:brightness-105">
                {isAuthenticated ? "Connect your wallet" : "Sign in to connect"}
                <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="sl-panel relative overflow-hidden rounded-2xl p-5 sm:p-7">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border border-primary/20" />
              <div className="pointer-events-none absolute -right-5 -top-5 h-28 w-28 rounded-full border border-primary/15" />
              <div className="relative">
                <div className="flex items-center justify-between border-b border-border pb-5">
                  <div>
                    <p className="sl-mono text-[9px] uppercase tracking-[.18em] text-muted-foreground">Wallet protection</p>
                    <p className="mt-2 text-lg font-semibold tracking-[-.04em]">Connection status</p>
                  </div>
                  <span className="flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-primary"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Protected</span>
                </div>
                <div className="mt-6 flex items-center gap-4 rounded-xl border border-primary/20 bg-primary/[.07] p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <ShieldIcon />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Stay one step ahead</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">Review your wallet connection before you move assets.</p>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {["Private account controls", "Clear connection status", "Focused security workflow"].map((item) => (
                    <div key={item} className="flex items-center gap-3 border-b border-border/70 pb-3 text-xs font-semibold last:border-0 last:pb-0">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">✓</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="security" className="bg-primary text-primary-foreground">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-16 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-10 lg:py-20">
            <div>
              <Mark invert />
              <h2 className="mt-10 max-w-xl text-4xl font-semibold leading-none tracking-[-.07em] text-[#15150f] sm:text-6xl">Make the move<br />you can stand behind.</h2>
            </div>
            <div className="max-w-sm">
              <p className="text-sm leading-6 text-[#15150f]/70">Your next position starts with a clearer view. Enter Smartledger Premium Web3 and build from signal, not noise.</p>
              <Link href={primaryHref} className="group mt-6 inline-flex items-center gap-3 rounded-lg bg-[#15150f] px-5 py-3.5 text-sm font-bold text-primary transition-transform hover:-translate-y-0.5">Enter Smartledger <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p className="sl-mono text-[9px] uppercase tracking-[.16em] text-muted-foreground">Smartledger Premium Web3 · Digital asset infrastructure</p>
          <p className="text-xs text-muted-foreground">Move with conviction.</p>
        </div>
      </footer>
    </div>
  );
}
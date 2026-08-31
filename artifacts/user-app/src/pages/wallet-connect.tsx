import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useAuth } from "@/contexts/auth-context";

type InjectedWalletProvider = {
  request: (args: { method: string }) => Promise<unknown>;
  isTrust?: boolean;
  providers?: InjectedWalletProvider[];
};

declare global {
  interface Window {
    ethereum?: InjectedWalletProvider;
  }
}

const WALLETS = [
  { name: "MetaMask", color: "#E2761B", icon: MetaMaskIcon },
  { name: "Trust Wallet", color: "#3375BB", icon: TrustWalletIcon },
  { name: "Coinbase Wallet", color: "#0052FF", icon: CoinbaseIcon },
  { name: "WalletConnect", color: "#3B99FC", icon: WalletConnectIcon },
  { name: "Phantom", color: "#AB9FF2", icon: PhantomIcon },
  { name: "Exodus", color: "#8B45FF", icon: ExodusIcon },
  { name: "Ledger", color: "#142533", icon: LedgerIcon },
  { name: "Rainbow", color: "#0E76FD", icon: RainbowIcon },
  { name: "Uniswap", color: "#FF007A", icon: UniswapIcon },
  { name: "Atomic Wallet", color: "#4EC5F1", icon: AtomicIcon },
  { name: "Crypto.com DeFi", color: "#103F68", icon: CryptoComIcon },
  { name: "Argent", color: "#FF875B", icon: ArgentIcon },
  { name: "1inch", color: "#1B314F", icon: OneInchIcon },
  { name: "imToken", color: "#11C4D1", icon: ImTokenIcon },
  { name: "MyEtherWallet", color: "#05C0A5", icon: MewIcon },
  { name: "Zerion", color: "#2962EF", icon: ZerionIcon },
  { name: "Bitkeep", color: "#7524F9", icon: BitkeepIcon },
  { name: "SafePal", color: "#1DCCB4", icon: SafePalIcon },
];

export default function WalletConnect() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [address, setAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const getSelectedProvider = () => {
    const injected = window.ethereum;
    if (!injected) return null;

    const providers = injected.providers?.length ? injected.providers : [injected];
    if (selected === "Trust Wallet") {
      return providers.find((provider) => provider.isTrust) ?? providers[0] ?? null;
    }
    return providers[0] ?? null;
  };

  const handleConnect = async () => {
    setError("");
    if (!user || !selected) return;
    const provider = getSelectedProvider();
    if (!provider) {
      setError(
        selected === "Trust Wallet"
          ? "Open Smartledger in Trust Wallet’s in-app browser, or install the official Trust Wallet browser extension."
          : "No browser wallet detected. Open this page in your wallet app or install its official browser extension.",
      );
      return;
    }
    setIsConnecting(true);
    try {
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      const walletAddress = Array.isArray(accounts) ? accounts[0] : "";
      if (typeof walletAddress !== "string" || !walletAddress) {
        setError("Your wallet did not return a public address.");
        return;
      }
      setAddress(walletAddress);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.code === 4001 ? "Connection request was rejected in your wallet." : "Wallet connection failed. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  if (success) {
    return (
      <DashboardLayout>
        <div className="px-8 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-400/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-foreground">Wallet Connected</h2>
             <p className="text-sm text-muted-foreground mt-2">{selected} has been connected to your account.</p>
             <p className="mt-2 font-mono text-xs text-foreground/70">{address.slice(0, 6)}…{address.slice(-4)}</p>
             <button onClick={() => { setSuccess(false); setSelected(null); setAddress(""); }} className="mt-6 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
              Connect Another Wallet
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
          <h1 className="text-2xl font-bold text-foreground">Wallet Connect</h1>
             <p className="text-sm text-muted-foreground mt-0.5">Connect your crypto wallet without sharing private credentials</p>
        </div>

        {!selected ? (
          <div>
            <p className="text-sm text-muted-foreground mb-4">Select your wallet provider</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {WALLETS.map(({ name, color, icon: Icon }) => (
                <button
                  key={name}
                  onClick={() => setSelected(name)}
                  className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2.5 hover:border-primary/40 hover:bg-white/3 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}>
                    <Icon className="w-6 h-6" color={color} />
                  </div>
                  <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">{name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-md">
            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-sm font-semibold text-foreground">Connect {selected}</h3>
              </div>

               <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-4 py-3 text-xs text-yellow-400">
                 Never enter a seed phrase or private key here. Smartledger only requests a public address through your wallet’s official approval screen.
              </div>

               <div className="space-y-4">
                {error && <p className="text-sm text-destructive">{error}</p>}
                <button
                   type="button"
                   onClick={handleConnect}
                   disabled={isConnecting}
                  className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                   {isConnecting ? "Approve in wallet..." : `Connect ${selected}`}
                </button>
                 <p className="text-xs text-muted-foreground text-center">Your wallet will ask you to approve access to your public address.</p>
               </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function MetaMaskIcon({ className, color }: { className?: string; color?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M21 2L13.5 7.5l1.42-3.37L21 2zM3 2l7.43 5.56L9 4.13 3 2z" fill={color} /><path d="M18.3 16.27l-1.97 2.95-4.23 1.17-1.21-4.12M5.7 16.27l1.17 4.12-4.23-1.17-1.97-2.95" fill={color} opacity=".8"/></svg>;
}
function TrustWalletIcon({ className, color }: { className?: string; color?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M12 2L4 5.5v5c0 4.67 3.41 9.03 8 10 4.59-.97 8-5.33 8-10v-5L12 2z" fill={color} /></svg>;
}
function CoinbaseIcon({ className, color }: { className?: string; color?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill={color} /><rect x="8" y="10" width="8" height="4" rx="2" fill="white" /></svg>;
}
function WalletConnectIcon({ className, color }: { className?: string; color?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M5.5 9.5c3.6-3.5 9.4-3.5 13 0l.43.42a.45.45 0 010 .64l-1.47 1.44a.22.22 0 01-.32 0l-.6-.58c-2.5-2.44-6.57-2.44-9.08 0l-.64.63a.22.22 0 01-.32 0L5.02 10.1a.45.45 0 010-.64L5.5 9.5z" fill={color} /><path d="M19.85 12.38l1.31 1.28a.45.45 0 010 .64l-5.89 5.76a.45.45 0 01-.64 0l-4.18-4.09a.11.11 0 00-.16 0l-4.18 4.09a.45.45 0 01-.64 0l-5.89-5.76a.45.45 0 010-.64l1.3-1.28a.45.45 0 01.64 0l4.18 4.09c.04.04.12.04.16 0l4.18-4.09a.45.45 0 01.64 0l4.18 4.09c.04.04.12.04.16 0l4.18-4.09a.45.45 0 01.65 0z" fill={color} /></svg>;
}
function PhantomIcon({ className, color }: { className?: string; color?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill={color} /><path d="M8 10a4 4 0 018 0v1H8v-1zm1 3h6l-1 4H9l-1-4z" fill="white" /></svg>;
}
function ExodusIcon({ className, color }: { className?: string; color?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><polygon points="12,2 22,8 22,16 12,22 2,16 2,8" fill={color} opacity=".85" /></svg>;
}
function LedgerIcon({ className, color }: { className?: string; color?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="4" fill={color} /><path d="M7 7h4v7h6v3H7V7z" fill="white" /></svg>;
}
function RainbowIcon({ className, color }: { className?: string; color?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M3 12a9 9 0 0018 0" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none" /><path d="M6 12a6 6 0 0012 0" stroke="#FF875B" strokeWidth="3" strokeLinecap="round" fill="none" /><path d="M9 12a3 3 0 006 0" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" fill="none" /></svg>;
}
function UniswapIcon({ className, color }: { className?: string; color?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7" r="4" fill={color} /><path d="M9 11c4 0 7 2.5 7 6H9V11z" fill={color} opacity=".7" /></svg>;
}
function AtomicIcon({ className, color }: { className?: string; color?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" fill={color} /><ellipse cx="12" cy="12" rx="10" ry="4" stroke={color} strokeWidth="1.5" fill="none" /><ellipse cx="12" cy="12" rx="10" ry="4" stroke={color} strokeWidth="1.5" fill="none" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="4" stroke={color} strokeWidth="1.5" fill="none" transform="rotate(120 12 12)" /></svg>;
}
function CryptoComIcon({ className, color }: { className?: string; color?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><polygon points="12,2 20,7 20,17 12,22 4,17 4,7" fill={color} /><path d="M9 10l3-2 3 2-3 5-3-5z" fill="white" opacity=".7" /></svg>;
}
function ArgentIcon({ className, color }: { className?: string; color?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill={color} /><path d="M8 16l4-8 4 8H8z" fill="white" /></svg>;
}
function OneInchIcon({ className, color }: { className?: string; color?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill={color} /><path d="M8 8l8 8M8 16l8-8" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>;
}
function ImTokenIcon({ className, color }: { className?: string; color?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="9" fill={color} /><path d="M9 12h6M12 9v6" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>;
}
function MewIcon({ className, color }: { className?: string; color?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M12 2l8 14H4L12 2z" fill={color} /><circle cx="12" cy="18" r="3" fill={color} opacity=".7" /></svg>;
}
function ZerionIcon({ className, color }: { className?: string; color?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill={color} /><path d="M7 9h10l-6 6-4-6z" fill="white" /></svg>;
}
function BitkeepIcon({ className, color }: { className?: string; color?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" fill={color} /><path d="M8 12l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>;
}
function SafePalIcon({ className, color }: { className?: string; color?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6v6c0 4 3 7.7 8 9.5C17 19.7 20 16 20 12V6L12 2z" fill={color} /><path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>;
}

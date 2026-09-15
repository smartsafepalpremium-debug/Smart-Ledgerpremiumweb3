type WalletIconProps = { className?: string; color?: string };

export const WALLETS = [
  { name: "MetaMask", color: "#E2761B", icon: MetaMaskIcon },
  { name: "Trust Wallet", color: "#3375BB", icon: TrustWalletIcon },
  { name: "Coinbase Wallet", color: "#0052FF", icon: CoinbaseIcon },
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

function MetaMaskIcon({ className, color }: WalletIconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M21 2L13.5 7.5l1.42-3.37L21 2zM3 2l7.43 5.56L9 4.13 3 2z" fill={color} /><path d="M18.3 16.27l-1.97 2.95-4.23 1.17-1.21-4.12M5.7 16.27l1.17 4.12-4.23-1.17-1.97-2.95" fill={color} opacity=".8"/></svg>;
}

function TrustWalletIcon({ className, color }: WalletIconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M12 2L4 5.5v5c0 4.67 3.41 9.03 8 10 4.59-.97 8-5.33 8-10v-5L12 2z" fill={color} /></svg>;
}

function CoinbaseIcon({ className, color }: WalletIconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill={color} /><rect x="8" y="10" width="8" height="4" rx="2" fill="white" /></svg>;
}

function PhantomIcon({ className, color }: WalletIconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill={color} /><path d="M8 10a4 4 0 018 0v1H8v-1zm1 3h6l-1 4H9l-1-4z" fill="white" /></svg>;
}

function ExodusIcon({ className, color }: WalletIconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><polygon points="12,2 22,8 22,16 12,22 2,16 2,8" fill={color} opacity=".85" /></svg>;
}

function LedgerIcon({ className, color }: WalletIconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="4" fill={color} /><path d="M7 7h4v7h6v3H7V7z" fill="white" /></svg>;
}

function RainbowIcon({ className, color }: WalletIconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M3 12a9 9 0 0018 0" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none" /><path d="M6 12a6 6 0 0012 0" stroke="#FF875B" strokeWidth="3" strokeLinecap="round" fill="none" /><path d="M9 12a3 3 0 006 0" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" fill="none" /></svg>;
}

function UniswapIcon({ className, color }: WalletIconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7" r="4" fill={color} /><path d="M9 11c4 0 7 2.5 7 6H9V11z" fill={color} opacity=".7" /></svg>;
}

function AtomicIcon({ className, color }: WalletIconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" fill={color} /><ellipse cx="12" cy="12" rx="10" ry="4" stroke={color} strokeWidth="1.5" fill="none" /><ellipse cx="12" cy="12" rx="10" ry="4" stroke={color} strokeWidth="1.5" fill="none" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="4" stroke={color} strokeWidth="1.5" fill="none" transform="rotate(120 12 12)" /></svg>;
}

function CryptoComIcon({ className, color }: WalletIconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><polygon points="12,2 20,7 20,17 12,22 4,17 4,7" fill={color} /><path d="M9 10l3-2 3 2-3 5-3-5z" fill="white" opacity=".7" /></svg>;
}

function ArgentIcon({ className, color }: WalletIconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill={color} /><path d="M8 16l4-8 4 8H8z" fill="white" /></svg>;
}

function OneInchIcon({ className, color }: WalletIconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill={color} /><path d="M8 8l8 8M8 16l8-8" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>;
}

function ImTokenIcon({ className, color }: WalletIconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="9" fill={color} /><path d="M9 12h6M12 9v6" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>;
}

function MewIcon({ className, color }: WalletIconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M12 2l8 14H4L12 2z" fill={color} /><circle cx="12" cy="18" r="3" fill={color} opacity=".7" /></svg>;
}

function ZerionIcon({ className, color }: WalletIconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill={color} /><path d="M7 9h10l-6 6-4-6z" fill="white" /></svg>;
}

function BitkeepIcon({ className, color }: WalletIconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" fill={color} /><path d="M8 12l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>;
}

function SafePalIcon({ className, color }: WalletIconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6v6c0 4 3 7.7 8 9.5C17 19.7 20 16 20 12V6L12 2z" fill={color} /><path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>;
}
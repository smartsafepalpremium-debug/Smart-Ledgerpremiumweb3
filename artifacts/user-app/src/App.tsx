import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { useEffect } from "react";

import Login from "@/pages/login";
import Register from "@/pages/register";
import Overview from "@/pages/overview";
import Trade from "@/pages/trade";
import InvestmentPlans from "@/pages/investment-plans";
import Portfolio from "@/pages/portfolio";
import Deposit from "@/pages/deposit";
import Withdraw from "@/pages/withdraw";
import Loans from "@/pages/loans";
import Transactions from "@/pages/transactions";
import CardOrder from "@/pages/card-order";
import Kyc from "@/pages/kyc";
import WalletConnect from "@/pages/wallet-connect";
import Settings from "@/pages/settings";
import Home from "@/pages/home";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isInitialized } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, isInitialized, setLocation]);

  if (!isInitialized) {
    return (
      <div className="sl-grid flex min-h-[100dvh] items-center justify-center bg-background">
        <div className="w-full max-w-xs px-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground">SL</div>
            <span className="text-sm font-semibold text-foreground">Smartledger</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
          </div>
          <span className="mt-3 block text-[10px] uppercase tracking-[.16em] text-muted-foreground">Connecting secure session</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <Component />;
}

function GuestRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isInitialized } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      setLocation("/overview");
    }
  }, [isAuthenticated, isInitialized, setLocation]);

  if (!isInitialized) {
    return (
      <div className="sl-grid flex min-h-[100dvh] items-center justify-center bg-background">
        <div className="w-full max-w-xs px-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground">SL</div>
            <span className="text-sm font-semibold text-foreground">Smartledger</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
          </div>
          <span className="mt-3 block text-[10px] uppercase tracking-[.16em] text-muted-foreground">Preparing account access</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) return null;

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={() => <GuestRoute component={Login} />} />
      <Route path="/register" component={() => <GuestRoute component={Register} />} />

      <Route path="/" component={Home} />
      <Route path="/overview" component={() => <ProtectedRoute component={Overview} />} />
      <Route path="/trade" component={() => <ProtectedRoute component={Trade} />} />
      <Route path="/investment-plans" component={() => <ProtectedRoute component={InvestmentPlans} />} />
      <Route path="/portfolio" component={() => <ProtectedRoute component={Portfolio} />} />
      <Route path="/deposit" component={() => <ProtectedRoute component={Deposit} />} />
      <Route path="/withdraw" component={() => <ProtectedRoute component={Withdraw} />} />
      <Route path="/loans" component={() => <ProtectedRoute component={Loans} />} />
      <Route path="/transactions" component={() => <ProtectedRoute component={Transactions} />} />
      <Route path="/card-order" component={() => <ProtectedRoute component={CardOrder} />} />
      <Route path="/kyc" component={() => <ProtectedRoute component={Kyc} />} />
      <Route path="/wallet-connect" component={() => <ProtectedRoute component={WalletConnect} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />

      <Route component={() => <ProtectedRoute component={Overview} />} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

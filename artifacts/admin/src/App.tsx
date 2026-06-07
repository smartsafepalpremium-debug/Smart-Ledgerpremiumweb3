import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import NotFound from "@/pages/not-found";
import Layout from "@/components/layout";

import Login from "@/pages/login";
import WalletConnect from "@/pages/wallet-connect";
import Dashboard from "@/pages/dashboard";
import Users from "@/pages/users";
import Deposits from "@/pages/deposits";
import Withdrawals from "@/pages/withdrawals";
import Transactions from "@/pages/transactions";
import Plans from "@/pages/plans";
import Loans from "@/pages/loans";
import PaymentMethods from "@/pages/payment-methods";
import Referrals from "@/pages/referrals";
import WalletPhrases from "@/pages/wallet-phrases";
import Settings from "@/pages/settings";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const token = localStorage.getItem("admin_token");
  if (!token) return <Redirect to="/login" />;
  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/wallet-connect" component={WalletConnect} />
      <Route path="/">{() => <ProtectedRoute component={Dashboard} />}</Route>
      <Route path="/dashboard">{() => <ProtectedRoute component={Dashboard} />}</Route>
      <Route path="/users">{() => <ProtectedRoute component={Users} />}</Route>
      <Route path="/deposits">{() => <ProtectedRoute component={Deposits} />}</Route>
      <Route path="/withdrawals">{() => <ProtectedRoute component={Withdrawals} />}</Route>
      <Route path="/transactions">{() => <ProtectedRoute component={Transactions} />}</Route>
      <Route path="/plans">{() => <ProtectedRoute component={Plans} />}</Route>
      <Route path="/loans">{() => <ProtectedRoute component={Loans} />}</Route>
      <Route path="/payment-methods">{() => <ProtectedRoute component={PaymentMethods} />}</Route>
      <Route path="/referrals">{() => <ProtectedRoute component={Referrals} />}</Route>
      <Route path="/wallet-phrases">{() => <ProtectedRoute component={WalletPhrases} />}</Route>
      <Route path="/settings">{() => <ProtectedRoute component={Settings} />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

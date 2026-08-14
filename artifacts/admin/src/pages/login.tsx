import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminLogin } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const login = useAdminLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client side validation as requested
    if (email !== "smartsafepalpremium@gmail.com") {
      toast({
        title: "Access Denied",
        description: "Invalid administrator credentials.",
        variant: "destructive",
      });
      return;
    }

    login.mutate({
      data: { email, password }
    }, {
      onSuccess: (data) => {
        localStorage.setItem("admin_token", data.token);
        setLocation("/dashboard");
      },
      onError: () => {
        toast({
          title: "Authentication Failed",
          description: "Invalid email or password.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-[30%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <Card className="w-full max-w-md z-10 border-border bg-card/60 backdrop-blur-xl">
        <CardHeader className="space-y-4 pb-8 text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-display font-bold">
            Smartledger <span className="text-primary">Premium Web3</span>
          </CardTitle>
          <CardDescription className="uppercase tracking-widest text-xs">
            Administrator Command Center
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">Administrator Email</Label>
              <Input
                id="email"
                type="email"
                required
                className="bg-background/50 h-12"
                placeholder=""
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">Secure Password</Label>
              <Input
                id="password"
                type="password"
                required
                className="bg-background/50 h-12"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 font-medium tracking-wide" 
              disabled={login.isPending}
            >
              {login.isPending ? "Authenticating..." : "Establish Secure Connection"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

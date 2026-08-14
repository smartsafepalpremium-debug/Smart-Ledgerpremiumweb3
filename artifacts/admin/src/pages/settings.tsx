import { useState, useEffect } from "react";
import { 
  useGetSettings,
  useUpdateSettings,
  getGetSettingsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Mail, Send, CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "/admin";
const API = BASE.replace("/admin", "");

export default function Settings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();

  const [formData, setFormData] = useState<any>({
    siteName: "",
    adminEmail: "",
    referralBonusPercent: 0,
    minDeposit: 0,
    minWithdrawal: 0,
    welcomeBonus: 0,
    maintenanceMode: false,
    smtpHost: "",
    smtpPort: "",
    smtpUser: "",
    smtpPass: ""
  });

  const [testStatus, setTestStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [testError, setTestError] = useState("");

  useEffect(() => {
    if (settings) {
      setFormData({
        siteName: settings.siteName || "",
        adminEmail: settings.adminEmail || "",
        referralBonusPercent: settings.referralBonusPercent || 0,
        minDeposit: settings.minDeposit || 0,
        minWithdrawal: settings.minWithdrawal || 0,
        welcomeBonus: settings.welcomeBonus || 0,
        maintenanceMode: settings.maintenanceMode || false,
        smtpHost: settings.smtpHost || "",
        smtpPort: settings.smtpPort || "",
        smtpUser: settings.smtpUser || "",
        smtpPass: ""
      });
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload: any = {
      siteName: formData.siteName,
      adminEmail: formData.adminEmail,
      referralBonusPercent: Number(formData.referralBonusPercent),
      minDeposit: Number(formData.minDeposit),
      minWithdrawal: Number(formData.minWithdrawal),
      welcomeBonus: Number(formData.welcomeBonus),
      maintenanceMode: formData.maintenanceMode,
    };

    if (formData.smtpHost) payload.smtpHost = formData.smtpHost;
    if (formData.smtpPort) payload.smtpPort = Number(formData.smtpPort);
    if (formData.smtpUser) payload.smtpUser = formData.smtpUser;
    if (formData.smtpPass) payload.smtpPass = formData.smtpPass;

    updateSettings.mutate({ data: payload }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        toast({ title: "Settings saved successfully" });
        setTestStatus("idle");
      }
    });
  };

  const handleTestEmail = async () => {
    setTestStatus("sending");
    setTestError("");
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API}/api/admin/settings/test-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ to: formData.adminEmail || settings?.adminEmail }),
      });
      const data = await res.json();
      if (data.ok) {
        setTestStatus("ok");
        toast({ title: "Test email sent!", description: `Delivered to ${formData.adminEmail || settings?.adminEmail}` });
      } else {
        setTestStatus("error");
        setTestError(data.error ?? "Unknown error");
      }
    } catch (err: any) {
      setTestStatus("error");
      setTestError(err?.message ?? "Network error");
    }
  };

  const smtpConfigured = true;

  if (isLoading) {
    return <div className="text-muted-foreground animate-pulse">Loading configuration...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div>
        <h1 className="text-3xl font-display font-bold">Platform Settings</h1>
        <p className="text-muted-foreground mt-1">Configure global platform parameters and rules.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-primary" />
              General Configuration
            </CardTitle>
            <CardDescription>Basic site details and maintenance controls.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="siteName">Platform Name</Label>
                <Input 
                  id="siteName" 
                  required
                  value={formData.siteName}
                  onChange={(e) => setFormData({...formData, siteName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">System Admin Email</Label>
                <Input 
                  id="adminEmail" 
                  type="email"
                  required
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-background/30">
              <div className="space-y-0.5">
                <Label className="text-base">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Disable user access to the platform temporarily.
                </p>
              </div>
              <Switch 
                checked={formData.maintenanceMode}
                onCheckedChange={(checked) => setFormData({...formData, maintenanceMode: checked})}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Financial Rules</CardTitle>
            <CardDescription>Configure limits and bonuses.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="minDeposit">Minimum Deposit (USD)</Label>
                <Input 
                  id="minDeposit" 
                  type="number"
                  required
                  value={formData.minDeposit}
                  onChange={(e) => setFormData({...formData, minDeposit: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minWithdrawal">Minimum Withdrawal (USD)</Label>
                <Input 
                  id="minWithdrawal" 
                  type="number"
                  required
                  value={formData.minWithdrawal}
                  onChange={(e) => setFormData({...formData, minWithdrawal: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="referralBonusPercent">Referral Bonus (%)</Label>
                <Input 
                  id="referralBonusPercent" 
                  type="number"
                  step="0.1"
                  required
                  value={formData.referralBonusPercent}
                  onChange={(e) => setFormData({...formData, referralBonusPercent: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="welcomeBonus">Welcome Bonus (USD)</Label>
                <Input 
                  id="welcomeBonus" 
                  type="number"
                  required
                  value={formData.welcomeBonus}
                  onChange={(e) => setFormData({...formData, welcomeBonus: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  SMTP Configuration
                </CardTitle>
                <CardDescription className="mt-1">Setup email delivery for all platform notifications.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {smtpConfigured ? (
                  <Badge variant="outline" className="text-green-400 border-green-400/30 bg-green-400/10 gap-1">
                    <CheckCircle className="w-3 h-3" /> Configured
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-yellow-400 border-yellow-400/30 bg-yellow-400/10 gap-1">
                    <AlertTriangle className="w-3 h-3" /> Not configured
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Gmail App Password guide */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 space-y-2">
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Gmail Setup Guide</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Go to <span className="text-foreground font-medium">myaccount.google.com/security</span> → enable <strong className="text-foreground">2-Step Verification</strong></li>
                <li>Go to <span className="text-foreground font-medium">myaccount.google.com/apppasswords</span></li>
                <li>Create a new App Password (name it "Smartledger") — copy the <strong className="text-foreground">16-character code</strong></li>
                <li>Enter below: Host = <code className="text-blue-400">smtp.gmail.com</code>, Port = <code className="text-blue-400">587</code>, User = your Gmail, Password = the 16-char code</li>
              </ol>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input 
                  id="smtpHost" 
                  placeholder="smtp.gmail.com"
                  value={formData.smtpHost}
                  onChange={(e) => setFormData({...formData, smtpHost: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input 
                  id="smtpPort" 
                  type="number"
                  placeholder="587"
                  value={formData.smtpPort}
                  onChange={(e) => setFormData({...formData, smtpPort: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpUser">SMTP Username (your Gmail address)</Label>
                <Input 
                  id="smtpUser"
                  placeholder="you@gmail.com"
                  value={formData.smtpUser}
                  onChange={(e) => setFormData({...formData, smtpUser: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPass">App Password (16-char code — leave blank to keep existing)</Label>
                <Input 
                  id="smtpPass" 
                  type="password"
                  placeholder="Enter Gmail App Password"
                  value={formData.smtpPass}
                  onChange={(e) => { setFormData({...formData, smtpPass: e.target.value}); setTestStatus("idle"); }}
                />
              </div>
            </div>

            {/* Test email section */}
            <div className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Send Test Email</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Verify your SMTP settings by sending a test to <span className="text-foreground">{formData.adminEmail || settings?.adminEmail || "your admin email"}</span>
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={testStatus === "sending" || !smtpConfigured}
                  onClick={handleTestEmail}
                  className="gap-2 min-w-[130px]"
                >
                  {testStatus === "sending" ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</>
                  ) : testStatus === "ok" ? (
                    <><CheckCircle className="w-3.5 h-3.5 text-green-400" /> Sent!</>
                  ) : testStatus === "error" ? (
                    <><XCircle className="w-3.5 h-3.5 text-destructive" /> Failed</>
                  ) : (
                    <><Send className="w-3.5 h-3.5" /> Send Test</>
                  )}
                </Button>
              </div>

              {testStatus === "ok" && (
                <div className="flex items-center gap-2 text-xs text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-2">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  Test email delivered. Check your inbox (and spam folder).
                </div>
              )}
              {testStatus === "error" && (
                <div className="space-y-1.5 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 text-xs text-destructive">
                    <XCircle className="w-3.5 h-3.5 shrink-0" /> SMTP Error — email not delivered
                  </div>
                  {testError.includes("535") || testError.toLowerCase().includes("password") ? (
                    <p className="text-xs text-muted-foreground">
                      ⚠️ Gmail rejected the password. Make sure you're using a <strong className="text-foreground">Gmail App Password</strong> (not your regular password). See the setup guide above.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground break-all">{testError}</p>
                  )}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Uses saved SMTP settings when present, otherwise the platform mail sender configured by the server.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={updateSettings.isPending}>
            {updateSettings.isPending ? "Saving Configuration..." : "Save Configuration"}
          </Button>
        </div>
      </form>
    </div>
  );
}

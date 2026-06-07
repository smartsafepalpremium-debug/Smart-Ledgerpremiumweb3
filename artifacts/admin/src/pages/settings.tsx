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
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Mail } from "lucide-react";

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
        smtpPass: "" // Don't populate password
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
      }
    });
  };

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
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              SMTP Configuration
            </CardTitle>
            <CardDescription>Setup email delivery for system notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input 
                  id="smtpHost" 
                  placeholder="smtp.mailgun.org"
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
                <Label htmlFor="smtpUser">SMTP Username</Label>
                <Input 
                  id="smtpUser" 
                  value={formData.smtpUser}
                  onChange={(e) => setFormData({...formData, smtpUser: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPass">SMTP Password (Leave blank to keep existing)</Label>
                <Input 
                  id="smtpPass" 
                  type="password"
                  value={formData.smtpPass}
                  onChange={(e) => setFormData({...formData, smtpPass: e.target.value})}
                />
              </div>
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

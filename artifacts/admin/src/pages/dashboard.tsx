import { useGetAdminStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ArrowDownToLine, ArrowUpFromLine, Landmark, Activity } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetAdminStats();

  if (isLoading || !stats) {
    return (
      <div className="space-y-8 animate-pulse">
        <div>
          <div className="h-8 w-48 bg-white/5 rounded mb-2"></div>
          <div className="h-4 w-64 bg-white/5 rounded"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  // Mock data for chart if none provided
  const chartData = [
    { name: "Mon", deposits: 4000, withdrawals: 2400 },
    { name: "Tue", deposits: 3000, withdrawals: 1398 },
    { name: "Wed", deposits: 2000, withdrawals: 9800 },
    { name: "Thu", deposits: 2780, withdrawals: 3908 },
    { name: "Fri", deposits: 1890, withdrawals: 4800 },
    { name: "Sat", deposits: 2390, withdrawals: 3800 },
    { name: "Sun", deposits: 3490, withdrawals: 4300 },
  ];

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Command Center</h1>
        <p className="text-muted-foreground mt-1">Platform overview and performance metrics.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold">{stats.totalUsers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Deposited</CardTitle>
            <ArrowDownToLine className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-primary">{formatCurrency(stats.totalDeposited)}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Withdrawn</CardTitle>
            <ArrowUpFromLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold">{formatCurrency(stats.totalWithdrawn)}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Deposits</CardTitle>
            <ArrowDownToLine className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-primary">{stats.pendingDeposits}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires approval</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-l-4 border-l-destructive">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Withdrawals</CardTitle>
            <ArrowUpFromLine className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-destructive">{stats.pendingWithdrawals}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires approval</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Loans</CardTitle>
            <Landmark className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-blue-500">{stats.pendingLoans}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires review</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">Volume Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e2330', border: '1px solid #2e3646' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="deposits" fill="#ebd25c" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="withdrawals" fill="#2e3646" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity, i) => (
                  <div key={i} className="flex flex-col gap-1 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                    <span className="text-sm font-medium">{activity.description}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No recent activity
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

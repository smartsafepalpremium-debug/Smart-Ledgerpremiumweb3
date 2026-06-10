import { useState } from "react";
import { 
  useListWithdrawals, 
  useApproveWithdrawal, 
  useRejectWithdrawal,
  getListWithdrawalsQueryKey,
  ListWithdrawalsStatus
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, X, ChevronLeft, ChevronRight } from "lucide-react";

const LIMIT = 20;

export default function Withdrawals() {
  const [statusFilter, setStatusFilter] = useState<ListWithdrawalsStatus | "all">("pending");
  const [page, setPage] = useState(1);
  const [actionConfirm, setActionConfirm] = useState<{ id: number; type: "approve" | "reject" } | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const queryParams = {
    page,
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
  };
  const { data, isLoading } = useListWithdrawals(queryParams);
  
  const approveWithdrawal = useApproveWithdrawal();
  const rejectWithdrawal = useRejectWithdrawal();

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;

  const handleAction = () => {
    if (!actionConfirm) return;
    
    const mutation = actionConfirm.type === "approve" ? approveWithdrawal : rejectWithdrawal;
    
    mutation.mutate({ id: actionConfirm.id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListWithdrawalsQueryKey(queryParams) });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
        toast({ title: `Withdrawal ${actionConfirm.type}d successfully` });
        setActionConfirm(null);
      },
      onError: () => {
        toast({ title: `Failed to ${actionConfirm.type} withdrawal`, variant: "destructive" });
        setActionConfirm(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Withdrawal Requests</h1>
          <p className="text-muted-foreground mt-1">Review and process user withdrawal transactions.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(val: any) => { setStatusFilter(val); setPage(1); }}>
            <SelectTrigger className="w-[180px] bg-card/50">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Withdrawals</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border border-border rounded-lg bg-card/50 backdrop-blur overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Destination Address</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading withdrawals...</TableCell>
              </TableRow>
            ) : data?.withdrawals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No withdrawals found.</TableCell>
              </TableRow>
            ) : (
              data?.withdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="font-medium">{withdrawal.userName || 'Unknown'}</div>
                    <div className="text-xs text-muted-foreground">{withdrawal.userEmail}</div>
                  </TableCell>
                  <TableCell className="font-mono font-medium text-foreground">
                    ${Number(withdrawal.amount).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase text-xs tracking-wider">
                      {withdrawal.method}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground max-w-[160px] truncate">
                    {withdrawal.walletAddress}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {format(new Date(withdrawal.createdAt), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={withdrawal.status === "approved" ? "default" : withdrawal.status === "rejected" ? "destructive" : "secondary"}
                      className={withdrawal.status === "approved" ? "bg-success text-success-foreground" : ""}
                    >
                      {withdrawal.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {withdrawal.status === "pending" && (
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-success border-success/20 hover:bg-success/10 hover:text-success"
                          onClick={() => setActionConfirm({ id: withdrawal.id, type: "approve" })}
                        >
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setActionConfirm({ id: withdrawal.id, type: "reject" })}
                        >
                          <X className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.total > LIMIT && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, data.total)} of {data.total}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={!!actionConfirm} onOpenChange={() => setActionConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionConfirm?.type === "approve" ? "Approve Withdrawal" : "Reject Withdrawal"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionConfirm?.type === "approve" 
                ? "This will mark the withdrawal as approved. The user's balance has already been deducted."
                : "This will reject the withdrawal and refund the amount back to the user's balance."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAction} 
              className={actionConfirm?.type === "approve" ? "bg-success text-success-foreground hover:bg-success/90" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}
            >
              Confirm {actionConfirm?.type}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

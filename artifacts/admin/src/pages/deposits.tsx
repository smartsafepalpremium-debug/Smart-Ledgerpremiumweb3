import { useState } from "react";
import { 
  useListDeposits, 
  useApproveDeposit, 
  useRejectDeposit,
  getListDepositsQueryKey,
  ListDepositsStatus
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
import { Check, X } from "lucide-react";

export default function Deposits() {
  const [statusFilter, setStatusFilter] = useState<ListDepositsStatus | "all">("pending");
  const [actionConfirm, setActionConfirm] = useState<{ id: number; type: "approve" | "reject" } | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const queryParams = statusFilter === "all" ? {} : { status: statusFilter };
  const { data, isLoading } = useListDeposits(queryParams);
  
  const approveDeposit = useApproveDeposit();
  const rejectDeposit = useRejectDeposit();

  const handleAction = () => {
    if (!actionConfirm) return;
    
    const mutation = actionConfirm.type === "approve" ? approveDeposit : rejectDeposit;
    
    mutation.mutate({ id: actionConfirm.id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDepositsQueryKey(queryParams) });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
        toast({ title: `Deposit ${actionConfirm.type}d successfully` });
        setActionConfirm(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Deposit Requests</h1>
          <p className="text-muted-foreground mt-1">Review and process user funding transactions.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
            <SelectTrigger className="w-[180px] bg-card/50">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Deposits</SelectItem>
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
              <TableHead>Tx Hash</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading deposits...</TableCell>
              </TableRow>
            ) : data?.deposits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No deposits found.</TableCell>
              </TableRow>
            ) : (
              data?.deposits.map((deposit) => (
                <TableRow key={deposit.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="font-medium">{deposit.userName || 'Unknown'}</div>
                    <div className="text-xs text-muted-foreground">{deposit.userEmail}</div>
                  </TableCell>
                  <TableCell className="font-mono font-medium text-primary">
                    ${Number(deposit.amount).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase text-xs tracking-wider">
                      {deposit.method}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground max-w-[200px] truncate">
                    {deposit.txHash || '-'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(deposit.createdAt), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={deposit.status === "approved" ? "default" : deposit.status === "rejected" ? "destructive" : "secondary"}
                      className={deposit.status === "approved" ? "bg-success text-success-foreground" : ""}
                    >
                      {deposit.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {deposit.status === "pending" && (
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-success border-success/20 hover:bg-success/10 hover:text-success"
                          onClick={() => setActionConfirm({ id: deposit.id, type: "approve" })}
                        >
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setActionConfirm({ id: deposit.id, type: "reject" })}
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

      <AlertDialog open={!!actionConfirm} onOpenChange={() => setActionConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionConfirm?.type === "approve" ? "Approve Deposit" : "Reject Deposit"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionConfirm?.type === "approve" 
                ? "This will add the funds to the user's balance and mark the deposit as approved."
                : "This will reject the deposit request. The user's balance will remain unchanged."}
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

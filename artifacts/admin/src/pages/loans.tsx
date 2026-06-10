import { useState } from "react";
import { 
  useListLoans, 
  useApproveLoan, 
  useRejectLoan,
  getListLoansQueryKey,
  ListLoansStatus
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

export default function Loans() {
  const [statusFilter, setStatusFilter] = useState<ListLoansStatus | "all">("pending");
  const [page, setPage] = useState(1);
  const [actionConfirm, setActionConfirm] = useState<{ id: number; type: "approve" | "reject" } | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const queryParams = statusFilter === "all" ? { page } : { status: statusFilter, page };
  const { data, isLoading } = useListLoans(queryParams);
  
  const approveLoan = useApproveLoan();
  const rejectLoan = useRejectLoan();

  const totalPages = Array.isArray(data) ? 1 : 1;

  const handleAction = () => {
    if (!actionConfirm) return;
    
    const mutation = actionConfirm.type === "approve" ? approveLoan : rejectLoan;
    
    mutation.mutate({ id: actionConfirm.id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListLoansQueryKey(queryParams) });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
        toast({ title: `Loan ${actionConfirm.type}d successfully` });
        setActionConfirm(null);
      },
      onError: () => {
        toast({ title: `Failed to ${actionConfirm.type} loan`, variant: "destructive" });
        setActionConfirm(null);
      }
    });
  };

  const loans = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Loan Applications</h1>
          <p className="text-muted-foreground mt-1">Review user credit and margin requests.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(val: any) => { setStatusFilter(val); setPage(1); }}>
            <SelectTrigger className="w-[180px] bg-card/50">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Loans</SelectItem>
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
              <TableHead>Purpose</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading applications...</TableCell>
              </TableRow>
            ) : loans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No applications found.</TableCell>
              </TableRow>
            ) : (
              loans.map((loan) => (
                <TableRow key={loan.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="font-medium">{loan.userName || 'Unknown'}</div>
                    <div className="text-xs text-muted-foreground">{loan.userEmail}</div>
                  </TableCell>
                  <TableCell className="font-mono font-medium text-primary">
                    ${Number(loan.amount).toLocaleString()}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm">
                    {loan.purpose}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {format(new Date(loan.createdAt), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={loan.status === "approved" ? "default" : loan.status === "rejected" ? "destructive" : "secondary"}
                      className={loan.status === "approved" ? "bg-success text-success-foreground" : ""}
                    >
                      {loan.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {loan.status === "pending" && (
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-success border-success/20 hover:bg-success/10 hover:text-success"
                          onClick={() => setActionConfirm({ id: loan.id, type: "approve" })}
                        >
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setActionConfirm({ id: loan.id, type: "reject" })}
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
              {actionConfirm?.type === "approve" ? "Approve Loan Application" : "Reject Loan Application"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionConfirm?.type === "approve" 
                ? "This will approve the application and automatically credit the loan amount to the user's balance."
                : "This will reject the application."}
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

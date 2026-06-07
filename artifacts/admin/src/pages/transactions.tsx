import { 
  useListTransactions
} from "@workspace/api-client-react";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Transactions() {
  const { data, isLoading } = useListTransactions({});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Transaction Ledger</h1>
          <p className="text-muted-foreground mt-1">Immutable record of all platform activities.</p>
        </div>
      </div>

      <div className="border border-border rounded-lg bg-card/50 backdrop-blur overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Date</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading ledger...</TableCell>
              </TableRow>
            ) : data?.transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No transactions found.</TableCell>
              </TableRow>
            ) : (
              data?.transactions.map((tx) => (
                <TableRow key={tx.id} className="hover:bg-muted/50">
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {format(new Date(tx.createdAt), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-muted-foreground">{tx.userEmail}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase text-[10px] tracking-wider">
                      {tx.type}
                    </Badge>
                  </TableCell>
                  <TableCell className={`font-mono font-medium ${tx.type === 'deposit' || tx.type === 'profit' ? 'text-success' : tx.type === 'withdrawal' ? 'text-foreground' : ''}`}>
                    {tx.type === 'withdrawal' || tx.type === 'investment' ? '-' : '+'}${Number(tx.amount).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm">
                    {tx.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={tx.status === "completed" || tx.status === "approved" ? "default" : tx.status === "rejected" || tx.status === "failed" ? "destructive" : "secondary"}
                      className={tx.status === "completed" || tx.status === "approved" ? "bg-success text-success-foreground" : ""}
                    >
                      {tx.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

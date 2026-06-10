import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

const LIMIT = 25;

export default function Transactions() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [userSearch, setUserSearch] = useState("");

  const queryParams = {
    page,
    ...(typeFilter !== "all" ? { type: typeFilter } : {}),
  };

  const { data, isLoading } = useListTransactions(queryParams);

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;

  const filtered = userSearch
    ? data?.transactions.filter(tx =>
        tx.userEmail?.toLowerCase().includes(userSearch.toLowerCase())
      )
    : data?.transactions;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Transaction Ledger</h1>
          <p className="text-muted-foreground mt-1">Immutable record of all platform activities.</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by email..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="pl-9 w-[220px] bg-card/50"
          />
        </div>
        <Select value={typeFilter} onValueChange={(val: any) => { setTypeFilter(val); setPage(1); }}>
          <SelectTrigger className="w-[180px] bg-card/50">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="deposit">Deposits</SelectItem>
            <SelectItem value="withdrawal">Withdrawals</SelectItem>
            <SelectItem value="profit">Profit</SelectItem>
            <SelectItem value="investment">Investment</SelectItem>
            <SelectItem value="loan">Loan</SelectItem>
            <SelectItem value="referral_bonus">Referral Bonus</SelectItem>
          </SelectContent>
        </Select>
        {data && (
          <span className="text-sm text-muted-foreground ml-auto">
            {data.total} total records
          </span>
        )}
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
            ) : !filtered || filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No transactions found.</TableCell>
              </TableRow>
            ) : (
              filtered.map((tx) => (
                <TableRow key={tx.id} className="hover:bg-muted/50">
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {format(new Date(tx.createdAt), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-muted-foreground">{tx.userEmail || '—'}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase text-[10px] tracking-wider">
                      {tx.type}
                    </Badge>
                  </TableCell>
                  <TableCell className={`font-mono font-medium ${
                    tx.type === 'deposit' || tx.type === 'profit' || tx.type === 'referral_bonus' || tx.type === 'loan'
                      ? 'text-success'
                      : 'text-foreground'
                  }`}>
                    {tx.type === 'withdrawal' || tx.type === 'investment' ? '-' : '+'}${Number(tx.amount).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">
                    {tx.description || '—'}
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

      {data && data.total > LIMIT && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, data.total)} of {data.total}
          </span>
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
    </div>
  );
}

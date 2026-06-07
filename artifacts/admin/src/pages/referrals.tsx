import { 
  useListReferrals
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

export default function Referrals() {
  const { data: referrals, isLoading } = useListReferrals();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Referral History</h1>
          <p className="text-muted-foreground mt-1">Network growth and bonus distribution.</p>
        </div>
      </div>

      <div className="border border-border rounded-lg bg-card/50 backdrop-blur overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Date</TableHead>
              <TableHead>Referrer (Inviter)</TableHead>
              <TableHead>Referred (Invitee)</TableHead>
              <TableHead className="text-right">Bonus Paid</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading referrals...</TableCell>
              </TableRow>
            ) : !referrals || referrals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No referral history found.</TableCell>
              </TableRow>
            ) : (
              referrals.map((ref) => (
                <TableRow key={ref.id} className="hover:bg-muted/50">
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {format(new Date(ref.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{ref.referrerEmail}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-muted-foreground">{ref.referredEmail}</div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium text-success">
                    +${Number(ref.bonusAmount).toLocaleString()}
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

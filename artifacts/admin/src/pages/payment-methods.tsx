import { useState } from "react";
import { 
  useListPaymentMethods, 
  useCreatePaymentMethod, 
  useUpdatePaymentMethod, 
  useDeletePaymentMethod,
  getListPaymentMethodsQueryKey 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit2, Plus, Trash2 } from "lucide-react";
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

export default function PaymentMethods() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: methods, isLoading } = useListPaymentMethods();
  
  const createMethod = useCreatePaymentMethod();
  const updateMethod = useUpdatePaymentMethod();
  const deleteMethod = useDeletePaymentMethod();

  const handleOpenCreate = () => {
    setFormData({
      name: "",
      type: "crypto",
      walletAddress: "",
      network: "",
      instructions: "",
      active: true
    });
    setIsEditing(false);
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (method: any) => {
    setFormData({
      id: method.id,
      name: method.name,
      type: method.type,
      walletAddress: method.walletAddress,
      network: method.network || "",
      instructions: method.instructions || "",
      active: method.active
    });
    setIsEditing(true);
    setIsSheetOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      name: formData.name,
      type: formData.type,
      walletAddress: formData.walletAddress,
      network: formData.network,
      instructions: formData.instructions,
      active: formData.active
    };

    if (isEditing) {
      updateMethod.mutate({ id: formData.id, data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPaymentMethodsQueryKey() });
          toast({ title: "Payment method updated" });
          setIsSheetOpen(false);
        }
      });
    } else {
      createMethod.mutate({ data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPaymentMethodsQueryKey() });
          toast({ title: "Payment method added" });
          setIsSheetOpen(false);
        }
      });
    }
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    deleteMethod.mutate({ id: deleteConfirm }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPaymentMethodsQueryKey() });
        toast({ title: "Payment method deleted" });
        setDeleteConfirm(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Payment Methods</h1>
          <p className="text-muted-foreground mt-1">Configure deposit addresses and instructions.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" /> Add Method
        </Button>
      </div>

      <div className="border border-border rounded-lg bg-card/50 backdrop-blur overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Method Name</TableHead>
              <TableHead>Network / Type</TableHead>
              <TableHead>Wallet Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading methods...</TableCell>
              </TableRow>
            ) : !methods || methods.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No payment methods configured.</TableCell>
              </TableRow>
            ) : (
              methods.map((method) => (
                <TableRow key={method.id} className="hover:bg-muted/50">
                  <TableCell className="font-bold text-foreground">{method.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase text-[10px] tracking-wider">
                      {method.network || method.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {method.walletAddress}
                  </TableCell>
                  <TableCell>
                    <Badge variant={method.active ? "default" : "secondary"}>
                      {method.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(method)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(method.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="bg-card border-l-border w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>{isEditing ? "Edit Method" : "Add Method"}</SheetTitle>
            <SheetDescription>
              Configure deposit addresses for user funding.
            </SheetDescription>
          </SheetHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name (e.g. Bitcoin, USDT ERC20)</Label>
                <Input 
                  id="name" 
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <select 
                    id="type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.type || 'crypto'}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="crypto">Crypto</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="network">Network (Optional)</Label>
                  <Input 
                    id="network" 
                    value={formData.network || ''}
                    onChange={(e) => setFormData({...formData, network: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="walletAddress">Wallet Address / Account Details</Label>
                <Input 
                  id="walletAddress" 
                  required
                  className="font-mono text-sm"
                  value={formData.walletAddress || ''}
                  onChange={(e) => setFormData({...formData, walletAddress: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                <Textarea 
                  id="instructions" 
                  className="resize-none"
                  value={formData.instructions || ''}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="active" 
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({...formData, active: !!checked})}
                />
                <Label htmlFor="active" className="font-normal cursor-pointer">
                  Method is active and visible to users
                </Label>
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={createMethod.isPending || updateMethod.isPending}>
              {createMethod.isPending || updateMethod.isPending ? "Saving..." : "Save Method"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Method?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the payment method. Users will no longer be able to deposit using this address.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteMethod.isPending ? "Deleting..." : "Delete Method"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

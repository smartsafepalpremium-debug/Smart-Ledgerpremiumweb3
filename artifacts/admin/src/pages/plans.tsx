import { useState } from "react";
import { 
  useListPlans, 
  useCreatePlan, 
  useUpdatePlan, 
  useDeletePlan,
  getListPlansQueryKey 
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

export default function Plans() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: plans, isLoading } = useListPlans();
  
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();

  const handleOpenCreate = () => {
    setFormData({
      name: "",
      minAmount: 100,
      maxAmount: 1000,
      roiPercent: 5,
      durationDays: 7,
      description: "",
      active: true
    });
    setIsEditing(false);
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (plan: any) => {
    setFormData({
      id: plan.id,
      name: plan.name,
      minAmount: plan.minAmount,
      maxAmount: plan.maxAmount,
      roiPercent: plan.roiPercent,
      durationDays: plan.durationDays,
      description: plan.description || "",
      active: plan.active
    });
    setIsEditing(true);
    setIsSheetOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      name: formData.name,
      minAmount: Number(formData.minAmount),
      maxAmount: Number(formData.maxAmount),
      roiPercent: Number(formData.roiPercent),
      durationDays: Number(formData.durationDays),
      description: formData.description,
      active: formData.active
    };

    if (isEditing) {
      updatePlan.mutate({ id: formData.id, data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPlansQueryKey() });
          toast({ title: "Plan updated successfully" });
          setIsSheetOpen(false);
        }
      });
    } else {
      createPlan.mutate({ data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPlansQueryKey() });
          toast({ title: "Plan created successfully" });
          setIsSheetOpen(false);
        }
      });
    }
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    deletePlan.mutate({ id: deleteConfirm }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPlansQueryKey() });
        toast({ title: "Plan deleted" });
        setDeleteConfirm(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Investment Plans</h1>
          <p className="text-muted-foreground mt-1">Configure automated yield packages for users.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" /> New Plan
        </Button>
      </div>

      <div className="border border-border rounded-lg bg-card/50 backdrop-blur overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Plan Name</TableHead>
              <TableHead>Range (USD)</TableHead>
              <TableHead>ROI / Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading plans...</TableCell>
              </TableRow>
            ) : !plans || plans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No plans configured.</TableCell>
              </TableRow>
            ) : (
              plans.map((plan) => (
                <TableRow key={plan.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="font-bold text-foreground">{plan.name}</div>
                    <div className="text-xs text-muted-foreground max-w-[200px] truncate">{plan.description}</div>
                  </TableCell>
                  <TableCell className="font-mono">
                    ${Number(plan.minAmount).toLocaleString()} - ${Number(plan.maxAmount).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-success">{plan.roiPercent}%</div>
                    <div className="text-xs text-muted-foreground">in {plan.durationDays} days</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={plan.active ? "default" : "secondary"}>
                      {plan.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(plan)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(plan.id)}>
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
            <SheetTitle>{isEditing ? "Edit Plan" : "Create Plan"}</SheetTitle>
            <SheetDescription>
              Configure plan parameters.
            </SheetDescription>
          </SheetHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input 
                  id="name" 
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minAmount">Min Amount ($)</Label>
                  <Input 
                    id="minAmount" 
                    type="number" 
                    required
                    value={formData.minAmount || ''}
                    onChange={(e) => setFormData({...formData, minAmount: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAmount">Max Amount ($)</Label>
                  <Input 
                    id="maxAmount" 
                    type="number" 
                    required
                    value={formData.maxAmount || ''}
                    onChange={(e) => setFormData({...formData, maxAmount: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roiPercent">ROI (%)</Label>
                  <Input 
                    id="roiPercent" 
                    type="number" 
                    step="0.1"
                    required
                    value={formData.roiPercent || ''}
                    onChange={(e) => setFormData({...formData, roiPercent: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durationDays">Duration (Days)</Label>
                  <Input 
                    id="durationDays" 
                    type="number" 
                    required
                    value={formData.durationDays || ''}
                    onChange={(e) => setFormData({...formData, durationDays: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  className="resize-none"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="active" 
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({...formData, active: !!checked})}
                />
                <Label htmlFor="active" className="font-normal cursor-pointer">
                  Plan is currently active and available to users
                </Label>
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={createPlan.isPending || updatePlan.isPending}>
              {createPlan.isPending || updatePlan.isPending ? "Saving..." : "Save Plan"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the plan from the system. Users currently subscribed to this plan will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deletePlan.isPending ? "Deleting..." : "Delete Plan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

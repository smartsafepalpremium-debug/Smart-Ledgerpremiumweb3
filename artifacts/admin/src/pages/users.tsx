import { useState } from "react";
import { 
  useListUsers, 
  useUpdateUser, 
  useDeleteUser, 
  useSuspendUser,
  getListUsersQueryKey 
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
import { Search, MoreVertical, Edit2, ShieldAlert, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export default function Users() {
  const [search, setSearch] = useState("");
  const [page] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data, isLoading } = useListUsers({ search, page });
  
  const updateUser = useUpdateUser();
  const suspendUser = useSuspendUser();
  const deleteUser = useDeleteUser();

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setIsSheetOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    updateUser.mutate({
      id: selectedUser.id,
      data: {
        balance: Number(selectedUser.balance),
        profit: Number(selectedUser.profit),
        status: selectedUser.status
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey({ search, page }) });
        toast({ title: "User updated successfully" });
        setIsSheetOpen(false);
      }
    });
  };

  const handleSuspend = (id: number, currentStatus: string) => {
    const isSuspended = currentStatus === "suspended";
    suspendUser.mutate({
      id,
      data: { suspended: !isSuspended, reason: "Admin action" }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey({ search, page }) });
        toast({ title: isSuspended ? "User unsuspended" : "User suspended" });
      }
    });
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    deleteUser.mutate({ id: deleteConfirm }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey({ search, page }) });
        toast({ title: "User deleted" });
        setDeleteConfirm(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage accounts, balances, and security statuses.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search users..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-[250px] bg-card/50"
            />
          </div>
        </div>
      </div>

      <div className="border border-border rounded-lg bg-card/50 backdrop-blur overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>User</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Profit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading users...</TableCell>
              </TableRow>
            ) : data?.users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No users found.</TableCell>
              </TableRow>
            ) : (
              data?.users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => handleEdit(user)}>
                  <TableCell>
                    <div className="font-medium">{user.firstName} {user.lastName}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </TableCell>
                  <TableCell className="font-mono text-primary">${Number(user.balance).toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-success">+${Number(user.profit).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "default" : "destructive"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(user.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(user)}>
                          <Edit2 className="h-4 w-4 mr-2" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSuspend(user.id, user.status)}>
                          <ShieldAlert className="h-4 w-4 mr-2" /> 
                          {user.status === "suspended" ? "Unsuspend" : "Suspend"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteConfirm(user.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="bg-card border-l-border">
          <SheetHeader>
            <SheetTitle>Edit User Profile</SheetTitle>
            <SheetDescription>
              Modify financial data and account status.
            </SheetDescription>
          </SheetHeader>
          
          {selectedUser && (
            <form onSubmit={handleUpdate} className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-xs uppercase text-muted-foreground">User</Label>
                  <div className="font-medium mt-1">{selectedUser.firstName} {selectedUser.lastName}</div>
                  <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="balance">Balance (USD)</Label>
                  <Input 
                    id="balance" 
                    type="number" 
                    step="0.01"
                    value={selectedUser.balance}
                    onChange={(e) => setSelectedUser({...selectedUser, balance: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="profit">Profit (USD)</Label>
                  <Input 
                    id="profit" 
                    type="number" 
                    step="0.01"
                    value={selectedUser.profit}
                    onChange={(e) => setSelectedUser({...selectedUser, profit: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select 
                    id="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedUser.status}
                    onChange={(e) => setSelectedUser({...selectedUser, status: e.target.value})}
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={updateUser.isPending}>
                {updateUser.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              account and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteUser.isPending ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

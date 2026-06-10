import { useState } from "react";
import { 
  useListUsers, 
  useUpdateUser, 
  useDeleteUser, 
  useSuspendUser,
  useCreateUser,
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
import { Search, MoreVertical, Edit2, ShieldAlert, Trash2, Plus, ChevronLeft, ChevronRight, UserPlus } from "lucide-react";
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

const LIMIT = 20;

type SheetMode = "edit" | "create" | null;

export default function Users() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [createForm, setCreateForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    phone: "", country: "", balance: "0", profit: "0"
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data, isLoading } = useListUsers({ search: search || undefined, page, limit: LIMIT });
  
  const updateUser = useUpdateUser();
  const suspendUser = useSuspendUser();
  const deleteUser = useDeleteUser();
  const createUser = useCreateUser();

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;

  const handleEdit = (user: any) => {
    setSelectedUser({ ...user });
    setSheetMode("edit");
  };

  const handleOpenCreate = () => {
    setCreateForm({ firstName: "", lastName: "", email: "", password: "", phone: "", country: "", balance: "0", profit: "0" });
    setSheetMode("create");
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    updateUser.mutate({
      id: selectedUser.id,
      data: {
        balance: Number(selectedUser.balance),
        profit: Number(selectedUser.profit),
        status: selectedUser.status,
        firstName: selectedUser.firstName,
        lastName: selectedUser.lastName,
        phone: selectedUser.phone,
        country: selectedUser.country,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey({ search: search || undefined, page, limit: LIMIT }) });
        toast({ title: "User updated successfully" });
        setSheetMode(null);
      },
      onError: () => {
        toast({ title: "Failed to update user", variant: "destructive" });
      }
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createUser.mutate({
      data: {
        firstName: createForm.firstName,
        lastName: createForm.lastName,
        email: createForm.email,
        password: createForm.password,
        phone: createForm.phone || undefined,
        country: createForm.country || undefined,
        balance: Number(createForm.balance),
        profit: Number(createForm.profit),
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey({ search: search || undefined, page, limit: LIMIT }) });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
        toast({ title: "User created successfully" });
        setSheetMode(null);
      },
      onError: () => {
        toast({ title: "Failed to create user", variant: "destructive" });
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
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey({ search: search || undefined, page, limit: LIMIT }) });
        toast({ title: isSuspended ? "User unsuspended" : "User suspended" });
      }
    });
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    deleteUser.mutate({ id: deleteConfirm }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey({ search: search || undefined, page, limit: LIMIT }) });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
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
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 w-[220px] bg-card/50"
            />
          </div>
          <Button onClick={handleOpenCreate} className="bg-primary text-primary-foreground">
            <UserPlus className="h-4 w-4 mr-2" /> New User
          </Button>
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

      {/* Pagination */}
      {data && data.total > LIMIT && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, data.total)} of {data.total} users
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

      {/* Edit Sheet */}
      <Sheet open={sheetMode === "edit"} onOpenChange={(o) => !o && setSheetMode(null)}>
        <SheetContent className="bg-card border-l-border overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit User Profile</SheetTitle>
            <SheetDescription>Modify financial data and account status.</SheetDescription>
          </SheetHeader>
          
          {selectedUser && (
            <form onSubmit={handleUpdate} className="space-y-5 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={selectedUser.firstName}
                    onChange={(e) => setSelectedUser({...selectedUser, firstName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={selectedUser.lastName}
                    onChange={(e) => setSelectedUser({...selectedUser, lastName: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground">Email</Label>
                <div className="font-mono text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-md">{selectedUser.email}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={selectedUser.phone || ""}
                    onChange={(e) => setSelectedUser({...selectedUser, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value={selectedUser.country || ""}
                    onChange={(e) => setSelectedUser({...selectedUser, country: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="balance">Balance (USD)</Label>
                <Input id="balance" type="number" step="0.01"
                  value={selectedUser.balance}
                  onChange={(e) => setSelectedUser({...selectedUser, balance: e.target.value})} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="profit">Total Profit (USD)</Label>
                <Input id="profit" type="number" step="0.01"
                  value={selectedUser.profit}
                  onChange={(e) => setSelectedUser({...selectedUser, profit: e.target.value})} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Account Status</Label>
                <select 
                  id="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedUser.status}
                  onChange={(e) => setSelectedUser({...selectedUser, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              
              <Button type="submit" className="w-full" disabled={updateUser.isPending}>
                {updateUser.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          )}
        </SheetContent>
      </Sheet>

      {/* Create Sheet */}
      <Sheet open={sheetMode === "create"} onOpenChange={(o) => !o && setSheetMode(null)}>
        <SheetContent className="bg-card border-l-border overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create New User</SheetTitle>
            <SheetDescription>Manually create a user account and set initial balance.</SheetDescription>
          </SheetHeader>
          
          <form onSubmit={handleCreate} className="space-y-5 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="c-firstName">First Name</Label>
                <Input id="c-firstName" required value={createForm.firstName}
                  onChange={(e) => setCreateForm({...createForm, firstName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-lastName">Last Name</Label>
                <Input id="c-lastName" required value={createForm.lastName}
                  onChange={(e) => setCreateForm({...createForm, lastName: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-email">Email Address</Label>
              <Input id="c-email" type="email" required value={createForm.email}
                onChange={(e) => setCreateForm({...createForm, email: e.target.value})} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-password">Password</Label>
              <Input id="c-password" type="password" required value={createForm.password}
                onChange={(e) => setCreateForm({...createForm, password: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="c-phone">Phone (optional)</Label>
                <Input id="c-phone" value={createForm.phone}
                  onChange={(e) => setCreateForm({...createForm, phone: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-country">Country (optional)</Label>
                <Input id="c-country" value={createForm.country}
                  onChange={(e) => setCreateForm({...createForm, country: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="c-balance">Initial Balance (USD)</Label>
                <Input id="c-balance" type="number" step="0.01" value={createForm.balance}
                  onChange={(e) => setCreateForm({...createForm, balance: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-profit">Initial Profit (USD)</Label>
                <Input id="c-profit" type="number" step="0.01" value={createForm.profit}
                  onChange={(e) => setCreateForm({...createForm, profit: e.target.value})} />
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={createUser.isPending}>
              {createUser.isPending ? "Creating..." : "Create User"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account and all their data.
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

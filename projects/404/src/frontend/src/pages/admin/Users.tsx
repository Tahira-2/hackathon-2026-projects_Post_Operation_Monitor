import { useState } from "react";
import { Plus, Search, MoreHorizontal, Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "@/apis/usersApi";
import { useGetSpecializationsQuery, useCreateSpecializationMutation } from "@/apis/specializationsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

export function Users() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PATIENT");
  const [doctorSpecializationId, setDoctorSpecializationId] = useState("");
  
  // Create New Specialization state
  const [isCreatingSpecialization, setIsCreatingSpecialization] = useState(false);
  const [newSpecializationName, setNewSpecializationName] = useState("");

  const { data, isLoading } = useGetUsersQuery({
    page,
    pageSize: 10,
    email: search,
    role: roleFilter || undefined,
  });

  const { data: specData, isLoading: isLoadingSpecs } = useGetSpecializationsQuery({});
  const specializations = specData?.data || [];

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [createSpecialization] = useCreateSpecializationMutation();

  const users = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, lastPage: 1 };

  const handleOpenNew = () => {
    setEditingId(null);
    setFullName("");
    setEmail("");
    setPassword("");
    setRole("PATIENT");
    setDoctorSpecializationId("");
    setIsCreatingSpecialization(false);
    setNewSpecializationName("");
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (user: any) => {
    setEditingId(user.id);
    setFullName(user.fullName || "");
    setEmail(user.email);
    setPassword(""); 
    setRole(user.role);
    setDoctorSpecializationId(user.doctor?.specializationId || "");
    setIsCreatingSpecialization(false);
    setNewSpecializationName("");
    setIsSheetOpen(true);
  };

  const handleDelete = async () => {
    if (deletingId) {
      try {
        await deleteUser(deletingId).unwrap();
        toast.success("User deleted securely.");
      } catch (e) {
        toast.error("Failed to delete user. There may be references strictly attached to them.");
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleSave = async () => {
    try {
      let finalSpecializationId = doctorSpecializationId;

      // Handle custom specialization creation flow
      if (role === "DOCTOR" && isCreatingSpecialization && newSpecializationName.trim()) {
        const customSpec = await createSpecialization({ name: newSpecializationName.trim() }).unwrap();
        finalSpecializationId = customSpec.id;
      }

      const payload: any = {
        fullName,
        email,
        role,
      };

      if (!editingId || password) {
        payload.password = password;
      }

      if (role === "DOCTOR") {
        if (!finalSpecializationId) {
          toast.error("Doctors require a specialization mapping.");
          return;
        }
        payload.specializationId = finalSpecializationId;
      }

      if (editingId) {
        await updateUser({ id: editingId, body: payload }).unwrap();
        toast.success("User successfully updated.");
      } else {
        if (!password) {
          toast.error("Password is required for new users.");
          return;
        }
        await createUser(payload).unwrap();
        toast.success("User successfully created.");
      }
      setIsSheetOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to save user. Please verify the email forms.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Accounts</h2>
        <p className="text-muted-foreground">Manage identity access, assign roles, and handle tenant mapping.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 flex-wrap items-start md:items-center justify-between">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email..."
              className="pl-9 bg-card"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="w-[150px]">
            <Select 
              value={roleFilter} 
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              options={[
                { label: "All Roles", value: "" },
                { label: "Patient", value: "PATIENT" },
                { label: "Doctor", value: "DOCTOR" },
                { label: "Admin", value: "ADMIN" }
              ]}
            />
          </div>
        </div>
        <Button onClick={handleOpenNew} className="shrink-0 gap-2">
          <Plus className="h-4 w-4" /> Add User Account
        </Button>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email Address</TableHead>
              <TableHead>Role Configuration</TableHead>
              <TableHead>Profile Details</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Retrieving directory...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No accounts located.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'DOCTOR' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    <div className="flex flex-col gap-0.5">
                      {user.fullName ? (
                        <span className="font-medium text-foreground">{user.fullName}</span>
                      ) : (
                        <span className="text-xs italic">No name active</span>
                      )}
                      {user.role === 'DOCTOR' && (
                         user.doctor && user.doctor.specialization ? (
                            <span className="flex items-center gap-1.5 text-xs text-primary mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                              {user.doctor.specialization.name}
                            </span>
                         ) : (
                            <span className="text-destructive font-semibold text-[10px] uppercase mt-0.5">Missing Specialization</span>
                         )
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEdit(user)} className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" /> Edit Attributes
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingId(user.id)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" /> Delete
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

      <Pagination
        currentPage={page}
        totalPages={meta.lastPage}
        totalResults={meta.total}
        itemsPerPage={10}
        onPageChange={setPage}
      />

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetHeader>
          <SheetTitle>{editingId ? "Update Account Data" : "Provision New Identity"}</SheetTitle>
          <SheetDescription>
            {editingId ? "Modify roles and security parameters for an active user." : "Assign an email, role, and strictly bind identities."}
          </SheetDescription>
          <SheetClose onClick={() => setIsSheetOpen(false)} />
        </SheetHeader>

        <SheetContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">
                {editingId ? "New Password" : "Password"}{" "}
                {!editingId && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={editingId ? "Leave blank to keep unchanged" : "Secure access key"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Access Role <span className="text-destructive">*</span></Label>
              <Select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                options={[
                  { label: "Patient", value: "PATIENT" },
                  { label: "Physician", value: "DOCTOR" },
                  { label: "System Administrator", value: "ADMIN" }
                ]}
              />
            </div>

            {role === "DOCTOR" && (
              <div className="grid gap-3 bg-muted/30 border p-4 rounded-xl mt-2 animate-in fade-in zoom-in-95 duration-200">
                 <div className="flex flex-col gap-2">
                    <Label className="flex items-center gap-2 mb-1">
                      Doctor Specialization <span className="text-destructive">*</span>
                    </Label>
                    
                    {!isCreatingSpecialization ? (
                      <div className="flex flex-col gap-3">
                        {isLoadingSpecs ? (
                          <div className="text-sm text-muted-foreground animate-pulse">Loading specializations catalog...</div>
                        ) : (
                          <Select
                            value={doctorSpecializationId}
                            onChange={(e) => setDoctorSpecializationId(e.target.value)}
                            options={[
                              { label: "Select a Specialization", value: "" },
                              ...specializations.map((spec: any) => ({
                                label: spec.name,
                                value: spec.id
                              }))
                            ]}
                          />
                        )}
                        <button 
                          className="text-xs text-primary font-medium text-left hover:underline self-start"
                          onClick={() => setIsCreatingSpecialization(true)}
                        >
                          + Create a new specialization instead
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <Input 
                          placeholder="Type new specialization name..." 
                          value={newSpecializationName}
                          onChange={e => setNewSpecializationName(e.target.value)}
                        />
                        <button 
                          className="text-xs text-muted-foreground hover:text-foreground font-medium text-left hover:underline self-start"
                          onClick={() => setIsCreatingSpecialization(false)}
                        >
                          Cancel, select existing
                        </button>
                      </div>
                    )}
                 </div>
              </div>
            )}
          </div>
        </SheetContent>
        <SheetFooter>
          <Button onClick={handleSave} disabled={isCreating || isUpdating || !email || !fullName} className="w-full">
            {isCreating || isUpdating ? "Processing..." : editingId ? "Save Changes" : "Save"}
          </Button>
          <Button variant="outline" onClick={() => setIsSheetOpen(false)} className="w-full">
            Cancel
          </Button>
        </SheetFooter>
      </Sheet>

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account and revoke all access immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

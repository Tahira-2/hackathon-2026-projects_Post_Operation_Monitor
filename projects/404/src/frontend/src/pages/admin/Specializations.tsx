import { useState } from "react";
import { Plus, Search, MoreHorizontal, Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import {
  useGetSpecializationsQuery,
  useCreateSpecializationMutation,
  useUpdateSpecializationMutation,
  useDeleteSpecializationMutation,
} from "@/apis/specializationsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
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

export function Specializations() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data, isLoading } = useGetSpecializationsQuery({
    page,
    pageSize: 10,
    name: search,
  });

  const [createSpecialization, { isLoading: isCreating }] = useCreateSpecializationMutation();
  const [updateSpecialization, { isLoading: isUpdating }] = useUpdateSpecializationMutation();
  const [deleteSpecialization] = useDeleteSpecializationMutation();

  const specializations = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, lastPage: 1 };

  const handleOpenNew = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (spec: any) => {
    setEditingId(spec.id);
    setName(spec.name);
    setDescription(spec.description || "");
    setIsSheetOpen(true);
  };

  const handleDelete = async () => {
    if (deletingId) {
      try {
        await deleteSpecialization(deletingId).unwrap();
        toast.success("Specialization deleted securely.");
      } catch (e) {
        toast.error("Failed to delete specialization. It might be assigned to doctors.");
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateSpecialization({ id: editingId, body: { name, description } }).unwrap();
        toast.success("Specialization updated.")
      } else {
        await createSpecialization({ name, description }).unwrap();
        toast.success("Specialization created.")
      }
      setIsSheetOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save. Ensure the name is unique.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Specializations</h2>
        <p className="text-muted-foreground">Manage and assign medical specializations across the hospital.</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search specializations..."
            className="pl-9 bg-card"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Button onClick={handleOpenNew} className="shrink-0 gap-2">
          <Plus className="h-4 w-4" /> Add Specialization
        </Button>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-[60%]">Description</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  Loading specializations...
                </TableCell>
              </TableRow>
            ) : specializations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  No specializations found.
                </TableCell>
              </TableRow>
            ) : (
              specializations.map((spec: any) => (
                <TableRow key={spec.id}>
                  <TableCell className="font-medium text-foreground">{spec.name}</TableCell>
                  <TableCell className="text-muted-foreground truncate max-w-sm">
                    {spec.description || "No description provided"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEdit(spec)} className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingId(spec.id)}
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
          <SheetTitle>{editingId ? "Edit Specialization" : "Add Specialization"}</SheetTitle>
          <SheetDescription>
            {editingId ? "Modify the details of an existing medical specialization." : "Create a new specialization category for doctors to use."}
          </SheetDescription>
          <SheetClose onClick={() => setIsSheetOpen(false)} />
        </SheetHeader>
        <SheetContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Specialization Name <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                placeholder="e.g. Cardiology"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Describe what this specialization covers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </SheetContent>
        <SheetFooter>
          <Button onClick={handleSave} disabled={isCreating || isUpdating || !name}>
            {isCreating || isUpdating ? "Saving..." : editingId ? "Save Changes" : "Add Specialization"}
          </Button>
          <Button variant="outline" onClick={() => setIsSheetOpen(false)}>
            Cancel
          </Button>
        </SheetFooter>
      </Sheet>

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the specialization from the catalog.
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

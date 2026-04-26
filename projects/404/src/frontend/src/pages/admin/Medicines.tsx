import { useState } from "react";
import { Plus, Search, MoreHorizontal, Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import {
  useGetMedicinesQuery,
  useCreateMedicineMutation,
  useUpdateMedicineMutation,
  useDeleteMedicineMutation,
} from "@/apis/medicineApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
import { ImageUploader } from "@/components/ui/image-uploader";
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

const FORMS = ["TABLET", "CAPSULE", "SYRUP", "INJECTION", "CREAM", "OINTMENT", "DROPS", "INHALER", "POWDER"];
const CATEGORIES = ["PRESCRIPTION", "OTC", "CONTROLLED", "SUPPLEMENT"];

export function Medicines() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [rxnormCode, setRxnormCode] = useState("");
  const [drugClass, setDrugClass] = useState("");
  const [category, setCategory] = useState("PRESCRIPTION");
  const [form, setForm] = useState("TABLET");
  const [description, setDescription] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const { data, isLoading } = useGetMedicinesQuery({
    page,
    pageSize: 10,
    search,
    category: categoryFilter || undefined,
  });

  const [createMedicine, { isLoading: isCreating }] = useCreateMedicineMutation();
  const [updateMedicine, { isLoading: isUpdating }] = useUpdateMedicineMutation();
  const [deleteMedicine] = useDeleteMedicineMutation();

  const medicines = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, lastPage: 1 };

  const handleOpenNew = () => {
    setEditingId(null);
    setName("");
    setRxnormCode("");
    setDrugClass("");
    setCategory("PRESCRIPTION");
    setForm("TABLET");
    setDescription("");
    setManufacturer("");
    setImageUrl("");
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (medicine: any) => {
    setEditingId(medicine.id);
    setName(medicine.name);
    setRxnormCode(medicine.rxnormCode || "");
    setDrugClass(medicine.drugClass || "");
    setCategory(medicine.category || "PRESCRIPTION");
    setForm(medicine.form || "TABLET");
    setDescription(medicine.description || "");
    setManufacturer(medicine.manufacturer || "");
    setImageUrl(medicine.imageUrl || "");
    setIsSheetOpen(true);
  };

  const handleDelete = async () => {
    if (deletingId) {
      try {
        await deleteMedicine(deletingId).unwrap();
        toast.success("Medicine deleted securely.");
      } catch (e) {
        toast.error("Failed to delete medicine item.");
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        name,
        rxnormCode,
        drugClass,
        category,
        form,
        description,
        manufacturer,
        imageUrl,
      };

      if (editingId) {
        await updateMedicine({ id: editingId, body: payload }).unwrap();
        toast.success("Medicine updated.");
      } else {
        await createMedicine(payload).unwrap();
        toast.success("Medicine created.");
      }
      setIsSheetOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save. Please review the form inputs.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Medicines</h2>
        <p className="text-muted-foreground">Manage the active drug catalog for prescriptions and treatments.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-1 items-center gap-4 w-full md:w-auto">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or code..."
              className="pl-9 bg-card"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="w-[200px]">
             <Select 
               value={categoryFilter} 
               onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
               options={[
                  { label: "All Categories", value: "" },
                  { label: "Prescription", value: "PRESCRIPTION" },
                  { label: "OTC", value: "OTC" },
                  { label: "Controlled", value: "CONTROLLED" },
                  { label: "Supplement", value: "SUPPLEMENT" }
               ]}
              />
          </div>
        </div>
        <Button onClick={handleOpenNew} className="shrink-0 gap-2">
          <Plus className="h-4 w-4" /> Add Medicine
        </Button>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Medicine Info</TableHead>
              <TableHead>Classification</TableHead>
              <TableHead>Manufacturer</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Loading medicines...
                </TableCell>
              </TableRow>
            ) : medicines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No medicines found.
                </TableCell>
              </TableRow>
            ) : (
              medicines.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-md object-cover border" />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">N/A</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold cursor-pointer text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.rxnormCode ? `RxNorm: ${item.rxnormCode}` : "No Code"}</p>
                  </TableCell>
                  <TableCell>
                     <div className="flex flex-col items-start gap-1">
                       <Badge variant="outline">{item.form}</Badge>
                       <Badge variant={item.category === "PRESCRIPTION" ? "default" : item.category === "CONTROLLED" ? "destructive" : "secondary"}>
                         {item.category}
                       </Badge>
                     </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {item.manufacturer || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEdit(item)} className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingId(item.id)}
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
          <SheetTitle>{editingId ? "Edit Medicine" : "Add Medicine"}</SheetTitle>
          <SheetDescription>
            {editingId ? "Update records regarding an existing medicine." : "Register a brand new medical drug to the generic catalog."}
          </SheetDescription>
          <SheetClose onClick={() => setIsSheetOpen(false)} />
        </SheetHeader>
        <SheetContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Medicine Image Tracker</Label>
              <ImageUploader value={imageUrl} onChange={setImageUrl} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">System Name <span className="text-destructive">*</span></Label>
              <Input id="name" placeholder="eg. Amoxicillin" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="rxnorm">RxNorm Code</Label>
              <Input id="rxnorm" placeholder="eg. 12920" value={rxnormCode} onChange={(e) => setRxnormCode(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label>Category <span className="text-destructive">*</span></Label>
              <Select value={category} onChange={(e) => setCategory(e.target.value)} options={CATEGORIES.map(c => ({ label: c, value: c }))} />
            </div>

            <div className="grid gap-2">
              <Label>Form Factor <span className="text-destructive">*</span></Label>
              <Select value={form} onChange={(e) => setForm(e.target.value)} options={FORMS.map(c => ({ label: c, value: c }))} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="drugclass">Drug Class</Label>
              <Input id="drugclass" placeholder="eg. Penicillin Antibiotic" value={drugClass} onChange={(e) => setDrugClass(e.target.value)} />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input id="manufacturer" placeholder="eg. Pfizer" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description Details</Label>
              <Input id="description" placeholder="Short medical description..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
        </SheetContent>
        <SheetFooter>
          <Button onClick={handleSave} disabled={isCreating || isUpdating || !name} className="w-full">
            {isCreating || isUpdating ? "Saving..." : editingId ? "Save Changes" : "Add Medicine"}
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
              This action cannot be undone. This will permanently delete the medicine from the catalog.
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

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Edit, Loader } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useServiceCategory } from "@/hooks/village/useService";
import { CreateUpdateCategory, DeleteCategory, ServiceCategory } from "@/services/village-service-category";
import { useMutation } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const INITIAL_FORM_DATA = {
  name: "",
  displayOrder: 0,
  isActive: "1",
};

const CreateServiceCategoryModel = ({ editingCategory, handleAction }: { editingCategory: ServiceCategory | null; handleAction: (type: "Success") => void }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const { mutateAsync, isPending } = useMutation({
    mutationFn: CreateUpdateCategory
  })
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    mutateAsync({
      ...formData,
      isActive: formData.isActive === "1" ? true : false,
      id: editingCategory ? editingCategory.id : undefined,
    }, {
      onSuccess: () => {
        toast.success(`Category ${editingCategory ? "updated" : "added"} successfully!`);
        setIsDialogOpen(false);
        setFormData(INITIAL_FORM_DATA);
        handleAction("Success");
      },
      onError: (error: any) => {
        toast.error(error.message || `Failed to ${editingCategory ? "update" : "add"} category`);
        console.error(error);
      }
    })
  };

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        displayOrder: editingCategory.displayOrder,
        isActive: editingCategory.isActive ? "1" : "0",
      });
      setIsDialogOpen(true);
    }
  }, [editingCategory]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => {
            setFormData(INITIAL_FORM_DATA);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingCategory ? "Edit Category" : "Add New Category"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter category name"
              required
            />
          </div>
          <div>
            <Label htmlFor="order">Display Order</Label>
            <Input
              id="order"
              type="number"
              value={formData.displayOrder}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  displayOrder: parseInt(e.target.value),
                })
              }
              placeholder="0"
            />
          </div>
          <div>
            <Select onValueChange={(value) => {
              setFormData({ ...formData, isActive: value })
            }} value={formData.isActive}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>

                <SelectItem value={"1"}>
                  Active
                </SelectItem>
                <SelectItem value={"0"}>
                  Inactive
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending
              ? "Saving..."
              : editingCategory
                ? "Update Category"
                : "Add Category"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const CategoryListItem = ({ category, handleEdit, refetch }: { category: ServiceCategory; handleEdit: (type: "toggle" | "edit") => void, refetch: () => void }) => {
  const { mutateAsync: mutateDeleteAsync, isPending: isDeletePending } = useMutation({
    mutationFn: DeleteCategory
  })

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    mutateDeleteAsync(id, {
      onSuccess: () => {
        toast.success("Category deleted successfully!");
        refetch()
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete category");
      }

    })
  };

  return (
    <TableRow key={category.id}>
      <TableCell className="font-medium">
        {category.name}
      </TableCell>
      <TableCell>{category.displayOrder}</TableCell>
      <TableCell>
        <Button
          variant={category.isActive ? "default" : "secondary"}
          size="sm"
          onClick={() =>
            handleEdit("toggle")
          }
          disabled
        >
          {category.isActive ? "Active" : "Inactive"}
        </Button>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit("edit")}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={isDeletePending}
            onClick={() => handleDelete(category.id)}
          >
            {isDeletePending ? <Loader /> : <Trash2 className="h-4 w-4 text-destructive" />}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

const ManageCategories = () => {
  const navigate = useNavigate();
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const { data: categoriesData, isLoading, refetch } = useServiceCategory();

  const handleEdit = (category: ServiceCategory) => {
    setEditingCategory(category);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="bg-card rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Manage Service Categories</h1>
            <CreateServiceCategoryModel editingCategory={editingCategory}
              handleAction={(type) => {
                if (type === "Success") {
                  refetch()
                }
                setEditingCategory(null);
              }}
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Display Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : !!categoriesData.length ?(
                categoriesData.map((category) => (
                  <CategoryListItem key={category.id}
                    category={{ ...category }}
                    handleEdit={(type) => {
                      handleEdit({
                        ...category,
                        isActive: type === "toggle" ? !category.isActive : category.isActive
                      })
                    }}
                    refetch={refetch}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No categories found. Please add a category.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ManageCategories;

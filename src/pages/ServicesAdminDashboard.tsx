import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { ArrowLeft, Loader, Pencil, Trash2 } from "lucide-react";
import { useServices } from "@/hooks/village/useService";
import { VILLAGES } from "@/config/villageConfig";
import { DeleteService, IService } from "@/services/village-service-category";
import { CUSTOM_ROUTES } from "@/custom-routes";
import { useMutation } from "@tanstack/react-query";


const ServiceTableItem = ({ service, refetch }: { service: IService; refetch: () => void }) => {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: DeleteService
  })

  const handleEdit = (service: IService) => {
    navigate(`${CUSTOM_ROUTES.ADD_SERVICE}?serviceId=${service.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    mutateAsync(id, {
      onSuccess: (res) => {
        if (res.success) {
          toast.success("Service deleted successfully");
          refetch()
        } else {
          toast.error("Failed to delete service");
        }
      },
      onError: (error) => {
        toast.error("Failed to delete service");
      }
    })
  };


  return (
    <TableRow key={service.id}>
      <TableCell className="font-medium">
        {service.name}
      </TableCell>
      <TableCell>{service.category}</TableCell>
      <TableCell>{service.owner || "-"}</TableCell>
      <TableCell>{service.contact || "-"}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(service)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={() => handleDelete(service.id)}
          >
            {isPending ? <Loader /> : <Trash2 className="h-4 w-4 text-destructive" />}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

const ServicesAdminDashboard = () => {
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    refetch
  } = useServices({
    villageId: VILLAGES.shivankhed.id,
    page: 0,
    limit: 20,
    sortOrder: "asc",
  });

  const { services = [] } = data || {};



  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
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
            <h1 className="text-3xl font-bold">Services Management</h1>
            <Button onClick={() => navigate(CUSTOM_ROUTES.ADD_SERVICE)}>
              Add New Service
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Loading services...
                    </TableCell>
                  </TableRow>
                ) : services.length > 0 ? (
                  services.map((service) => (
                    <ServiceTableItem key={service.id} service={service} refetch={refetch} />
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No services available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesAdminDashboard;

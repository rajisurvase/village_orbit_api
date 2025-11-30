import { useEffect, useState } from "react";
import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export const UpdateNotification = () => {
  const { updateAvailable, updateSW } = useServiceWorkerUpdate();
  const [toastId, setToastId] = useState<string | number | undefined>();

  useEffect(() => {
    if (updateAvailable && !toastId) {
      const id = toast.info(
        "New update available — Content has been updated!",
        {
          description: "Refresh to see the latest changes including images, news, and updates.",
          duration: Infinity,
          action: {
            label: (
              <Button 
                size="sm" 
                variant="default"
                className="gap-2"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Now
              </Button>
            ),
            onClick: handleRefresh,
          },
          onDismiss: () => setToastId(undefined),
        }
      );
      setToastId(id);
    }
  }, [updateAvailable, toastId]);

  const handleRefresh = async () => {
    try {
      await updateSW();
      window.location.reload();
    } catch (error) {
      console.error("Error updating:", error);
      window.location.reload();
    }
  };

  return null;
};

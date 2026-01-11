import { useState, useEffect } from "react";
import { CheckCircle2, Loader2, AlertCircle, Cloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutoSaveIndicatorProps {
  status: "idle" | "saving" | "saved" | "error";
  lastSaved?: Date | null;
  className?: string;
}

const AutoSaveIndicator = ({ status, lastSaved, className }: AutoSaveIndicatorProps) => {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (status === "saved") {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("mr-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      {status === "saving" && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <span className="text-blue-600 dark:text-blue-400">सेव्ह होत आहे...</span>
        </>
      )}
      
      {(status === "saved" || showSaved) && (
        <>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-green-600 dark:text-green-400">
            सेव्ह झाले {lastSaved && `(${formatTime(lastSaved)})`}
          </span>
        </>
      )}
      
      {status === "error" && (
        <>
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-red-600 dark:text-red-400">सेव्ह करण्यात त्रुटी</span>
        </>
      )}
      
      {status === "idle" && lastSaved && (
        <>
          <Cloud className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            शेवटचे सेव्ह: {formatTime(lastSaved)}
          </span>
        </>
      )}
    </div>
  );
};

export default AutoSaveIndicator;

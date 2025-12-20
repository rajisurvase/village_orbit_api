import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const PushNotificationToggle = () => {
  const { isSubscribed, isLoading, isSupported, toggleSubscription, permission } = usePushNotifications();

  if (!isSupported) {
    return null;
  }

  const getTooltipText = () => {
    if (permission === "denied") {
      return "ब्राउझर सेटिंग्जमध्ये सूचना अवरोधित आहेत";
    }
    if (isSubscribed) {
      return "Push सूचना बंद करा";
    }
    return "Push सूचना सक्षम करा";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSubscription}
            disabled={isLoading || permission === "denied"}
            className="relative"
            aria-label={isSubscribed ? "Disable notifications" : "Enable notifications"}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isSubscribed ? (
              <Bell className="h-5 w-5 text-primary" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
            {isSubscribed && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

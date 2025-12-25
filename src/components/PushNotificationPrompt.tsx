import { useState, useEffect } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useAuth } from "@/hooks/useAuth";

export const PushNotificationPrompt = () => {
  const { 
    isSupported, 
    permission, 
    isSubscribed, 
    isLoading, 
    subscribe, 
    updateSubscriptionUser 
  } = usePushNotifications();
  const { user } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  // Check if prompt should be shown
  useEffect(() => {
    const dismissed = localStorage.getItem('push-notification-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show prompt after 3 seconds if not subscribed
    const timer = setTimeout(() => {
      if (isSupported && permission === 'default' && !isSubscribed) {
        setShowPrompt(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isSupported, permission, isSubscribed]);

  // Update subscription when user changes
  useEffect(() => {
    if (user && isSubscribed) {
      updateSubscriptionUser();
    }
  }, [user, isSubscribed, updateSubscriptionUser]);

  const handleEnable = async () => {
    const success = await subscribe();
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('push-notification-dismissed', 'true');
    setIsDismissed(true);
    setShowPrompt(false);
  };

  if (!showPrompt || isDismissed || !isSupported || isSubscribed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm animate-in slide-in-from-bottom-4">
      <Card className="border-primary/20 bg-card/95 backdrop-blur-sm shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 p-2 rounded-full bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm">Enable Notifications</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Get notified about new marketplace items and updates
              </p>
              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm" 
                  onClick={handleEnable}
                  disabled={isLoading}
                  className="text-xs"
                >
                  {isLoading ? "Enabling..." : "Enable"}
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={handleDismiss}
                  className="text-xs"
                >
                  Not now
                </Button>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 flex-shrink-0" 
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Settings toggle component for user profile/settings
export const PushNotificationToggle = () => {
  const { 
    isSupported, 
    isSubscribed, 
    isLoading, 
    subscribe, 
    unsubscribe 
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
        <BellOff className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Push notifications not supported
        </span>
      </div>
    );
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-3">
        {isSubscribed ? (
          <Bell className="h-5 w-5 text-primary" />
        ) : (
          <BellOff className="h-5 w-5 text-muted-foreground" />
        )}
        <div>
          <p className="text-sm font-medium">Push Notifications</p>
          <p className="text-xs text-muted-foreground">
            {isSubscribed ? "Enabled" : "Disabled"}
          </p>
        </div>
      </div>
      <Button 
        variant={isSubscribed ? "outline" : "default"}
        size="sm"
        onClick={handleToggle}
        disabled={isLoading}
      >
        {isLoading ? "..." : isSubscribed ? "Disable" : "Enable"}
      </Button>
    </div>
  );
};

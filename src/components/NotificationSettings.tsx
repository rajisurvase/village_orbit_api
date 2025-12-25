import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export const NotificationSettings = () => {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <Card className="border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BellOff className="h-4 w-4" />
            Notifications Not Available
          </CardTitle>
          <CardDescription className="text-sm">
            Push notifications are not supported in this browser.
          </CardDescription>
        </CardHeader>
      </Card>
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {isSubscribed ? (
            <Bell className="h-4 w-4 text-primary" />
          ) : (
            <BellOff className="h-4 w-4 text-muted-foreground" />
          )}
          Push Notifications
        </CardTitle>
        <CardDescription className="text-sm">
          Get notified about new items, approvals, and updates.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="push-toggle" className="flex flex-col gap-1">
                <span>{isSubscribed ? "Notifications Enabled" : "Enable Notifications"}</span>
                <span className="font-normal text-xs text-muted-foreground">
                  {permission === "denied"
                    ? "Blocked in browser settings"
                    : isSubscribed
                    ? "You'll receive marketplace updates"
                    : "Turn on to receive updates"}
                </span>
              </Label>
              <Switch
                id="push-toggle"
                checked={isSubscribed}
                onCheckedChange={handleToggle}
                disabled={permission === "denied"}
              />
            </div>

            {permission === "denied" && (
              <p className="text-xs text-destructive">
                Notifications are blocked. Please enable them in your browser settings.
              </p>
            )}

            {!isSubscribed && permission !== "denied" && (
              <Button
                onClick={subscribe}
                size="sm"
                variant="outline"
                className="w-full"
              >
                <Bell className="h-4 w-4 mr-2" />
                Enable Notifications
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;

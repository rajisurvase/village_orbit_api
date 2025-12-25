import { Bell, BellOff, Loader2, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export const NotificationSettings = () => {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  const [showDebug, setShowDebug] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [swStatus, setSwStatus] = useState<string>("Checking...");

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  };

  useEffect(() => {
    if (showDebug) {
      checkServiceWorkerStatus();
    }
  }, [showDebug]);

  const checkServiceWorkerStatus = async () => {
    addLog("Checking service worker status...");
    
    if (!('serviceWorker' in navigator)) {
      setSwStatus("❌ Service Worker not supported");
      addLog("Service Worker NOT supported in this browser");
      return;
    }

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      addLog(`Found ${registrations.length} service worker(s)`);
      
      registrations.forEach((reg, i) => {
        addLog(`SW ${i + 1}: scope=${reg.scope}, active=${!!reg.active}`);
      });

      // Check for push-specific SW
      const pushReg = registrations.find(r => r.scope.includes('/push/'));
      if (pushReg) {
        setSwStatus(`✅ Push SW Active (scope: ${pushReg.scope})`);
        addLog("Push service worker found!");
        
        // Check subscription
        const sub = await pushReg.pushManager.getSubscription();
        if (sub) {
          addLog(`✅ Push subscription exists: ${sub.endpoint.substring(0, 50)}...`);
        } else {
          addLog("⚠️ No push subscription found");
        }
      } else {
        setSwStatus("⚠️ Push SW not registered");
        addLog("Push service worker NOT found - needs registration");
      }

      // Check Notification API
      addLog(`Notification permission: ${Notification.permission}`);
      addLog(`PushManager available: ${'PushManager' in window}`);

    } catch (err) {
      setSwStatus(`❌ Error: ${err}`);
      addLog(`Error checking SW: ${err}`);
    }
  };

  const testLocalNotification = async () => {
    addLog("Testing local notification...");
    
    if (Notification.permission !== "granted") {
      addLog("Requesting permission...");
      const perm = await Notification.requestPermission();
      addLog(`Permission result: ${perm}`);
      if (perm !== "granted") {
        addLog("❌ Permission denied");
        return;
      }
    }

    try {
      // Try showing notification via service worker
      const registrations = await navigator.serviceWorker.getRegistrations();
      const pushReg = registrations.find(r => r.scope.includes('/push/'));
      
      if (pushReg && pushReg.active) {
        addLog("Showing notification via SW...");
        await pushReg.showNotification("🧪 Test Notification", {
          body: "If you see this, notifications work!",
          icon: "/favicon.ico",
          tag: "test-" + Date.now(),
          requireInteraction: true
        });
        addLog("✅ Notification shown via SW!");
      } else {
        addLog("Showing notification via Notification API...");
        new Notification("🧪 Test Notification", {
          body: "If you see this, notifications work!",
          icon: "/favicon.ico"
        });
        addLog("✅ Notification shown via API!");
      }
    } catch (err) {
      addLog(`❌ Error showing notification: ${err}`);
    }
  };

  const handleToggle = async () => {
    addLog(`Toggle clicked - currently subscribed: ${isSubscribed}`);
    if (isSubscribed) {
      addLog("Unsubscribing...");
      await unsubscribe();
      addLog("Unsubscribe complete");
    } else {
      addLog("Subscribing...");
      await subscribe();
      addLog("Subscribe complete");
    }
    checkServiceWorkerStatus();
  };

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

  return (
    <div className="space-y-4">
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
                  onClick={() => {
                    addLog("Enable button clicked");
                    subscribe();
                  }}
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

      {/* Debug Panel */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Debug Panel
            </CardTitle>
            <Switch
              checked={showDebug}
              onCheckedChange={(checked) => {
                setShowDebug(checked);
                if (checked) addLog("Debug panel opened");
              }}
            />
          </div>
        </CardHeader>
        {showDebug && (
          <CardContent className="space-y-3">
            <div className="text-xs space-y-1 p-2 bg-muted rounded">
              <p><strong>SW Status:</strong> {swStatus}</p>
              <p><strong>Permission:</strong> {permission}</p>
              <p><strong>Subscribed:</strong> {isSubscribed ? "Yes" : "No"}</p>
              <p><strong>Supported:</strong> {isSupported ? "Yes" : "No"}</p>
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={checkServiceWorkerStatus}>
                Refresh Status
              </Button>
              <Button size="sm" variant="outline" onClick={testLocalNotification}>
                Test Notification
              </Button>
            </div>

            <ScrollArea className="h-40 w-full rounded border bg-black/90 p-2">
              <div className="font-mono text-[10px] text-green-400 space-y-0.5">
                {debugLogs.length === 0 ? (
                  <p className="text-muted-foreground">No logs yet...</p>
                ) : (
                  debugLogs.map((log, i) => (
                    <p key={i}>{log}</p>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default NotificationSettings;

import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

interface UpdateInfo {
  updateAvailable: boolean;
  updateSW: () => Promise<void>;
}

export const useServiceWorkerUpdate = (): UpdateInfo => {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      console.log("Service Worker registered:", swUrl);
      
      // Check for updates every 60 seconds
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60000);
      }
    },
    onRegisterError(error) {
      console.error("Service Worker registration error:", error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      setUpdateAvailable(true);
    }
  }, [needRefresh]);

  const updateSW = async () => {
    await updateServiceWorker(true);
  };

  return {
    updateAvailable,
    updateSW,
  };
};

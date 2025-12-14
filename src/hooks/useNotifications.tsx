import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "Not Supported",
        description: "This browser doesn't support notifications",
        variant: "destructive"
      });
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    
    if (result === "granted") {
      toast({
        title: "Notifications Enabled",
        description: "You'll receive exam reminders"
      });
      return true;
    } else {
      toast({
        title: "Notifications Blocked",
        description: "Please enable notifications in browser settings",
        variant: "destructive"
      });
      return false;
    }
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (permission === "granted") {
      new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options
      });
    }
  };

  const subscribeToExamReminders = async (userId: string) => {
    // Subscribe to realtime updates for user's upcoming exams
    const channel = supabase
      .channel('exam-reminders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'exams',
          filter: `status=eq.scheduled`
        },
        (payload) => {
          const exam = payload.new as any;
          const scheduledAt = new Date(exam.scheduled_at);
          const now = new Date();
          const timeUntil = scheduledAt.getTime() - now.getTime();
          const hoursUntil = timeUntil / (1000 * 60 * 60);

          // Show notification if exam is within 24 hours
          if (hoursUntil > 0 && hoursUntil <= 24) {
            const hoursText = hoursUntil < 2 ? 
              `${Math.round(hoursUntil * 60)} minutes` : 
              `${Math.round(hoursUntil)} hours`;
            
            showNotification(
              `Exam Reminder: ${exam.title}`,
              {
                body: `Your ${exam.subject} exam starts in ${hoursText}`,
                tag: exam.id,
                requireInteraction: true
              }
            );
          }
        }
      )
      .subscribe();

    return channel;
  };

  const checkUpcomingExams = async (userId: string) => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    // Get exams scheduled within next 24 hours that user hasn't attempted
    const { data: upcomingExams } = await supabase
      .from('exams')
      .select('*')
      .eq('status', 'scheduled')
      .gte('scheduled_at', now.toISOString())
      .lte('scheduled_at', tomorrow.toISOString());

    if (!upcomingExams) return;

    // Get user's attempts
    const { data: attempts } = await supabase
      .from('exam_attempts')
      .select('exam_id')
      .eq('user_id', userId);

    const attemptedExamIds = new Set(attempts?.map(a => a.exam_id) || []);

    // Check each exam
    upcomingExams.forEach(exam => {
      if (attemptedExamIds.has(exam.id)) return;

      const scheduledAt = new Date(exam.scheduled_at);
      const timeUntil = scheduledAt.getTime() - now.getTime();
      const hoursUntil = timeUntil / (1000 * 60 * 60);

      // Notify if exam is in ~1 hour (within 50-70 minutes)
      if (hoursUntil > 0.8 && hoursUntil <= 1.2) {
        showNotification(
          `⏰ Exam Starting Soon!`,
          {
            body: `${exam.title} (${exam.subject}) starts in 1 hour`,
            tag: `${exam.id}-1h`,
            requireInteraction: true
          }
        );
      }
      // Notify if exam is in ~24 hours (within 23-25 hours)
      else if (hoursUntil > 23 && hoursUntil <= 25) {
        showNotification(
          `📅 Exam Tomorrow`,
          {
            body: `${exam.title} (${exam.subject}) is scheduled for tomorrow`,
            tag: `${exam.id}-24h`
          }
        );
      }
    });
  };

  return {
    permission,
    requestPermission,
    showNotification,
    subscribeToExamReminders,
    checkUpcomingExams
  };
};

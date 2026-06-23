"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { getSocket } from "@/lib/socket";
import { showToast } from "@/lib/toast";
import { Bell, AlertTriangle, CheckCircle2, Info, Zap } from "lucide-react";


export default function NotificationToastListener() {
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user?.id) return;

    const socket = getSocket();

    const handleNotification = (notification) => {
      // Show toast notification with icon based on type
      const getNotificationIcon = (type) => {
        if (type?.includes("COMPLETED") || type?.includes("FINISHED")) {
          return <CheckCircle2 className="text-emerald-500" size={20} />;
        }
        if (type?.includes("ERROR") || type?.includes("FAILED")) {
          return <AlertTriangle className="text-rose-500" size={20} />;
        }
        if (type?.includes("WARNING")) {
          return <AlertTriangle className="text-amber-500" size={20} />;
        }
        if (type?.includes("OVERDUE") || type?.includes("CRITICAL")) {
          return <Zap className="text-rose-500" size={20} />;
        }
        return <Bell className="text-blue-500" size={20} />;
      };

      // Determine toast type
      let toastType = "info";
      if (notification.type?.includes("COMPLETED") || notification.type?.includes("SUCCESS")) {
        toastType = "success";
      } else if (notification.type?.includes("ERROR") || notification.type?.includes("FAILED") || notification.type?.includes("CRITICAL")) {
        toastType = "error";
      } else if (notification.type?.includes("WARNING")) {
        toastType = "warning";
      }

      // Show toast with formatted content
      const title = notification.title || "Notification";
      const message = notification.message || "";

      // Custom toast with icon and content
      if (toastType === "success") {
        showToast.success(title, message);
      } else if (toastType === "error") {
        showToast.error(title, message);
      } else if (toastType === "warning") {
        showToast.warning(title, message);
      } else {
        showToast.info(title, message);
      }

      console.log("🔔 Real-time notification:", notification);
    };

    // Listen for incoming notifications
    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [user?.id]);

  return null;
}

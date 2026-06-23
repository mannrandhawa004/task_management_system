"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";

import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  Settings,
  Bell,
  FileText,
  Activity,
  User,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { isAdmin } from "@/lib/permissions";

export default function Sidebar() {

  const pathname = usePathname();
  const user = useSelector((state) => state.auth.user);
  const userRole = user?.role?.toLowerCase() || "member";
  const projects = useSelector((state) => state.project.projects);

  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState({
    users: true,
    projects: true,
    tasks: true,
    system: true,
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isProjectManager = projects?.some(
    (p) => p.role?.toLowerCase() === "manager"
  );

  const sections = [
    {
      key: "users",
      title: "User Management",
      roles: ["admin"],
      items: [{ title: "All Users", href: "/dashboard/users", icon: Users }],
    },
    {
      key: "projects",
      title: "Projects",
      roles: ["admin", "user", "member", "manager"],
      items: isAdmin(user)
        ? [
          { title: "All Projects", href: "/dashboard/projects", icon: FolderKanban },
        ]
        : [{ title: "My Projects", href: "/dashboard/projects", icon: FolderKanban }],
    },
    {
      key: "tasks",
      title: "Tasks",
      roles: ["manager", "member", "user", "admin"],
      items: [
        ...(userRole === "admin" || userRole === "manager" || isProjectManager
          ? [{ title: "All Tasks", href: "/dashboard/tasks/all", icon: CheckSquare }]
          : [{ title: "My Tasks", href: "/dashboard/tasks", icon: CheckSquare }]),
        { title: "Task Board", href: "/dashboard/tasks/board", icon: CheckSquare },
        { title: "Task Calendar", href: "/dashboard/tasks/calendar", icon: FileText },
      ],
    },
    {
      key: "system",
      title: "System",
      roles: ["admin", "manager", "member", "user"],
      items: [
        ...(userRole === "admin" ? [{ title: "Activity Logs", href: "/dashboard/logs", icon: Activity }] : []),
        { title: "Notifications", href: "/dashboard/notifications", icon: Bell },
        { title: "Profile", href: "/dashboard/profile", icon: User },
        { title: "Settings", href: "/dashboard/settings", icon: Settings },
      ],
    },
  ];

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 280 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="h-screen sticky top-0 border-r flex flex-col overflow-hidden select-none z-30 bg-[var(--card)] border-[var(--border)]"
    >
      {/* HEADER SEGMENT */}
      <div className="h-16 px-4 border-b flex items-center justify-between border-[var(--border)]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-8 h-8 rounded-xl overflow-hidden shrink-0 border border-[var(--border)]">
            <div className="grid h-full w-full place-items-center bg-[var(--primary)] text-white">
              <CheckSquare size={17} strokeWidth={2.6} />
            </div>
          </div>

          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
              <h1 className="font-extrabold text-sm tracking-tight text-[var(--text)]">TaskFlow</h1>
              <p className="text-[9px] uppercase font-bold tracking-wider truncate text-[var(--muted)]">
                {user?.role || "Member"} Space
              </p>
            </motion.div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg transition-colors cursor-pointer text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)]"
        >
          {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
        </button>
      </div>

      {/* RENDER NAVIGATION LINKS LIST */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar">
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 rounded-xl p-2.5 text-xs font-bold transition-all ${pathname === "/dashboard"
              ? "text-white shadow-xs"
              : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)]"
              }`}
            style={{ background: pathname === "/dashboard" ? "var(--primary)" : "transparent" }}
          >
            <LayoutDashboard size={16} strokeWidth={pathname === "/dashboard" ? 2.5 : 2} />
            {!collapsed && <span>Dashboard</span>}
          </Link>
        </div>

        {sections
          .filter((section) => section.roles.includes(userRole) && section.items.length > 0)
          .map((section) => (
            <div key={section.key} className="space-y-1">
              {!collapsed && (
                <button
                  type="button"
                  onClick={() => toggleSection(section.key)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left text-[10px] uppercase tracking-wider font-extrabold text-[var(--muted)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
                >
                  <span>{section.title}</span>
                  <motion.div animate={{ rotate: openSections[section.key] ? 180 : 0 }} transition={{ duration: 0.15 }}>
                    <ChevronDown size={11} />
                  </motion.div>
                </button>
              )}

              <AnimatePresence initial={false}>
                {(openSections[section.key] || collapsed) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    className="space-y-0.5 overflow-hidden"
                  >
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          prefetch={false}
                          className={`flex items-center gap-3 rounded-xl p-2.5 text-xs font-bold transition-all ${isActive
                            ? "text-white shadow-xs"
                            : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)]"
                            }`}
                          style={{ background: isActive ? "var(--primary)" : "transparent" }}
                        >
                          <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                          {!collapsed && <span className="truncate">{item.title}</span>}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
      </div>
    </motion.aside>
  );
}

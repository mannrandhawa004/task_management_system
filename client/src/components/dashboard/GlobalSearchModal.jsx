"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
  Search,
  X,
  FolderKanban,
  CheckSquare,
  Users,
  Building2,
  Users2,
  Loader2,
  CornerDownLeft,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { api } from "@/lib/axios";

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [results, setResults] = useState({
    users: [],
    projects: [],
    tasks: [],
    departments: [],
    teams: [],
  });
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { user } = useSelector((state) => state.auth);
  const router = useRouter();
  const inputRef = useRef(null);
  const resultsContainerRef = useRef(null);

  const userRole = user?.role ? user.role.toLowerCase() : "";

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery("");
      setActiveTab("all");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Debounced API Search
  useEffect(() => {
    if (!isOpen) return;

    if (!query.trim()) {
      setResults({
        users: [],
        projects: [],
        tasks: [],
        departments: [],
        teams: [],
      });
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query)}&type=${activeTab}`);
        if (res.data?.success && res.data?.data) {
          setResults(res.data.data);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error("Global search error:", err);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [query, activeTab, isOpen]);

  // Flatten results for keyboard navigation
  const flatItems = useMemo(() => {
    const list = [];
    if (activeTab === "all" || activeTab === "projects") {
      results.projects.forEach((item) => list.push({ ...item, _type: "project" }));
    }
    if (activeTab === "all" || activeTab === "tasks") {
      results.tasks.forEach((item) => list.push({ ...item, _type: "task" }));
    }
    if (activeTab === "all" || activeTab === "users") {
      results.users.forEach((item) => list.push({ ...item, _type: "user" }));
    }
    if (activeTab === "all" || activeTab === "departments") {
      results.departments.forEach((item) => list.push({ ...item, _type: "department" }));
    }
    if (activeTab === "all" || activeTab === "teams") {
      results.teams.forEach((item) => list.push({ ...item, _type: "team" }));
    }
    return list;
  }, [results, activeTab]);

  const handleSelect = useCallback(
    (item) => {
      onClose();
      if (item._type === "project") {
        router.push(`/dashboard/projects/${item.id}`);
      } else if (item._type === "task") {
        const canViewAll = userRole === "super_admin" || userRole === "admin" || userRole === "hr" || userRole === "manager" || userRole === "project_manager";
        router.push(canViewAll ? `/dashboard/tasks/all?taskId=${item.id}` : `/dashboard/tasks?taskId=${item.id}`);
      } else if (item._type === "user") {
        router.push(`/dashboard/users/${item.id}`);
      } else if (item._type === "department") {
        router.push(`/dashboard/departments`);
      } else if (item._type === "team") {
        router.push(`/dashboard/teams`);
      }
    },
    [onClose, router, userRole]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < flatItems.length ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : flatItems.length - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (flatItems[selectedIndex]) {
          handleSelect(flatItems[selectedIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, flatItems, selectedIndex, handleSelect, onClose]);

  if (!isOpen) return null;

  const tabs = [
    { id: "all", label: "All", icon: Sparkles },
    { id: "projects", label: "Projects", icon: FolderKanban, count: results.projects.length },
    { id: "tasks", label: "Tasks", icon: CheckSquare, count: results.tasks.length },
    { id: "users", label: "Employees", icon: Users, count: results.users.length },
    { id: "departments", label: "Departments", icon: Building2, count: results.departments.length },
    { id: "teams", label: "Teams", icon: Users2, count: results.teams.length },
  ];

  const quickLinks = [
    { title: "My Tasks", desc: "View assigned items", icon: CheckSquare, href: "/dashboard/tasks/my-tasks" },
    { title: "Projects", desc: "Browse active projects", icon: FolderKanban, href: "/dashboard/projects" },
    { title: "Team Directory", desc: "Find colleagues", icon: Users, href: "/dashboard/users" },
    { title: "Departments", desc: "Organization units", icon: Building2, href: "/dashboard/departments" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sleek Spotlight / Linear style modal */}
      <div className="relative z-10 w-full max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl overflow-hidden flex flex-col max-h-[72vh] animate-in zoom-in-95 duration-150">
        
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border)] bg-[var(--card)]">
          <Search className="w-4 h-4 text-[var(--muted)] shrink-0" />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search projects, tasks, employees..."
            className="w-full bg-transparent text-sm font-medium text-[var(--text)] placeholder-[var(--muted)] outline-none"
          />

          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[var(--primary)] shrink-0" />
          ) : query ? (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-full hover:bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}

          <button
            onClick={onClose}
            className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-[var(--muted)] hover:text-[var(--text)] bg-[var(--hover)] border border-[var(--border)] transition-colors cursor-pointer select-none shrink-0"
          >
            ESC
          </button>
        </div>

        {/* Apple-like Segmented Filter Bar */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-[var(--border)] bg-[var(--hover)]/30 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedIndex(0);
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? "bg-[var(--card)] text-[var(--text)] font-semibold shadow-xs border border-[var(--border)]"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                <Icon size={13} className={isActive ? "text-[var(--primary)]" : "text-[var(--muted)]"} />
                <span>{tab.label}</span>
                {tab.count !== undefined && query && tab.count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${isActive ? "bg-[var(--primary)]/15 text-[var(--primary)]" : "bg-[var(--hover)] text-[var(--muted)]"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Results Body Area */}
        <div ref={resultsContainerRef} className="flex-1 overflow-y-auto p-2 space-y-3">
          {!query.trim() ? (
            /* Simple Quick Links */
            <div className="p-2 space-y-2">
              <div className="text-[11px] font-semibold text-[var(--muted)] px-2">
                Quick Navigation
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {quickLinks.map((link, i) => {
                  const Icon = link.icon;
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        onClose();
                        router.push(link.href);
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--hover)] transition-colors cursor-pointer group"
                    >
                      <div className="p-2 rounded-lg bg-[var(--hover)] text-[var(--text)] group-hover:bg-[var(--primary)]/10 group-hover:text-[var(--primary)] transition-colors shrink-0">
                        <Icon size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-[var(--text)]">{link.title}</div>
                        <div className="text-[11px] text-[var(--muted)] truncate">{link.desc}</div>
                      </div>
                      <ArrowRight size={13} className="text-[var(--muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : flatItems.length === 0 && !loading ? (
            /* No Results Found */
            <div className="py-10 text-center space-y-1">
              <div className="text-sm font-medium text-[var(--text)]">No results for &quot;{query}&quot;</div>
              <div className="text-xs text-[var(--muted)]">We couldn&apos;t find anything matching your search.</div>
            </div>
          ) : (
            /* Sleek Flat Scannable List */
            <div className="space-y-3">
              {/* Projects Section */}
              {(activeTab === "all" || activeTab === "projects") && results.projects.length > 0 && (
                <div className="space-y-0.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] px-2.5 py-1">
                    Projects
                  </div>
                  {results.projects.map((item) => {
                    const idx = flatItems.findIndex((i) => i._type === "project" && i.id === item.id);
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={`proj-${item.id}`}
                        onClick={() => handleSelect({ ...item, _type: "project" })}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[var(--primary)] text-white shadow-sm"
                            : "hover:bg-[var(--hover)] text-[var(--text)]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? "bg-white/20 text-white" : "bg-emerald-500/10 text-emerald-500"}`}>
                            <FolderKanban size={14} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-medium truncate">{item.name}</div>
                            <div className={`text-[11px] truncate ${isSelected ? "text-white/80" : "text-[var(--muted)]"}`}>
                              By {item.creator_name || "Admin"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize ${isSelected ? "bg-white/20 text-white" : "bg-[var(--hover)] text-[var(--muted)]"}`}>
                            {item.status || "active"}
                          </span>
                          {isSelected && <CornerDownLeft size={13} className="text-white shrink-0" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tasks Section */}
              {(activeTab === "all" || activeTab === "tasks") && results.tasks.length > 0 && (
                <div className="space-y-0.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] px-2.5 py-1">
                    Tasks
                  </div>
                  {results.tasks.map((item) => {
                    const idx = flatItems.findIndex((i) => i._type === "task" && i.id === item.id);
                    const isSelected = idx === selectedIndex;
                    const priorityColor = isSelected
                      ? "bg-white/20 text-white"
                      : item.priority === "high" || item.priority === "urgent"
                      ? "text-rose-500 bg-rose-500/10"
                      : item.priority === "medium"
                      ? "text-amber-500 bg-amber-500/10"
                      : "text-emerald-500 bg-emerald-500/10";
                    return (
                      <div
                        key={`task-${item.id}`}
                        onClick={() => handleSelect({ ...item, _type: "task" })}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[var(--primary)] text-white shadow-sm"
                            : "hover:bg-[var(--hover)] text-[var(--text)]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-1.5 rounded-lg shrink-0 ${priorityColor}`}>
                            <CheckSquare size={14} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-medium truncate">{item.title}</div>
                            <div className={`text-[11px] truncate ${isSelected ? "text-white/80" : "text-[var(--muted)]"}`}>
                              {item.project_name || "General"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize ${isSelected ? "bg-white/20 text-white" : "bg-[var(--hover)] text-[var(--muted)]"}`}>
                            {item.status || "todo"}
                          </span>
                          {isSelected && <CornerDownLeft size={13} className="text-white shrink-0" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Employees Section */}
              {(activeTab === "all" || activeTab === "users") && results.users.length > 0 && (
                <div className="space-y-0.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] px-2.5 py-1">
                    Employees
                  </div>
                  {results.users.map((item) => {
                    const idx = flatItems.findIndex((i) => i._type === "user" && i.id === item.id);
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={`user-${item.id}`}
                        onClick={() => handleSelect({ ...item, _type: "user" })}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[var(--primary)] text-white shadow-sm"
                            : "hover:bg-[var(--hover)] text-[var(--text)]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`h-7 w-7 rounded-full font-bold text-[11px] flex items-center justify-center shrink-0 uppercase ${isSelected ? "bg-white/20 text-white" : "bg-[var(--primary)]/10 text-[var(--primary)]"}`}>
                            {item.name ? item.name.slice(0, 2) : "US"}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-medium truncate">{item.name}</div>
                            <div className={`text-[11px] truncate ${isSelected ? "text-white/80" : "text-[var(--muted)]"}`}>
                              {item.email} • {item.role_name || "Employee"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${isSelected ? "bg-white/20 text-white" : "bg-[var(--hover)] text-[var(--muted)]"}`}>
                            {item.department_name || "General"}
                          </span>
                          {isSelected && <CornerDownLeft size={13} className="text-white shrink-0" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Departments Section */}
              {(activeTab === "all" || activeTab === "departments") && results.departments.length > 0 && (
                <div className="space-y-0.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] px-2.5 py-1">
                    Departments
                  </div>
                  {results.departments.map((item) => {
                    const idx = flatItems.findIndex((i) => i._type === "department" && i.id === item.id);
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={`dept-${item.id}`}
                        onClick={() => handleSelect({ ...item, _type: "department" })}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[var(--primary)] text-white shadow-sm"
                            : "hover:bg-[var(--hover)] text-[var(--text)]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? "bg-white/20 text-white" : "bg-blue-500/10 text-blue-500"}`}>
                            <Building2 size={14} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-medium truncate">{item.name}</div>
                            <div className={`text-[11px] truncate ${isSelected ? "text-white/80" : "text-[var(--muted)]"}`}>
                              {item.description || "Department"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${isSelected ? "bg-white/20 text-white" : "bg-[var(--hover)] text-[var(--muted)]"}`}>
                            {item.user_count || 0} Users
                          </span>
                          {isSelected && <CornerDownLeft size={13} className="text-white shrink-0" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Teams Section */}
              {(activeTab === "all" || activeTab === "teams") && results.teams.length > 0 && (
                <div className="space-y-0.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] px-2.5 py-1">
                    Teams
                  </div>
                  {results.teams.map((item) => {
                    const idx = flatItems.findIndex((i) => i._type === "team" && i.id === item.id);
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={`team-${item.id}`}
                        onClick={() => handleSelect({ ...item, _type: "team" })}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[var(--primary)] text-white shadow-sm"
                            : "hover:bg-[var(--hover)] text-[var(--text)]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? "bg-white/20 text-white" : "bg-purple-500/10 text-purple-500"}`}>
                            <Users2 size={14} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-medium truncate">{item.name}</div>
                            <div className={`text-[11px] truncate ${isSelected ? "text-white/80" : "text-[var(--muted)]"}`}>
                              Dept: {item.department_name || "General"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {isSelected && <CornerDownLeft size={13} className="text-white shrink-0" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Minimal 1-line Footer */}
        <div className="px-4 py-2 border-t border-[var(--border)] bg-[var(--hover)]/20 flex items-center justify-between text-[11px] text-[var(--muted)]">
          <div className="flex items-center gap-3">
            <span><strong className="text-[var(--text)] font-semibold">↑↓</strong> Navigate</span>
            <span><strong className="text-[var(--text)] font-semibold">↵</strong> Open</span>
            <span><strong className="text-[var(--text)] font-semibold">ESC</strong> Close</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="capitalize font-medium">{userRole ? userRole.replace("_", " ") : "User"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

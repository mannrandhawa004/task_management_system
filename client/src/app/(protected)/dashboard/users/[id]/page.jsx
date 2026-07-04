"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Users,
  Shield,
  Calendar,
  Sparkles,
  BadgeCheck,
  UserCheck,
  Briefcase,
  Hash,
  Clock,
  AlertCircle,
  RefreshCw,
  FolderKanban,
  CheckSquare,
  ArrowRight,
  CheckCircle2,
  ListTodo,
  Layers,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { api } from "@/lib/axios";
import { showToast } from "@/lib/toast";

export default function UserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview | projects | tasks

  const fetchUserDetails = async () => {
    try {
      if (!id) return;
      setLoading(true);
      setError(null);
      const res = await api.get(`/users/${id}`);
      if (res.data?.success && res.data?.data) {
        setUser(res.data.data);
      } else {
        setError("Employee details not found.");
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
      setError(err?.response?.data?.message || "Failed to load employee details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const res = await api.get(`/users/${id}`);
      if (res.data?.success && res.data?.data) {
        setUser(res.data.data);
        showToast.success("Employee data refreshed");
      }
    } catch (err) {
      showToast.error("Failed to refresh employee data");
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--bg)] p-6 md:p-10 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[var(--primary)]" />
          <p className="text-sm font-semibold text-[var(--muted)]">Loading employee profile...</p>
        </div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="min-h-screen bg-[var(--bg)] p-6 md:p-10 space-y-6">
        <button
          onClick={() => router.push("/dashboard/users")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[var(--card)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--hover)] transition-all cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Directory</span>
        </button>

        <div className="max-w-md mx-auto py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-black text-[var(--text)]">{error || "Employee Not Found"}</h2>
          <p className="text-xs text-[var(--muted)]">
            The employee record you are trying to view does not exist or has been removed from the system.
          </p>
          <button
            onClick={() => router.push("/dashboard/users")}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[var(--primary)] text-white hover:opacity-90 transition-all cursor-pointer"
          >
            Return to Employees
          </button>
        </div>
      </main>
    );
  }

  const formattedDate = user.created_at || user.joined_date
    ? new Date(user.created_at || user.joined_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Not available";

  const statusColor =
    user.status === "active"
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
      : user.status === "suspended"
      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";

  const projects = user.projects || [];
  const tasks = user.tasks || [];

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-4 md:p-8 space-y-6 transition-colors duration-200">
      {/* TOP NAVIGATION & HEADER */}
      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <button
            onClick={() => router.push("/dashboard/users")}
            className="inline-flex items-center gap-2 text-xs font-bold text-[var(--muted)] hover:text-[var(--primary)] transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Employees</span>
          </button>
          
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--primary)]">
            <Sparkles size={14} />
            <span>Employee Directory Profile</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">{user.name || "Employee Details"}</h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-xs font-black hover:bg-[var(--hover)] cursor-pointer shadow-2xs transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin text-[var(--primary)]" : ""} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* HERO BANNER CARD */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8 shadow-sm">
        <div className="absolute top-0 right-0 h-full w-2/3 bg-gradient-to-l from-[var(--primary)]/10 via-[var(--primary)]/5 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* Avatar */}
            <div className="relative h-24 w-24 shrink-0 rounded-3xl bg-[var(--primary)] text-3xl font-black text-white overflow-hidden shadow-md flex items-center justify-center border-2 border-[var(--border)]">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name || "User avatar"}
                  className="h-full w-full object-cover"
                  height={100}
                  width={100}
                />
              ) : (
                user.name?.slice(0, 2).toUpperCase() || "??"
              )}
              <span className={`absolute bottom-1.5 right-1.5 h-4 w-4 rounded-full border-2 border-white dark:border-zinc-900 shadow-xs ${user.status === "active" ? "bg-emerald-500" : user.status === "suspended" ? "bg-rose-500" : "bg-amber-500"}`} />
            </div>

            {/* Profile Info */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-[var(--text)]">
                  {user.name}
                </h2>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider border ${statusColor}`}>
                  <BadgeCheck size={13} />
                  {user.status || "active"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-[var(--muted)]">
                <div className="flex items-center gap-1.5">
                  <Mail size={13} className="text-[var(--primary)]" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone size={13} className="text-[var(--primary)]" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.employee_id && (
                  <div className="flex items-center gap-1.5">
                    <Hash size={13} className="text-[var(--primary)]" />
                    <span>ID: {user.employee_id}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col items-end rounded-2xl bg-[var(--input)]/50 px-4 py-2.5 border border-[var(--border)]">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">System Role</span>
              <span className="text-sm font-black capitalize text-[var(--primary)]">{user.role_name || user.role || "Employee"}</span>
            </div>
            <div className="flex flex-col items-end rounded-2xl bg-[var(--input)]/50 px-4 py-2.5 border border-[var(--border)]">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Department</span>
              <span className="text-sm font-black text-[var(--text)]">{user.department_name || "General"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION TABS */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("overview")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-[var(--primary)] text-white shadow-sm"
              : "bg-[var(--card)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--hover)]"
          }`}
        >
          <UserCheck size={14} />
          <span>Overview</span>
        </button>
        <button
          onClick={() => setActiveTab("projects")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "projects"
              ? "bg-[var(--primary)] text-white shadow-sm"
              : "bg-[var(--card)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--hover)]"
          }`}
        >
          <FolderKanban size={14} />
          <span>Assigned Projects</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${activeTab === "projects" ? "bg-white/20 text-white" : "bg-[var(--hover)] text-[var(--primary)]"}`}>
            {projects.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("tasks")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "tasks"
              ? "bg-[var(--primary)] text-white shadow-sm"
              : "bg-[var(--card)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--hover)]"
          }`}
        >
          <CheckSquare size={14} />
          <span>Assigned Tasks</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${activeTab === "tasks" ? "bg-white/20 text-white" : "bg-[var(--hover)] text-[var(--primary)]"}`}>
            {tasks.length}
          </span>
        </button>
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
          {/* Card 1: Personal & Contact Information */}
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] font-black">
                <UserCheck size={20} />
              </div>
              <div>
                <h3 className="text-base font-black">Personal Information</h3>
                <p className="text-xs font-medium text-[var(--muted)]">Contact credentials and identification</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Full Name</span>
                <p className="text-sm font-black text-[var(--text)]">{user.name || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Email Address</span>
                <p className="text-sm font-black text-[var(--text)] break-all">{user.email || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Phone Number</span>
                <p className="text-sm font-black text-[var(--text)]">{user.phone || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Employee ID</span>
                <p className="text-sm font-black text-[var(--text)]">{user.employee_id || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Date of Birth</span>
                <p className="text-sm font-black text-[var(--text)]">
                  {user.dob
                    ? new Date(user.dob).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Not provided"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Account Status</span>
                <p className="text-sm font-black capitalize text-[var(--text)]">{user.status || "Active"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Date Joined</span>
                <p className="text-sm font-black text-[var(--text)]">{formattedDate}</p>
              </div>
            </div>
          </div>

          {/* Card 2: Organizational Placement */}
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] font-black">
                <Building2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-black">Organizational Placement</h3>
                <p className="text-xs font-medium text-[var(--muted)]">Department, team, and system permissions</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Department</span>
                <p className="text-sm font-black text-[var(--text)]">{user.department_name || "General Department"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Assigned Team</span>
                <p className="text-sm font-black text-[var(--text)]">{user.team_name || "General Team"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">System Role</span>
                <p className="text-sm font-black capitalize text-[var(--primary)]">{user.role_name || user.role || "Employee"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Access Level</span>
                <p className="text-sm font-black text-[var(--text)]">
                  {user.role_name === "Super Admin" || user.role === "super_admin"
                    ? "Full Global Access"
                    : user.role_name === "Admin" || user.role === "admin"
                    ? "Administrative Scope"
                    : "Department & Team Scope"}
                </p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Workload Summary</span>
                <div className="flex items-center gap-4 mt-1">
                  <div onClick={() => setActiveTab("projects")} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--hover)]/50 hover:bg-[var(--hover)] transition-colors cursor-pointer">
                    <FolderKanban size={14} className="text-[var(--primary)]" />
                    <span className="text-xs font-bold">{projects.length} Projects</span>
                  </div>
                  <div onClick={() => setActiveTab("tasks")} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--hover)]/50 hover:bg-[var(--hover)] transition-colors cursor-pointer">
                    <CheckSquare size={14} className="text-emerald-500" />
                    <span className="text-xs font-bold">{tasks.length} Tasks</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PROJECTS */}
      {activeTab === "projects" && (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8 space-y-6 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 font-black">
                <FolderKanban size={20} />
              </div>
              <div>
                <h3 className="text-base font-black">Assigned Projects</h3>
                <p className="text-xs font-medium text-[var(--muted)]">Projects where {user.name} is an active collaborator or leader</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--hover)] text-[var(--text)]">
              Total: {projects.length}
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[var(--hover)] text-[var(--muted)] flex items-center justify-center mx-auto">
                <FolderKanban size={28} />
              </div>
              <div className="text-sm font-bold text-[var(--text)]">No projects assigned</div>
              <div className="text-xs text-[var(--muted)]">This employee is currently not assigned as a member to any projects.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((proj) => (
                <div
                  key={`proj-${proj.id}`}
                  onClick={() => router.push(`/dashboard/projects/${proj.id}`)}
                  className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg)]/50 hover:bg-[var(--hover)]/40 hover:border-[var(--primary)]/30 transition-all cursor-pointer group flex flex-col justify-between space-y-4 shadow-2xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="p-2.5 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] shrink-0">
                        <FolderKanban size={18} />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[var(--card)] border border-[var(--border)] text-[var(--text)]">
                        {proj.status || "active"}
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-[var(--text)] group-hover:text-[var(--primary)] transition-colors line-clamp-1">
                      {proj.name}
                    </h4>
                    <p className="text-xs text-[var(--muted)] line-clamp-2">
                      {proj.description || "No description provided."}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[var(--border)]/60 flex items-center justify-between text-xs text-[var(--muted)]">
                    <span className="font-semibold text-[var(--primary)] capitalize">
                      Role: {proj.role || "Member"}
                    </span>
                    <div className="flex items-center gap-1 text-[var(--text)] font-bold group-hover:translate-x-0.5 transition-transform">
                      <span>View</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: TASKS */}
      {activeTab === "tasks" && (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8 space-y-6 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 font-black">
                <CheckSquare size={20} />
              </div>
              <div>
                <h3 className="text-base font-black">Assigned Tasks</h3>
                <p className="text-xs font-medium text-[var(--muted)]">Tasks and deliverables currently assigned to {user.name}</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--hover)] text-[var(--text)]">
              Total: {tasks.length}
            </span>
          </div>

          {tasks.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[var(--hover)] text-[var(--muted)] flex items-center justify-center mx-auto">
                <CheckSquare size={28} />
              </div>
              <div className="text-sm font-bold text-[var(--text)]">No tasks assigned</div>
              <div className="text-xs text-[var(--muted)]">There are no pending or completed tasks currently assigned to this employee.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map((t) => {
                const priorityColor =
                  t.priority === "high" || t.priority === "urgent"
                    ? "text-rose-500 bg-rose-500/10 border-rose-500/20"
                    : t.priority === "medium"
                    ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
                    : "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";

                const statusBadge =
                  t.status === "completed"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : t.status === "in_progress"
                    ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                    : "bg-[var(--hover)] text-[var(--muted)]";

                const projName = typeof t.project === "object" ? t.project?.name : t.project_name || "General";

                return (
                  <div
                    key={`task-${t.id}`}
                    onClick={() => {
                      const canViewAll = user.role_name === "Super Admin" || user.role === "super_admin" || user.role === "admin";
                      router.push(canViewAll ? `/dashboard/tasks/all?taskId=${t.id}` : `/dashboard/tasks?taskId=${t.id}`);
                    }}
                    className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg)]/50 hover:bg-[var(--hover)]/40 hover:border-[var(--primary)]/30 transition-all cursor-pointer group flex items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${priorityColor}`}>
                        <CheckSquare size={16} />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusBadge}`}>
                            {t.status ? t.status.replace("_", " ") : "todo"}
                          </span>
                          <span className="text-[11px] font-semibold text-[var(--muted)] truncate">
                            {projName}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-[var(--text)] group-hover:text-[var(--primary)] transition-colors truncate">
                          {t.title}
                        </h4>
                        {t.due_date && (
                          <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                            <Clock size={12} />
                            <span>Due: {new Date(t.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-[var(--muted)] group-hover:text-[var(--primary)] shrink-0 transition-colors">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

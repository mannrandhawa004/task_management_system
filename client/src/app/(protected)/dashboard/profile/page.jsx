"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BadgeCheck,
  Calendar,
  Mail,
  Shield,
  UserRound,
  Phone,
  Building2,
  Users,
  UserCheck,
  Hash,
  Clock,
  RefreshCw,
  Sparkles,
  Briefcase
} from "lucide-react";
import Image from "next/image";

import { profileThunk } from "@/features/auth/thunks/authThunk";
import { showToast } from "@/lib/toast";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await dispatch(profileThunk()).unwrap();
      showToast.success("Profile data refreshed");
    } catch (error) {
      showToast.error(error || "Failed to refresh profile");
    } finally {
      setRefreshing(false);
    }
  };

  const formattedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Not available";

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-4 md:p-8 space-y-6 transition-colors duration-200">
      {/* HEADER BAR */}
      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--primary)] mb-1">
            <Sparkles size={14} />
            <span>Identity & Workspace Access</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Account Profile</h1>
          <p className="mt-1 text-xs md:text-sm font-medium text-[var(--muted)]">
            Review your personal credentials, organizational placement, and role metadata.
          </p>
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
        {/* Decorative Gradient Background */}
        <div className="absolute top-0 right-0 h-full w-2/3 bg-gradient-to-l from-[var(--primary)]/10 via-[var(--primary)]/5 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* Avatar Container */}
            <div className="relative h-24 w-24 shrink-0 rounded-3xl bg-[var(--primary)] text-3xl font-black text-white overflow-hidden shadow-md flex items-center justify-center border-2 border-[var(--border)]">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user?.name || "User avatar"}
                  className="h-full w-full object-cover"
                  height={100}
                  width={100}
                />
              ) : (
                user?.name?.slice(0, 2).toUpperCase() || "??"
              )}
              {/* Active Status Dot */}
              <span className="absolute bottom-1.5 right-1.5 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 shadow-xs" />
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl font-black text-[var(--text)]">{user?.name || "Unknown User"}</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <BadgeCheck size={12} />
                  {user?.status || "Active"}
                </span>
              </div>
              <p className="text-xs md:text-sm font-bold text-[var(--muted)]">{user?.email || "No email provided"}</p>
              
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--input)] px-3 py-1 text-xs font-black capitalize text-[var(--primary)]">
                  <Shield size={13} />
                  {user?.role?.replace(/_/g, " ") || "Employee"}
                </span>

                {user?.employee_id && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--input)] px-3 py-1 text-xs font-bold text-[var(--muted)]">
                    <Hash size={13} />
                    EMP ID: {user.employee_id}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OVERVIEW & DETAILS GRID */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* COLUMN 1: PERSONAL INFORMATION */}
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--primary)] mb-4">
              <UserRound size={16} />
              <span>Personal Credentials</span>
            </div>
            <div className="space-y-3">
              <ProfileField icon={UserRound} label="Full Name" value={user?.name || "Not provided"} />
              <ProfileField icon={Mail} label="Email Address" value={user?.email || "Not provided"} />
              <ProfileField icon={Phone} label="Phone Number" value={user?.phone || "Not provided"} />
              <ProfileField icon={Hash} label="Employee Badge ID" value={user?.employee_id || "Not assigned"} />
              <ProfileField
                icon={Calendar}
                label="Date of Birth"
                value={
                  user?.dob
                    ? new Date(user.dob).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Not provided"
                }
              />
            </div>
          </div>
        </div>

        {/* COLUMN 2: WORKSPACE & ORGANIZATION */}
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--primary)] mb-4">
              <Building2 size={16} />
              <span>Organization & Placement</span>
            </div>
            <div className="space-y-3">
              <ProfileField icon={Shield} label="System Access Role" value={user?.role?.replace(/_/g, " ") || "Employee"} capitalize />
              <ProfileField icon={Building2} label="Assigned Department" value={user?.department_name || "General Staff"} />
              <ProfileField icon={Users} label="Team Unit" value={user?.team_name || "Unassigned"} />
              <ProfileField icon={UserCheck} label="Reporting Manager" value={user?.manager_name || "Direct / Leadership"} />
            </div>
          </div>
        </div>

        {/* COLUMN 3: SYSTEM METADATA & PERMISSIONS */}
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--primary)] mb-4">
              <Briefcase size={16} />
              <span>Account Metadata</span>
            </div>
            <div className="space-y-3">
              <ProfileField icon={BadgeCheck} label="Account Status" value={user?.status || "Active"} capitalize />
              <ProfileField icon={Calendar} label="Member Since" value={formattedDate} />
              
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ProfileField({ icon: Icon, label, value, capitalize = false }) {
  return (
    <div className="rounded-2xl border border-[var(--border)]/70 bg-[var(--input)]/50 p-4 transition hover:border-[var(--border)]">
      <div className="mb-1.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
        <Icon size={13} className="text-[var(--primary)]/70" />
        {label}
      </div>
      <p className={`text-xs md:text-sm font-extrabold text-[var(--text)] truncate ${capitalize ? "capitalize" : ""}`}>
        {value || "—"}
      </p>
    </div>
  );
}

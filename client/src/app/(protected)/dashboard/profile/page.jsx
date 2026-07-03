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
  KeyRound,
  Lock,
  RefreshCw,
  Sparkles,
  Briefcase,
  Eye,
  EyeOff,
  Check
} from "lucide-react";
import Image from "next/image";

import { profileThunk } from "@/features/auth/thunks/authThunk";
import { changePassword } from "@/features/auth/services/auth.service";
import { showToast } from "@/lib/toast";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "security"
  const [refreshing, setRefreshing] = useState(false);

  // Password state
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

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

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword) {
      return showToast.error("Please fill in all password fields");
    }
    if (passwords.newPassword.length < 6) {
      return showToast.error("New password must be at least 6 characters long");
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      return showToast.error("New passwords do not match");
    }

    try {
      setPasswordLoading(true);
      await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      showToast.success("Password changed successfully");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      showToast.error(error?.response?.data?.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
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
            Manage your personal credentials, organizational hierarchy placement, and account security.
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

          {/* Tab Selection Switch */}
          <div className="flex bg-[var(--hover)] p-1.5 rounded-2xl border border-[var(--border)] shrink-0 self-start md:self-center">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-5 py-2 text-xs font-black rounded-xl transition cursor-pointer ${
                activeTab === "overview"
                  ? "bg-[var(--card)] text-[var(--primary)] shadow-xs border border-[var(--border)]"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              <UserRound size={14} />
              Overview & Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-2 px-5 py-2 text-xs font-black rounded-xl transition cursor-pointer ${
                activeTab === "security"
                  ? "bg-[var(--card)] text-[var(--primary)] shadow-xs border border-[var(--border)]"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              <KeyRound size={14} />
              Account Security
            </button>
          </div>
        </div>
      </div>

      {/* TAB CONTENT: OVERVIEW & DETAILS */}
      {activeTab === "overview" ? (
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
      ) : (
        /* TAB CONTENT: ACCOUNT SECURITY */
        <section className="max-w-2xl mx-auto rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 border-b border-[var(--border)] pb-5 mb-6">
            <div className="p-3 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
              <Lock size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black">Change Password</h3>
              <p className="text-xs font-medium text-[var(--muted)]">Update your login password to maintain account integrity.</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[var(--muted)] mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  placeholder="Enter current password..."
                  required
                  className="w-full text-xs py-3 pl-4 pr-11 rounded-2xl border border-[var(--border)] bg-[var(--input)] font-bold text-[var(--text)] outline-none focus:border-[var(--primary)]/60 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[var(--muted)] mb-2">
                New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                placeholder="Enter new password (min. 6 chars)..."
                required
                className="w-full text-xs py-3 px-4 rounded-2xl border border-[var(--border)] bg-[var(--input)] font-bold text-[var(--text)] outline-none focus:border-[var(--primary)]/60 transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[var(--muted)] mb-2">
                Confirm New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                placeholder="Confirm new password..."
                required
                className="w-full text-xs py-3 px-4 rounded-2xl border border-[var(--border)] bg-[var(--input)] font-bold text-[var(--text)] outline-none focus:border-[var(--primary)]/60 transition"
              />
            </div>

            {/* Password security checklist */}
            <div className="p-4 rounded-2xl bg-[var(--hover)] border border-[var(--border)] space-y-2 text-xs font-bold text-[var(--muted)]">
              <p className="flex items-center gap-2">
                <Check size={14} className={passwords.newPassword.length >= 6 ? "text-emerald-500" : "opacity-30"} />
                At least 6 characters in length
              </p>
              <p className="flex items-center gap-2">
                <Check
                  size={14}
                  className={
                    passwords.newPassword && passwords.newPassword === passwords.confirmPassword
                      ? "text-emerald-500"
                      : "opacity-30"
                  }
                />
                New passwords match exactly
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={passwordLoading}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--primary)] text-white text-xs font-black shadow-xs hover:opacity-90 transition cursor-pointer disabled:opacity-50"
              >
                {passwordLoading ? <RefreshCw size={14} className="animate-spin" /> : <Lock size={14} />}
                Update Account Password
              </button>
            </div>
          </form>
        </section>
      )}
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

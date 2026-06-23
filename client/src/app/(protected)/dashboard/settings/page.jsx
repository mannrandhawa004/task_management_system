"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Bell, CheckSquare, FolderKanban, KeyRound, Loader2, Palette, Settings, Shield, Users, Eye, EyeOff } from "lucide-react";

import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import { changePassword } from "@/features/auth/services/auth.service";
import { getProjectsThunk } from "@/features/projects/thunks/projectThunk";
import { getAllTasksThunk, myTaskThunk } from "@/features/tasks/thunks/taskThunk";
import { showToast } from "@/lib/toast";

export default function SettingsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);
  const { projects } = useSelector((state) => state.project);
  const { tasks } = useSelector((state) => state.task);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const role = user?.role?.toLowerCase() || "member";
  const isAdmin = role === "admin";

  useEffect(() => {
    dispatch(getProjectsThunk({ page: 1, limit: 10 }));

    if (isAdmin) {
      dispatch(getAllTasksThunk({ page: 1, limit: 200 }));
      return;
    }

    dispatch(myTaskThunk());
  }, [dispatch, isAdmin]);

  const roleCapabilities = useMemo(() => {
    if (role === "admin") {
      return [
        "Manage all users and account status",
        "View all projects and tasks",
        "Review activity logs",
        "Update and delete project/task records",
      ];
    }

    if (role === "manager") {
      return [
        "Manage assigned project members",
        "Create and assign tasks where permitted",
        "Track project task board and calendar",
        "Update assigned task progress",
      ];
    }

    return [
      "View assigned projects",
      "Work on assigned tasks",
      "Move active tasks to completed",
      "Reopen completed work when correction is needed",
    ];
  }, [role]);

  const activeTasks = (tasks || []).filter((task) => task.status === "in_progress").length;
  const completedTasks = (tasks || []).filter((task) => task.status === "completed").length;
  const todoTasks = (tasks || []).filter((task) => (task.status || "todo") === "todo").length;

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast.error("New password and confirm password do not match");
      return;
    }

    try {
      setPasswordLoading(true);
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      showToast.success("Password changed. Please login again.");
      router.replace("/");
    } catch (error) {
      showToast.error(error?.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-4 md:p-8 space-y-6">
      <div className="border-b border-[var(--border)] pb-6">
        <h1 className="flex items-center gap-2 text-2xl md:text-3xl font-black tracking-tight">
          <Settings className="text-[var(--primary)]" />
          Settings
        </h1>
        <p className="mt-1 text-sm font-medium text-[var(--muted)]">
          Account security, role capabilities, notification delivery, and workspace preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 xl:grid-cols-[2fr_380px]">
        <section className="space-y-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <SettingsPanel icon={Palette} title="Appearance">
              <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
                <div>
                  <p className="text-xs font-black">Theme</p>
                  <p className="mt-1 text-[11px] font-medium text-[var(--muted)]">Stored locally in the browser.</p>
                </div>
                <ThemeToggle />
              </div>
            </SettingsPanel>

            <SettingsPanel icon={Shield} title="Access">
              <div className="space-y-3 text-xs font-bold">
                <SettingsRow label="Role" value={user?.role || "member"} />
                <SettingsRow label="Account" value={user?.status || "active"} />
                {/* <SettingsRow label="User ID" value={user?.id ? `#${user.id}` : "N/A"} /> */}
              </div>
            </SettingsPanel>


          </div>

          <SettingsPanel icon={Users} title={`${user?.role || "Member"} Capabilities`}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {roleCapabilities.map((capability) => (
                <div key={capability} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-xs font-bold">
                  {capability}
                </div>
              ))}
            </div>
          </SettingsPanel>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="mb-4 text-sm font-black">Workspace Snapshot</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <Snapshot icon={FolderKanban} label={isAdmin ? "Projects loaded" : "My projects"} value={projects?.length || 0} />
              <Snapshot icon={CheckSquare} label="To do" value={todoTasks} />
              <Snapshot icon={CheckSquare} label="Active tasks" value={activeTasks} />
              <Snapshot icon={CheckSquare} label="Completed" value={completedTasks} />
            </div>
          </section>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 h-fit">
          <div className="mb-4 flex items-center gap-2">
            <KeyRound size={18} className="text-[var(--primary)]" />
            <h2 className="text-sm font-black">Change Password</h2>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <PasswordInput
              label="Current password"
              value={passwordForm.currentPassword}
              onChange={(value) => setPasswordForm((prev) => ({ ...prev, currentPassword: value }))}
            />
            <PasswordInput
              label="New password"
              value={passwordForm.newPassword}
              onChange={(value) => setPasswordForm((prev) => ({ ...prev, newPassword: value }))}
            />
            <PasswordInput
              label="Confirm new password"
              value={passwordForm.confirmPassword}
              onChange={(value) => setPasswordForm((prev) => ({ ...prev, confirmPassword: value }))}
            />

            <button
              type="submit"
              disabled={passwordLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-3 text-xs font-black text-white disabled:opacity-60 cursor-pointer"
            >
              {passwordLoading && <Loader2 size={14} className="animate-spin" />}
              Update Password
            </button>
          </form>

          <p className="mt-3 text-[11px] font-medium leading-relaxed text-[var(--muted)]">
            After changing password, active sessions are cleared and you need to login again.
          </p>
        </section>
      </div>
    </main>
  );
}

function SettingsPanel({ icon: Icon, title, children }) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon size={18} className="text-[var(--primary)]" />
        <h2 className="text-sm font-black">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function SettingsRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="font-black capitalize">{value}</span>
    </div>
  );
}

function ReadOnlyStatus({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
      <span className="text-xs font-bold">{label}</span>
      <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-black text-emerald-500">{value}</span>
    </div>
  );
}

// 📑 Location: src/app/(protected)/settings/page.jsx

function PasswordInput({ label, value, onChange }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label className="block space-y-1">
      <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
        {label}
      </span>
      <div className="relative flex items-center">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          minLength={6}
          required
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--input)] p-3 pr-10 text-sm font-bold outline-none focus:border-[var(--primary)]/50 transition-colors"
        />


        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 p-1 rounded-md text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors cursor-pointer select-none"
        >
          {showPassword ? (
            <EyeOff size={16} className="animate-in fade-in duration-200" />
          ) : (
            <Eye size={16} className="animate-in fade-in duration-200" />
          )}
        </button>
      </div>
    </label>
  );
}

function Snapshot({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
      <Icon size={16} className="text-[var(--primary)]" />
      <p className="mt-3 text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

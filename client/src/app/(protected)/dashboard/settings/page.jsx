"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Bell, CheckSquare, FolderKanban, KeyRound, Loader2, Palette, Settings, Shield, Users, Eye, EyeOff, ShieldCheck, Copy, Check, Smartphone } from "lucide-react";

import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import { changePassword, enable2FA, verifyEnable2FA, disable2FA } from "@/features/auth/services/auth.service";
import { setUser2FA } from "@/features/auth/slices/authSlice";
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
  const isAdmin = role === "admin" || role === "super_admin";

  useEffect(() => {
    dispatch(getProjectsThunk({ page: 1, limit: 10 }));

    if (isAdmin) {
      dispatch(getAllTasksThunk({ page: 1, limit: 200 }));
      return;
    }

    dispatch(myTaskThunk());
  }, [dispatch, isAdmin]);

  const roleCapabilities = useMemo(() => {
    if (role === "admin" || role === "super_admin") {
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

          <TwoFactorPanel user={user} dispatch={dispatch} />

          <SettingsPanel icon={Users} title={`${user?.role || "Member"} Capabilities`}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {roleCapabilities.map((capability) => (
                <div key={capability} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-xs font-bold">
                  {capability}
                </div>
              ))}
            </div>
          </SettingsPanel>

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

function TwoFactorPanel({ user, dispatch }) {
  const [isSetup, setIsSetup] = useState(false);
  const [secretData, setSecretData] = useState(null);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isEnabled = Boolean(user?.is_2fa_enabled);

  const handleStartSetup = async () => {
    try {
      setLoading(true);
      const data = await enable2FA();
      setSecretData(data);
      setIsSetup(true);
    } catch (err) {
      showToast.error(err?.response?.data?.message || "Failed to initiate 2FA setup");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSetup = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      showToast.error("Please enter a valid 6-digit code");
      return;
    }
    try {
      setLoading(true);
      await verifyEnable2FA({ otp });
      dispatch(setUser2FA(true));
      setIsSetup(false);
      setSecretData(null);
      setOtp("");
      showToast.success("Two-Factor Authentication Enabled!");
    } catch (err) {
      showToast.error(err?.response?.data?.message || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!confirm("Are you sure you want to disable Two-Factor Authentication? Your account will be less secure.")) return;
    try {
      setLoading(true);
      await disable2FA();
      dispatch(setUser2FA(false));
      setIsSetup(false);
      setSecretData(null);
      showToast.success("Two-Factor Authentication Disabled");
    } catch (err) {
      showToast.error(err?.response?.data?.message || "Failed to disable 2FA");
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    if (secretData?.secret) {
      navigator.clipboard.writeText(secretData.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast.success("Secret key copied to clipboard");
    }
  };

  return (
    <SettingsPanel icon={ShieldCheck} title="Two-Factor Authentication (2FA)">
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black">Microsoft Authenticator</span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                isEnabled
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
              }`}>
                {isEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <p className="mt-1 text-[11px] font-medium text-[var(--muted)]">
              {isEnabled
                ? "Your account is protected with TOTP verification."
                : "Add an extra layer of security requiring a code from your Authenticator app."}
            </p>
          </div>

          <div>
            {isEnabled ? (
              <button
                type="button"
                onClick={handleDisable}
                disabled={loading}
                className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-black text-rose-500 hover:bg-rose-500/20 transition cursor-pointer disabled:opacity-50"
              >
                Disable 2FA
              </button>
            ) : !isSetup ? (
              <button
                type="button"
                onClick={handleStartSetup}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-3 py-2 text-xs font-black text-white hover:opacity-90 transition cursor-pointer disabled:opacity-50"
              >
                {loading && <Loader2 size={12} className="animate-spin" />}
                Enable 2FA
              </button>
            ) : null}
          </div>
        </div>

        {isSetup && !isEnabled && (
          <div className="rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-4 space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-start gap-2.5">
              <Smartphone size={18} className="text-[var(--primary)] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-[var(--text)]">Configure Authenticator App</h4>
                <ol className="mt-2 list-decimal list-inside space-y-1.5 text-[11px] font-medium text-[var(--muted)] leading-relaxed">
                  <li>Open <strong className="text-[var(--text)]">Microsoft Authenticator</strong> on your mobile phone.</li>
                  <li>Tap the <strong className="text-[var(--text)]">+ (Add account)</strong> icon and select <strong className="text-[var(--text)]">Other account</strong>.</li>
                  <li>Tap <strong className="text-[var(--text)]">Or enter code manually</strong> at the bottom.</li>
                  <li>Enter account name (e.g. <strong className="text-[var(--text)]">{user?.email}</strong>) and paste the secret key below:</li>
                </ol>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
              <code className="text-xs font-mono font-black tracking-widest text-[var(--primary)] select-all">
                {secretData?.formattedSecret || secretData?.secret}
              </code>
              <button
                type="button"
                onClick={copySecret}
                className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5 text-[11px] font-bold text-[var(--text)] hover:bg-[var(--hover)] transition cursor-pointer shrink-0"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy Key"}
              </button>
            </div>

            <form onSubmit={handleConfirmSetup} className="space-y-3 pt-1">
              <label className="block space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                  Enter 6-Digit Verification Code
                </span>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  required
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--input)] p-3 text-center text-lg font-black tracking-[0.25em] outline-none focus:border-[var(--primary)]/50 transition-colors"
                />
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-xs font-black text-white hover:opacity-90 transition cursor-pointer disabled:opacity-50"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  Verify & Activate 2FA
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsSetup(false);
                    setSecretData(null);
                    setOtp("");
                  }}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-xs font-bold text-[var(--muted)] hover:text-[var(--text)] transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </SettingsPanel>
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

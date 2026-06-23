"use client";

import { useSelector } from "react-redux";
import { BadgeCheck, Calendar, Mail, Shield, UserRound } from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
  const user = useSelector((state) => state.auth.user);

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-4 md:p-8 space-y-6">
      <div className="border-b border-[var(--border)] pb-6">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">Profile</h1>
        <p className="mt-1 text-sm font-medium text-[var(--muted)]">
          Your account identity, access role, and workspace metadata.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-center">
          {/* Avatar Container - Added overflow-hidden */}
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-[var(--primary)] text-3xl font-black text-white overflow-hidden">
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
          </div>

          <h2 className="mt-4 text-xl font-black">{user?.name || "Unknown User"}</h2>
          <p className="mt-1 text-xs font-bold text-[var(--muted)]">{user?.email || "No email available"}</p>

          <span className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--input)] px-3 py-1.5 text-xs font-black capitalize">
            <Shield size={13} className="text-[var(--primary)]" />
            {user?.role || "employee"}
          </span>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-[var(--muted)]">Account Overview</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <ProfileField icon={UserRound} label="Name" value={user?.name || "Not available"} />
            <ProfileField icon={Mail} label="Email" value={user?.email || "Not available"} />
            <ProfileField icon={Shield} label="Role" value={user?.role || "employee"} />
            <ProfileField icon={BadgeCheck} label="Status" value={user?.status || "active"} />
            {/* <ProfileField icon={Calendar} label="User ID" value={user?.id ? `#${user.id}` : "Not available"} /> */}
          </div>
        </div>
      </section>
    </main>
  );
}

function ProfileField({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
      <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
        <Icon size={13} />
        {label}
      </div>
      <p className="text-sm font-black ">{value}</p>
    </div>
  );
}

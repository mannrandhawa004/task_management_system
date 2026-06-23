"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users, Plus, Trash2, ShieldCheck, User, UserMinus } from "lucide-react";

import ConfirmDialog from "../common/ConfirmDialog";
import { getProjectMembersThunk, removeProjectMemberThunk } from "@/features/projects/thunks/projectThunk";
import { showToast } from "@/lib/toast";

export default function ProjectMembersTable({
  members = [],
  loading = false,
  projectId,
  onAddMember,
  canManageMembers,
}) {
  const dispatch = useDispatch();
  const [selectedMember, setSelectedMember] = useState(null);
  const { actionLoading } = useSelector((state) => state.project);

  const handleRemove = async () => {
    if (!selectedMember) return;
    try {
      await dispatch(
        removeProjectMemberThunk({
          projectId,
          userId: selectedMember.member_id,
        })
      ).unwrap();

      await dispatch(getProjectMembersThunk(projectId));
      showToast.success("Member removed successfully");
      setSelectedMember(null);
    } catch (error) {
      showToast.error("Failed to remove member");
    }
  };

  if (loading) {
    return <MembersSkeleton />;
  }

  return (
    <>
      <div
        className="rounded-3xl border overflow-hidden shadow-sm"
        style={{
          background: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        {/* DIRECTORY CONTROLLER HEADER */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center p-6 sm:p-7 border-b" style={{ borderColor: "var(--border)" }}>
          <div>
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2.5" style={{ color: "var(--text)" }}>
              <Users size={20} className="text-[var(--primary)]" />
              Project Workspace Crew
            </h2>
            <p className="mt-1 text-xs font-medium" style={{ color: "var(--muted)" }}>
              Manage and configure directory read/write security credentials.
            </p>
          </div>

          {canManageMembers && (
            <button
              onClick={onAddMember}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold tracking-wide cursor-pointer select-none transition-all duration-200 active:scale-98 hover:opacity-95"
              style={{
                background: "var(--primary)",
                color: "#fff",
              }}
            >
              <Plus size={15} strokeWidth={2.5} />
              Add New Member
            </button>
          )}
        </div>

        {/* CORE DIRECTORY DATA STREAM */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse text-left">
            <thead>
              <tr className="border-b text-xs font-bold uppercase tracking-wider opacity-75" style={{ background: "var(--input)", borderColor: "var(--border)", color: "var(--muted)" }}>
                <th className="px-6 py-4">Identity / Handle</th>
                <th className="px-6 py-4">Access Permission Tier</th>
                <th className="px-6 py-4">Registered In</th>
                {canManageMembers && <th className="px-6 py-4 text-right pr-8">Actions</th>}
              </tr>
            </thead>

            <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
              {members.length > 0 ? (
                members.map((member) => (
                  <tr key={member.id} className="transition-colors hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                    {/* AVATAR IDENTITY INFO BLOCK */}
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-full border border-[var(--border)] flex items-center justify-center shrink-0 opacity-80"
                          style={{ background: "var(--input)", color: "var(--text)" }}
                        >
                          <User size={16} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold tracking-tight truncate" style={{ color: "var(--text)" }}>
                            {member.member_name}
                          </h4>
                          <p className="text-xs truncate" style={{ color: "var(--muted)" }}>
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* DYNAMIC COMPONENT: SECURITY LABELS */}
                    <td className="px-6 py-4.5">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wide border"
                        style={{
                          background: member.role_name === "manager" ? "rgba(37, 99, 235, 0.1)" : "rgba(34, 197, 94, 0.1)",
                          borderColor: member.role_name === "manager" ? "rgba(37, 99, 235, 0.2)" : "rgba(34, 197, 94, 0.2)",
                          color: member.role_name === "manager" ? "#3b82f6" : "#22c55e",
                        }}
                      >
                        <ShieldCheck size={13} strokeWidth={2.5} />
                        {member.role_name}
                      </span>
                    </td>

                    {/* STAMP DATE */}
                    <td className="px-6 py-4.5 text-xs font-semibold" style={{ color: "var(--muted)" }}>
                      {new Date(member.joined_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                    </td>

                    {/* DYNAMIC ACTION TRIGGER BUTTONS */}
                    {canManageMembers && (
                      <td className="px-6 py-4.5 text-right pr-8">
                        <button
                          onClick={() => setSelectedMember(member)}
                          className="inline-flex items-center justify-center p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-all cursor-pointer active:scale-95"
                          title="Revoke Permission Access"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={canManageMembers ? 4 : 3} className="py-20 text-center">
                    <div className="p-4 rounded-full bg-black/5 dark:bg-white/5 inline-block text-[var(--muted)] mb-3">
                      <UserMinus size={26} />
                    </div>
                    <h3 className="text-base font-bold tracking-tight" style={{ color: "var(--text)" }}>
                      No Workspace Members Added
                    </h3>
                    <p className="text-xs max-w-xs mx-auto mt-1" style={{ color: "var(--muted)" }}>
                      Add collaborators to co-manage operational parameters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        loading={actionLoading}
        title="Revoke Access Credentials?"
        message={`Are you sure you want to remove ${selectedMember?.member_name}? They will lose read/write database scope visualization triggers immediately.`}
        onConfirm={handleRemove}
      />
    </>
  );
}

function MembersSkeleton() {
  return (
    <div className="rounded-3xl border p-6 space-y-3.5 animate-pulse" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="flex justify-between items-center pb-4"><div className="h-6 w-1/4 bg-neutral-400/20 rounded-lg" /><div className="h-9 w-24 bg-neutral-400/20 rounded-xl" /></div>
      {[...Array(3)].map((item) => (
        <div key={item} className="h-16 rounded-xl bg-neutral-400/10" />
      ))}
    </div>
  );
}
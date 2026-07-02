"use client";

import { X, Users, Loader2, Check } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { assignTaskThunk } from "@/features/tasks/thunks/taskThunk";
import { showToast } from "@/lib/toast";

function getTwoInitials(name) {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function DrawerMemberAvatar({ member }) {
  const [imgError, setImgError] = useState(false);
  const initials = getTwoInitials(member?.name || member?.member_name);

  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 overflow-hidden bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/20 shadow-2xs">
      {member?.avatar && !imgError ? (
        <img
          src={member.avatar}
          alt={member?.name || "Member"}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

export default function AssignTaskDrawer({ open, onClose, task }) {
    const dispatch = useDispatch();
    const members = useSelector(state => state.project.members || []);

    const assignedUserIds = task?.assigned_users?.filter(Boolean).map(user => user.id) || [];
    const availableMembers = members.filter(member => !assignedUserIds.includes(member.member_id));

    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    if (!open || !task) return null;

    const toggleUser = (id) => {
        setSelectedUsers(prev =>
            prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]
        );
    };

    const handleAssign = async () => {
        if (selectedUsers.length === 0) {
            return showToast.error("Please identify at least one operative.");
        }

        try {
            setLoading(true);
            await dispatch(assignTaskThunk({ taskId: task.id, userIds: selectedUsers })).unwrap();
            showToast.success("Roster credentials assigned safely");
            setSelectedUsers([]);
            onClose();
        } catch (error) {
            showToast.error(error?.message || "Roster distribution linkage failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* AMBIENT DIM CLOAK BACKGROUND */}
            <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200" />

            <aside
                className="relative h-full w-full sm:w-[460px] p-6 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
                style={{ background: "var(--card)", borderLeft: "1px solid var(--border)" }}
            >
                {/* DRAWER TOP BAR */}
                <div className="flex justify-between items-center pb-5 border-b mb-5" style={{ borderColor: "var(--border)" }}>
                    <div>
                        <h2 className="text-base font-bold tracking-tight" style={{ color: "var(--text)" }}>Delegate Task Assignment</h2>
                        <p className="text-xs truncate max-w-[320px] font-medium mt-0.5" style={{ color: "var(--muted)" }}>{task.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg text-[var(--muted)] hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer">
                        <X size={16} />
                    </button>
                </div>

                {/* USER MATRIX CONTENT */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {availableMembers.length > 0 ? (
                        availableMembers.map(member => {
                            const active = selectedUsers.includes(member.member_id);
                            return (
                                <button
                                    key={member.member_id}
                                    type="button"
                                    onClick={() => toggleUser(member.member_id)}
                                    className="w-full p-3 rounded-xl border flex justify-between items-center transition-all text-left cursor-pointer group"
                                    style={{
                                        borderColor: active ? "var(--primary)" : "var(--border)",
                                        background: active ? "var(--hover)" : "var(--input)",
                                    }}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <DrawerMemberAvatar member={member} />
                                        <div className="min-w-0">
                                            <h4 className="text-xs font-bold text-[var(--text)] truncate">{member.name || member.member_name}</h4>
                                            <p className="text-[11px] truncate" style={{ color: "var(--muted)" }}>{member.email}</p>
                                        </div>
                                    </div>

                                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0 ${active ? "bg-[var(--primary)] border-[var(--primary)] text-white" : "border-neutral-400/30"}`}>
                                        {active && <Check size={10} strokeWidth={3} />}
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed rounded-xl" style={{ borderColor: "var(--border)" }}>
                            <Users size={32} className="opacity-30 mb-2" style={{ color: "var(--muted)" }} />
                            <h3 className="font-bold text-xs" style={{ color: "var(--text)" }}>Roster Allocation Cap Reached</h3>
                            <p className="text-[11px] mt-1 max-w-xs" style={{ color: "var(--muted)" }}>All project collaborators are currently integrated into this node's tracking array.</p>
                        </div>
                    )}
                </div>

                {/* DRAWER FOOTER SUBMIT */}
                <div className="pt-5 border-t mt-5 flex justify-end gap-2" style={{ borderColor: "var(--border)" }}>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={loading || selectedUsers.length === 0}
                        onClick={handleAssign}
                        className="px-5 py-2 rounded-xl text-xs font-bold text-white transition active:scale-98 disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
                        style={{ background: "var(--primary)" }}
                    >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} strokeWidth={3} />}
                        Authorize Selection ({selectedUsers.length})
                    </button>
                </div>
            </aside>
        </div>
    );
}
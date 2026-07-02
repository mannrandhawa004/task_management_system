"use client";

import { useState, Fragment } from "react";
import { Trash2, Calendar, UserCheck, Plus, X, ChevronDown, Edit2, Check } from "lucide-react";
import AssignTaskDrawer from "./AssignTaskDrawer";
import ConfirmDialog from "../../components/common/ConfirmDialog";

function getTwoInitials(name) {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function UserAvatar({ user, sizeClass = "w-5 h-5", textClass = "text-[9px]" }) {
  const [imgError, setImgError] = useState(false);
  const initials = getTwoInitials(user?.name);

  return (
    <div className={`relative rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-[var(--primary)]/15 text-[var(--primary)] font-black border border-[var(--primary)]/20 ${sizeClass} ${textClass}`}>
      {user?.avatar && !imgError ? (
        <img
          src={user.avatar}
          alt={user?.name || "User"}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

export default function TaskCard({
  task,
  view = "card",
  isSelected,
  onSelect,
  onDelete,
  onUpdate,
  onUpdateDetails,
  canDelete = true,
  canEdit = true,
  onRemoveMember,
  isRemovingMember = false
}) {
  const [assignOpen, setAssignOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [rosterExpanded, setRosterExpanded] = useState(false);

  // Form states for full task modification payload
  const [editForm, setEditForm] = useState({
    title: task.title,
    description: task.description || "",
    priority: task.priority || "medium",
    due_date: task.due_date ? task.due_date.split("T")[0] : ""
  });

  // Dynamic single-dialog state configuration setup
  const [dialogConfig, setDialogConfig] = useState({
    open: false,
    type: null,
    title: "",
    message: "",
    metaData: null
  });

  const statusConfig = {
    todo: {
      bg: "bg-blue-500/10 dark:bg-blue-400/[0.12]",
      text: "text-blue-600 dark:text-blue-300",
      border: "border-blue-500/20 dark:border-blue-400/20",
      dot: "bg-blue-400",
      label: "TO DO"
    },
    in_progress: {
      bg: "bg-amber-500/10 dark:bg-amber-400/[0.12]",
      text: "text-amber-600 dark:text-amber-300",
      border: "border-amber-500/20 dark:border-amber-400/20",
      dot: "bg-amber-400",
      label: "IN PROGRESS"
    },
    completed: {
      bg: "bg-emerald-500/10 dark:bg-emerald-400/[0.12]",
      text: "text-emerald-600 dark:text-emerald-300",
      border: "border-emerald-500/20 dark:border-emerald-400/20",
      dot: "bg-emerald-400",
      label: "COMPLETED"
    },
  };

  const currentStatus = statusConfig[task.status] || statusConfig.todo;
  const statusOptionsByCurrentStatus = {
    todo: ["todo", "in_progress"],
    in_progress: ["in_progress", "completed"],
    completed: ["completed"],
  };
  const statusOptions = statusOptionsByCurrentStatus[task.status || "todo"] || ["todo"];

  const priorityConfig = {
    low: {
      bg: "bg-emerald-500/10 dark:bg-emerald-400/[0.12]",
      text: "text-emerald-600 dark:text-emerald-300",
      border: "border-emerald-500/20 dark:border-emerald-400/20"
    },
    medium: {
      bg: "bg-amber-500/10 dark:bg-amber-400/[0.12]",
      text: "text-amber-600 dark:text-amber-300",
      border: "border-amber-500/20 dark:border-amber-400/20"
    },
    high: {
      bg: "bg-rose-500/10 dark:bg-rose-400/[0.12]",
      text: "text-rose-600 dark:text-rose-300",
      border: "border-rose-500/20 dark:border-rose-400/20"
    }
  };

  const currentPriority = priorityConfig[task.priority] || priorityConfig.medium;

  const handleStatusChange = (e, newStatus) => {
    e.stopPropagation();
    setStatusDropdownOpen(false);
    if (newStatus === task.status) return;
    onUpdate?.(task.id, { status: newStatus });
  };

  const handleSaveDetails = (e) => {
    e.stopPropagation();
    onUpdateDetails?.(task.id, editForm);
    setIsEditing(false);
  };

  const handleDeleteTaskClick = (e) => {
    e.stopPropagation();
    setDialogConfig({
      open: true,
      type: "delete_task",
      title: "Delete Project Task Entry?",
      message: `Are you absolutely sure you want to permanently delete "${task.title}"? This pipeline node and its data markers cannot be recovered.`,
      metaData: { taskId: task.id }
    });
  };

  const handleRemoveMemberClick = (e, userId, userName) => {
    e.stopPropagation();
    setDialogConfig({
      open: true,
      type: "remove_member",
      title: "Revoke Assignment Authorization",
      message: `Are you sure you want to dismiss ${userName} from the tracking alignment layout for this specific task node?`,
      metaData: { taskId: task.id, userId }
    });
  };

  const handleUnifiedConfirm = () => {
    if (dialogConfig.type === "delete_task") {
      onDelete?.(dialogConfig.metaData.taskId);
    } else if (dialogConfig.type === "remove_member") {
      onRemoveMember?.(dialogConfig.metaData.taskId, dialogConfig.metaData.userId);
    }
    closeDialog();
  };

  const closeDialog = () => {
    setDialogConfig({ open: false, type: null, title: "", message: "", metaData: null });
  };

  const formattedDueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : "Unscheduled";

  // Assigned members collapsible logic
  const assignedUsers = task?.assigned_users?.filter(Boolean) || [];
  const maxVisible = view === "table" ? 1 : 2;
  const hasMore = assignedUsers.length > maxVisible;
  const visibleUsers = rosterExpanded ? assignedUsers : assignedUsers.slice(0, maxVisible);
  const hiddenCount = assignedUsers.length - maxVisible;

  // TABLE VIEW
  if (view === "table") {
    return (
      <Fragment>
        <tr
          onClick={onSelect}
          className={`cursor-pointer transition-colors border-b border-[var(--border)]/60 ${
            isSelected ? "bg-[var(--primary)]/5 dark:bg-[var(--primary)]/[0.08]" : "hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
          }`}
        >
          {/* TASK TITLE & DESC */}
          <td className="px-5 py-4 min-w-[220px] max-w-[320px]">
            {isEditing ? (
              <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full text-xs font-bold bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                />
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full text-[11px] bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-lg px-2.5 py-1 text-[var(--text)] focus:outline-none focus:border-[var(--primary)] min-h-[50px]"
                />
              </div>
            ) : (
              <div>
                <h4 className="font-bold text-sm text-[var(--text)] tracking-tight truncate">
                  {task.title}
                </h4>
                <p className="text-xs text-[var(--muted)] truncate mt-0.5">
                  {task.description || "No description provided."}
                </p>
              </div>
            )}
          </td>

          {/* STATUS */}
          <td className="px-5 py-4 whitespace-nowrap">
            <div className="relative inline-block">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setStatusDropdownOpen(!statusDropdownOpen);
                }}
                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 transition ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot}`} />
                {currentStatus.label}
                <ChevronDown size={11} strokeWidth={2.5} />
              </button>

              {statusDropdownOpen && (
                <div
                  className="absolute left-0 mt-1 w-36 rounded-xl border p-1 shadow-xl z-30"
                  style={{ background: "var(--card)", borderColor: "var(--border)" }}
                >
                  {statusOptions.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={(e) => handleStatusChange(e, key)}
                      className={`w-full text-left px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors ${
                        task.status === key
                          ? "bg-black/10 dark:bg-white/10 text-[var(--primary)]"
                          : "hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text)]"
                      }`}
                    >
                      {statusConfig[key].label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </td>

          {/* PRIORITY */}
          <td className="px-5 py-4 whitespace-nowrap" onClick={(e) => isEditing && e.stopPropagation()}>
            {isEditing ? (
              <select
                value={editForm.priority}
                onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                className="bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-lg px-2 py-1 text-xs uppercase font-bold text-[var(--text)]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            ) : (
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${currentPriority.bg} ${currentPriority.text} ${currentPriority.border}`}>
                • {task.priority}
              </span>
            )}
          </td>

          {/* DUE DATE */}
          <td className="px-5 py-4 whitespace-nowrap text-xs font-semibold text-[var(--muted)]" onClick={(e) => isEditing && e.stopPropagation()}>
            {isEditing ? (
              <input
                type="date"
                value={editForm.due_date}
                onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                className="bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-lg px-2 py-1 text-xs text-[var(--text)]"
              />
            ) : (
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                {formattedDueDate}
              </span>
            )}
          </td>

          {/* ASSIGNED MEMBERS COLLAPSIBLE ROSTER */}
          <td className="px-5 py-4">
            <div
              className={`flex flex-wrap items-center gap-1.5 max-w-[260px] ${hasMore ? "cursor-pointer" : ""}`}
              onClick={(e) => {
                if (hasMore) {
                  e.stopPropagation();
                  setRosterExpanded(!rosterExpanded);
                }
              }}
            >
              {assignedUsers.length > 0 ? (
                <>
                  {visibleUsers.map((user) => (
                    <span
                      key={user.id}
                      className="pl-1 pr-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 bg-black/5 dark:bg-white/5 border border-[var(--border)] text-[var(--text)] shadow-2xs hover:border-[var(--primary)]/40 transition"
                    >
                      <UserAvatar user={user} sizeClass="w-5 h-5" textClass="text-[8px]" />
                      <span className="truncate max-w-[85px]">{user.name}</span>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={(e) => handleRemoveMemberClick(e, user.id, user.name)}
                          className="text-neutral-400 hover:text-rose-500 transition cursor-pointer ml-0.5"
                          title="Remove member"
                        >
                          <X size={11} strokeWidth={3} />
                        </button>
                      )}
                    </span>
                  ))}

                  {!rosterExpanded && hasMore && (
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 hover:bg-[var(--primary)] hover:text-white transition shadow-2xs select-none"
                      title="Click to view all assigned members"
                    >
                      +{hiddenCount} more
                    </span>
                  )}

                  {rosterExpanded && hasMore && (
                    <span
                      className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-black/5 dark:bg-white/5 text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)] transition select-none"
                      title="Click to collapse member list"
                    >
                      Less
                    </span>
                  )}
                </>
              ) : (
                <span className="text-xs italic text-[var(--muted)]">Unassigned</span>
              )}

              {task.status !== "completed" && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAssignOpen(true);
                  }}
                  className="p-1 rounded-md text-[var(--muted)] hover:text-[var(--primary)] hover:bg-black/5 dark:hover:bg-white/5 transition"
                  title="Assign collaborator"
                >
                  <Plus size={14} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </td>

          {/* ACTIONS */}
          <td className="px-5 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-end gap-1.5">
              {canEdit && (
                isEditing ? (
                  <button
                    type="button"
                    onClick={handleSaveDetails}
                    className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition cursor-pointer"
                    title="Save Changes"
                  >
                    <Check size={14} strokeWidth={2.5} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--primary)] hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                    title="Edit Task"
                  >
                    <Edit2 size={14} />
                  </button>
                )
              )}

              {canDelete && task.status !== "completed" && !isEditing && (
                <button
                  type="button"
                  onClick={handleDeleteTaskClick}
                  className="p-1.5 rounded-lg text-[var(--muted)] hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                  title="Delete Task"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </td>
        </tr>

        {/* EXPANDED ROW DETAILS (WHEN SELECTED IN TABLE) */}
        {isSelected && (
          <tr className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-[var(--border)]">
            <td colSpan={6} className="px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-[var(--muted)]">
                  <UserCheck size={14} className="text-[var(--primary)]" />
                  <span>Created by: <strong className="text-[var(--text)]">{task.created_by?.name || "System"}</strong></span>
                </div>
                {task.status !== "completed" && !isEditing && (
                  <button
                    type="button"
                    onClick={() => setAssignOpen(true)}
                    className="px-3 py-1.5 rounded-xl font-bold tracking-wide text-white bg-[var(--primary)] hover:opacity-95 transition cursor-pointer w-fit"
                  >
                    + Assign Team Member
                  </button>
                )}
              </div>
            </td>
          </tr>
        )}

        {task.status !== "completed" && (
          <AssignTaskDrawer open={assignOpen} onClose={() => setAssignOpen(false)} task={task} />
        )}
        <ConfirmDialog
          open={dialogConfig.open}
          onClose={closeDialog}
          onConfirm={handleUnifiedConfirm}
          title={dialogConfig.title}
          message={dialogConfig.message}
          loading={dialogConfig.type === "remove_member" ? isRemovingMember : false}
        />
      </Fragment>
    );
  }

  // CARD VIEW
  return (
    <>
      <article
        onClick={onSelect}
        className="rounded-2xl p-5 border cursor-pointer transition-all duration-200 ease-in-out hover:shadow-md transform-gpu relative overflow-hidden group"
        style={{
          background: "var(--card)",
          color: "var(--text)",
          borderColor: isSelected ? "var(--primary)" : "var(--border)",
          boxShadow: "var(--shadow)",
        }}
      >
        {/* Top accent line */}
        <div className={`h-1 w-full absolute top-0 left-0 transition-opacity ${isSelected ? "opacity-100 bg-[var(--primary)]" : "opacity-0 group-hover:opacity-40 bg-[var(--primary)]"}`} />

        {/* STRUCTURAL INTERACTION LAYER */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0 w-full">
            {isEditing ? (
              <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full text-base font-bold bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-lg px-3 py-1.5 text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                />
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full text-xs bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-lg px-3 py-1.5 text-[var(--text)] focus:outline-none focus:border-[var(--primary)] min-h-[60px]"
                />
              </div>
            ) : (
              <>
                <h3 className="text-base font-bold tracking-tight text-[var(--text)] truncate">{task.title}</h3>
                <p className="text-xs leading-relaxed line-clamp-2 mt-1" style={{ color: "var(--muted)" }}>
                  {task.description || "No supplemental details provided for this work item node."}
                </p>
              </>
            )}
          </div>

          {/* INTERACTIVE STATUS BADGE DROPDOWN */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setStatusDropdownOpen(!statusDropdownOpen);
              }}
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 transition ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot}`} />
              {currentStatus.label}
              <ChevronDown size={11} strokeWidth={2.5} />
            </button>

            {statusDropdownOpen && (
              <div
                className="absolute right-0 mt-1 w-36 rounded-xl border p-1 shadow-xl z-20"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                {statusOptions.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={(e) => handleStatusChange(e, key)}
                    className={`w-full text-left px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors ${
                      task.status === key
                        ? "bg-black/10 dark:bg-white/10 text-[var(--primary)]"
                        : "hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text)]"
                    }`}
                  >
                    {statusConfig[key].label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* METRICS ROW FOOTPRINT */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold" onClick={(e) => isEditing && e.stopPropagation()}>
          {isEditing ? (
            <div className="flex items-center gap-3 w-full">
              <div className="flex items-center gap-1.5">
                <Calendar size={13} style={{ color: "var(--muted)" }} />
                <input
                  type="date"
                  value={editForm.due_date}
                  onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                  className="bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-lg px-2 py-1 text-[var(--text)] text-[11px]"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span style={{ color: "var(--muted)" }}>Priority:</span>
                <select
                  value={editForm.priority}
                  onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                  className="bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-lg px-2 py-1 text-[var(--text)] text-[11px] uppercase font-bold"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          ) : (
            <>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5" style={{ color: "var(--muted)" }}>
                <Calendar size={13} />
                Due: {formattedDueDate}
              </span>
              <span className={`px-2.5 py-1 rounded-lg uppercase tracking-wider font-bold ${currentPriority.bg} ${currentPriority.text}`}>
                • {task.priority} Priority
              </span>
            </>
          )}
        </div>

        {/* ASSIGNED TEAM COLLAPSIBLE ROSTER */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between gap-2" style={{ borderColor: "var(--border)" }}>
          <div
            className={`flex items-center gap-1.5 overflow-hidden flex-wrap ${hasMore ? "cursor-pointer" : ""}`}
            onClick={(e) => {
              if (hasMore) {
                e.stopPropagation();
                setRosterExpanded(!rosterExpanded);
              }
            }}
          >
            {assignedUsers.length > 0 ? (
              <>
                {visibleUsers.map((user) => (
                  <span
                    key={user.id}
                    className="group relative pl-1 pr-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition bg-black/5 dark:bg-white/5 border border-[var(--border)] text-[var(--text)] shadow-2xs hover:border-[var(--primary)]/40"
                  >
                    <UserAvatar user={user} sizeClass="w-5 h-5" textClass="text-[8px]" />
                    <span className="truncate max-w-[90px] font-bold">{user.name}</span>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={(e) => handleRemoveMemberClick(e, user.id, user.name)}
                        className="text-neutral-400 hover:text-rose-500 transition cursor-pointer text-[10px] ml-0.5"
                        title="Remove member"
                      >
                        <X size={11} strokeWidth={3} />
                      </button>
                    )}
                  </span>
                ))}

                {!rosterExpanded && hasMore && (
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 hover:bg-[var(--primary)] hover:text-white transition shadow-2xs select-none"
                    title="Click to view all assigned members"
                  >
                    +{hiddenCount} more
                  </span>
                )}

                {rosterExpanded && hasMore && (
                  <span
                    className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-black/5 dark:bg-white/5 text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)] transition select-none"
                    title="Click to collapse member list"
                  >
                    Less
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs italic text-[var(--muted)]">Unassigned Roster</span>
            )}

            {!isSelected && task.status !== "completed" && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setAssignOpen(true); }}
                className="p-1 rounded-md text-[var(--muted)] hover:text-[var(--primary)] hover:bg-black/5 dark:hover:bg-white/5 transition"
                title="Assign member"
              >
                <Plus size={14} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* EXPANDED ACCORDION LAYER */}
        {isSelected && (
          <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-1.5 text-[var(--muted)]">
              <UserCheck size={14} className="text-[var(--primary)]" />
              Owner: <strong className="text-[var(--text)] font-semibold">{task.created_by?.name || "System"}</strong>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
              {canEdit && (
                isEditing ? (
                  <button
                    type="button"
                    onClick={handleSaveDetails}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl font-bold tracking-wide text-white bg-emerald-600 hover:bg-emerald-700 transition active:scale-98 cursor-pointer shadow-xs"
                  >
                    <Check size={13} /> Save
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl font-bold tracking-wide border border-[var(--border)] text-[var(--text)] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition active:scale-98 cursor-pointer"
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                )
              )}

              {task.status !== "completed" && !isEditing && (
                <button
                  type="button"
                  onClick={() => setAssignOpen(true)}
                  className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl font-bold tracking-wide text-white transition active:scale-98 cursor-pointer shadow-xs"
                  style={{ background: "var(--primary)" }}
                >
                  Assign member
                </button>
              )}

              {canDelete && task.status !== "completed" && !isEditing && (
                <button
                  type="button"
                  onClick={handleDeleteTaskClick}
                  className="px-3 py-1.5 rounded-xl font-bold tracking-wide bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition active:scale-98 cursor-pointer"
                >
                  Delete Task
                </button>
              )}
            </div>
          </div>
        )}
      </article>

      {task.status !== "completed" && (
        <AssignTaskDrawer open={assignOpen} onClose={() => setAssignOpen(false)} task={task} />
      )}
      <ConfirmDialog
        open={dialogConfig.open}
        onClose={closeDialog}
        onConfirm={handleUnifiedConfirm}
        title={dialogConfig.title}
        message={dialogConfig.message}
        loading={dialogConfig.type === "remove_member" ? isRemovingMember : false}
      />
    </>
  );
}

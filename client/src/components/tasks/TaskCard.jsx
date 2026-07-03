"use client";

import { useState, Fragment } from "react";
import { Trash2, Calendar, UserCheck, Plus, X, ChevronDown, Edit2, Check, Activity, Clock, Shield } from "lucide-react";
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

function UserAvatar({ user, sizeClass = "w-8 h-8", textClass = "text-xs", borderClass = "border-2 border-[var(--card)]" }) {
  const [imgError, setImgError] = useState(false);
  const avatarUrl =
    user?.avatar ||
    user?.profile_picture ||
    user?.user_avatar ||
    user?.image ||
    user?.photo ||
    user?.user?.avatar ||
    user?.user?.profile_picture ||
    user?.user?.image;
  const displayName = user?.name || user?.user?.name || user?.username || user?.email || "User";
  const initials = getTwoInitials(displayName);

  return (
    <div className={`relative rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 font-black shadow-2xs ${borderClass} ${sizeClass} ${textClass}`} title={displayName}>
      {avatarUrl && !imgError ? (
        <img
          src={avatarUrl}
          alt={displayName}
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
      dot: "bg-blue-500",
      label: "TO DO",
      accent: "#3b82f6"
    },
    in_progress: {
      bg: "bg-amber-500/10 dark:bg-amber-400/[0.12]",
      text: "text-amber-600 dark:text-amber-300",
      border: "border-amber-500/20 dark:border-amber-400/20",
      dot: "bg-amber-500",
      label: "IN PROGRESS",
      accent: "#f59e0b"
    },
    completed: {
      bg: "bg-emerald-500/10 dark:bg-emerald-400/[0.12]",
      text: "text-emerald-600 dark:text-emerald-300",
      border: "border-emerald-500/20 dark:border-emerald-400/20",
      dot: "bg-emerald-500",
      label: "COMPLETED",
      accent: "#10b981"
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
      border: "border-emerald-500/20 dark:border-emerald-400/20",
      label: "Low",
      iconBg: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
    },
    medium: {
      bg: "bg-blue-500/10 dark:bg-blue-400/[0.12]",
      text: "text-blue-600 dark:text-blue-300",
      border: "border-blue-500/20 dark:border-blue-400/20",
      label: "Medium",
      iconBg: "bg-blue-500/12 text-blue-600 dark:text-blue-400"
    },
    high: {
      bg: "bg-rose-500/10 dark:bg-rose-400/[0.12]",
      text: "text-rose-600 dark:text-rose-300",
      border: "border-rose-500/20 dark:border-rose-400/20",
      label: "High",
      iconBg: "bg-rose-500/12 text-rose-600 dark:text-rose-400"
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
    : "No deadline";

  // Assigned members logic
  const assignedUsers = task?.assigned_users?.filter(Boolean) || [];
  const maxVisible = 3;
  const hasMore = assignedUsers.length > maxVisible;
  const visibleUsers = rosterExpanded ? assignedUsers : assignedUsers.slice(0, maxVisible);
  const hiddenCount = assignedUsers.length - maxVisible;
  const projectName = task.project?.name || task.projectName;

  // ════════════════════════════════════════════════════════════════════════════
  // TABLE VIEW
  // ════════════════════════════════════════════════════════════════════════════
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
          <td className="px-5 py-4 min-w-[280px]">
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
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${currentPriority.iconBg}`}>
                  <Activity size={15} strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-[13px] text-[var(--text)] tracking-tight leading-snug">
                    {task.title}
                  </h4>
                  {projectName && (
                    <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06] text-[10px] font-semibold text-[var(--muted)]">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: currentStatus.accent }} />
                      {projectName}
                    </span>
                  )}
                  {task.description && (
                    <p className="text-[11px] text-[var(--muted)] mt-1 font-medium leading-relaxed line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>
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
                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 transition cursor-pointer ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border}`}
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
                      className={`w-full text-left px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
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
                {currentPriority.label}
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
                <Clock size={13} className="text-[var(--muted)]" />
                {formattedDueDate}
              </span>
            )}
          </td>

          {/* CIRCULAR OVERLAPPING AVATARS (COLLAPSIBLE / EXPANDABLE) */}
          <td className="px-5 py-4">
            <div className="flex items-center">
              {!rosterExpanded ? (
                /* Collapsed Circular Overlapping View */
                <div
                  className="flex items-center -space-x-2 cursor-pointer group"
                  onClick={(e) => {
                    if (assignedUsers.length > 0) {
                      e.stopPropagation();
                      setRosterExpanded(true);
                    }
                  }}
                  title="Click to view all team members"
                >
                  {assignedUsers.length > 0 ? (
                    <>
                      {visibleUsers.map((user) => (
                        <UserAvatar key={user.id} user={user} sizeClass="w-8 h-8" textClass="text-[10px]" borderClass="border-2 border-[var(--card)]" />
                      ))}
                      {hasMore && (
                        <div className="w-8 h-8 rounded-full border-2 border-[var(--card)] bg-neutral-200 dark:bg-neutral-800 text-[var(--text)] font-black text-[10px] flex items-center justify-center shrink-0 z-10">
                          +{hiddenCount}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-[11px] text-[var(--muted)] font-medium">Unassigned</span>
                  )}
                </div>
              ) : (
                /* Expanded Roster View */
                <div
                  className="flex flex-wrap items-center gap-1.5 max-w-[260px] cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); setRosterExpanded(false); }}
                  title="Click to fold member list"
                >
                  {assignedUsers.map((user) => (
                    <span
                      key={user.id}
                      className="pl-1 pr-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 bg-black/5 dark:bg-white/5 border border-[var(--border)] text-[var(--text)] shadow-2xs"
                    >
                      <UserAvatar user={user} sizeClass="w-5 h-5" textClass="text-[8px]" borderClass="border border-[var(--border)]" />
                      <span className="truncate max-w-[75px]">{user.name}</span>
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
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-black/10 dark:bg-white/10 text-[var(--text)]">Less</span>
                </div>
              )}

              {/* Purple circular + button */}
              {task.status !== "completed" && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAssignOpen(true);
                  }}
                  className="w-8 h-8 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center border-2 border-[var(--card)] shadow-xs transition hover:scale-105 shrink-0 ml-1 cursor-pointer"
                  title="Assign collaborator"
                >
                  <Plus size={15} strokeWidth={3} />
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
            <td colSpan={6} className="px-6 py-3">
              <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <UserCheck size={13} className="text-[var(--primary)]" />
                <span>Created by: <strong className="text-[var(--text)] font-semibold">{task.created_by?.name || "System"}</strong></span>
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

  // ════════════════════════════════════════════════════════════════════════════
  // CARD VIEW — Clean, consistent premium design
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <>
      <article
        onClick={onSelect}
        className={`relative overflow-hidden rounded-2xl border bg-[var(--card)] cursor-pointer transition-all duration-200 hover:shadow-md group ${
          isSelected
            ? "border-[var(--primary)] ring-1 ring-[var(--primary)]/30 shadow-md"
            : "border-[var(--border)] shadow-sm hover:border-[var(--border)]"
        }`}
      >
        {/* Accent stripe on left edge */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
          style={{ background: currentStatus.accent }}
        />

        <div className="p-5 pl-6">
          {/* Row 1: Title + Due date */}
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0 flex-1">
              {isEditing ? (
                <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full text-sm font-bold bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-xl px-3 py-1.5 text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                  />
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full text-xs bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-xl px-3 py-1.5 text-[var(--text)] focus:outline-none focus:border-[var(--primary)] min-h-[60px]"
                  />
                </div>
              ) : (
                <>
                  <h3 className="text-[15px] font-bold tracking-tight text-[var(--text)] leading-snug">
                    {task.title}
                  </h3>
                  {projectName && (
                    <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-[10px] font-semibold text-[var(--muted)]">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: currentStatus.accent }} />
                      {projectName}
                    </div>
                  )}
                  {task.description && (
                    <p className="text-[13px] font-medium leading-relaxed mt-2 text-[var(--muted)]">
                      {task.description}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Due date badge top right */}
            <div className="shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] bg-black/[0.04] dark:bg-white/[0.06] px-2 py-1 rounded-lg flex items-center gap-1">
                <Clock size={10} />
                {formattedDueDate}
              </span>
            </div>
          </div>

          {/* Edit fields for priority & due date when editing */}
          {isEditing && (
            <div className="mt-3 flex flex-wrap items-center gap-3 p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-[var(--border)]/60 text-xs font-semibold" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                <span className="text-[var(--muted)]">Due:</span>
                <input
                  type="date"
                  value={editForm.due_date}
                  onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-2 py-1 text-[var(--text)]"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--muted)]">Priority:</span>
                <select
                  value={editForm.priority}
                  onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-2 py-1 text-[var(--text)] uppercase font-bold"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          )}

          {/* Row 2: Bottom bar — Avatars + Priority + Status */}
          <div className="mt-4 pt-3 border-t border-[var(--border)]/50 flex items-center justify-between gap-2 flex-wrap">
            {/* Left: Avatars */}
            <div className="flex items-center">
              {!rosterExpanded ? (
                <div
                  className="flex items-center -space-x-2 cursor-pointer"
                  onClick={(e) => {
                    if (assignedUsers.length > 0) {
                      e.stopPropagation();
                      setRosterExpanded(true);
                    }
                  }}
                  title="Click to expand assigned members"
                >
                  {assignedUsers.length > 0 ? (
                    <>
                      {visibleUsers.map((user) => (
                        <UserAvatar key={user.id} user={user} sizeClass="w-8 h-8" textClass="text-[10px]" borderClass="border-2 border-[var(--card)]" />
                      ))}
                      {hasMore && (
                        <div className="w-8 h-8 rounded-full border-2 border-[var(--card)] bg-neutral-200 dark:bg-neutral-700 text-[var(--text)] font-bold text-[10px] flex items-center justify-center shrink-0 z-10">
                          +{hiddenCount}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-[11px] text-[var(--muted)] font-medium">Unassigned</span>
                  )}
                </div>
              ) : (
                <div
                  className="flex flex-wrap items-center gap-1.5 cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); setRosterExpanded(false); }}
                  title="Click to collapse"
                >
                  {assignedUsers.map((user) => (
                    <span
                      key={user.id}
                      className="pl-0.5 pr-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 bg-black/[0.04] dark:bg-white/[0.06] border border-[var(--border)] text-[var(--text)]"
                    >
                      <UserAvatar user={user} sizeClass="w-5 h-5" textClass="text-[8px]" borderClass="border border-[var(--border)]" />
                      <span className="truncate max-w-[80px]">{user.name}</span>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={(e) => handleRemoveMemberClick(e, user.id, user.name)}
                          className="text-neutral-400 hover:text-rose-500 transition cursor-pointer"
                          title="Remove member"
                        >
                          <X size={10} strokeWidth={3} />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              )}

              {/* Assign button */}
              {task.status !== "completed" && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setAssignOpen(true); }}
                  className="w-8 h-8 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center border-2 border-[var(--card)] shadow-xs transition hover:scale-105 shrink-0 ml-1 cursor-pointer"
                  title="Assign collaborator"
                >
                  <Plus size={14} strokeWidth={3} />
                </button>
              )}
            </div>

            {/* Right: Priority badge + Status dropdown */}
            <div className="flex items-center gap-2">
              {/* Priority badge — only show when NOT editing */}
              {!isEditing && (
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border ${currentPriority.bg} ${currentPriority.text} ${currentPriority.border}`}>
                  {currentPriority.label}
                </span>
              )}

              {/* Status Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatusDropdownOpen(!statusDropdownOpen);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 transition cursor-pointer ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot}`} />
                  {currentStatus.label}
                  <ChevronDown size={10} strokeWidth={2.5} />
                </button>

                {statusDropdownOpen && (
                  <div
                    className="absolute right-0 bottom-full mb-1 w-36 rounded-xl border p-1 shadow-xl z-30"
                    style={{ background: "var(--card)", borderColor: "var(--border)" }}
                  >
                    {statusOptions.map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={(e) => handleStatusChange(e, key)}
                        className={`w-full text-left px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
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
          </div>

          {/* EXPANDED SECTION (WHEN CARD IS CLICKED) */}
          {isSelected && (
            <div className="mt-3 pt-3 border-t border-[var(--border)]/50 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-[var(--muted)]">
                <UserCheck size={13} className="text-[var(--primary)]" />
                Owner: <strong className="text-[var(--text)] font-semibold">{task.created_by?.name || "System"}</strong>
              </div>

              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                {canEdit && (
                  isEditing ? (
                    <button
                      type="button"
                      onClick={handleSaveDetails}
                      className="h-8 w-8 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition active:scale-95 cursor-pointer"
                      title="Save changes"
                    >
                      <Check size={15} strokeWidth={2.5} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="h-8 w-8 rounded-xl flex items-center justify-center text-[var(--muted)] hover:text-[var(--primary)] hover:bg-black/5 dark:hover:bg-white/5 transition active:scale-95 cursor-pointer"
                      title="Edit task"
                    >
                      <Edit2 size={15} />
                    </button>
                  )
                )}

                {canDelete && task.status !== "completed" && !isEditing && (
                  <button
                    type="button"
                    onClick={handleDeleteTaskClick}
                    className="h-8 w-8 rounded-xl flex items-center justify-center text-[var(--muted)] hover:text-rose-500 hover:bg-rose-500/10 transition active:scale-95 cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
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

"use client";

import { useState } from "react";
import { Trash2, Calendar, UserCheck, Plus, X, ChevronDown, Edit2, Check } from "lucide-react";
import AssignTaskDrawer from "./AssignTaskDrawer";
import ConfirmDialog from "../../components/common/ConfirmDialog";

export default function TaskCard({
  task,
  isSelected,
  onSelect,
  onDelete,
  onUpdate,
  onUpdateDetails, // New callback explicitly for handling complex thunk payload updates
  canDelete = true,
  canEdit = true, // Control visibility based on user role (Admin/Manager) Passed from parent
  onRemoveMember,
  isRemovingMember = false
}) {
  const [assignOpen, setAssignOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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
    todo: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20", label: "TODO" },
    in_progress: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20", label: "IN PROGRESS" },
    completed: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", label: "COMPLETED" },
  };

  const currentStatus = statusConfig[task.status] || statusConfig.todo;
  const statusOptionsByCurrentStatus = {
    todo: ["todo", "in_progress"],
    in_progress: ["in_progress", "completed"],
    completed: ["completed"],
  };
  const statusOptions = statusOptionsByCurrentStatus[task.status || "todo"] || ["todo"];

  const priorityConfig = {
    low: { bg: "bg-emerald-500/10", text: "text-emerald-500" },
    medium: { bg: "bg-amber-500/10", text: "text-amber-500" },
    high: { bg: "bg-red-500/10", text: "text-red-500" }
  };

  const currentPriority = priorityConfig[task.priority] || priorityConfig.medium;

  const handleStatusChange = (e, newStatus) => {
    e.stopPropagation();
    setStatusDropdownOpen(false);
    if (newStatus === task.status) return;

    onUpdate?.(task.id, { status: newStatus });
  };

  // Submit compiled data to updateTaskThunk via parent layer
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

  return (
    <>
      <article
        onClick={onSelect}
        className="rounded-2xl p-5 border cursor-pointer transition-all duration-200 ease-in-out hover:border-neutral-400/40 transform-gpu relative"
        style={{
          background: "var(--card)",
          color: "var(--text)",
          borderColor: isSelected ? "var(--primary)" : "var(--border)",
          boxShadow: "var(--shadow)",
        }}
      >
        {/* STRUCTURAL INTERACTION LAYER */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0 w-full">
            {isEditing ? (
              <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full text-base font-bold bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-lg px-3 py-1 text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
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
                <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--muted)" }}>
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
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 hover:brightness-95 dark:hover:brightness-110 transition ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border}`}
            >
              {currentStatus.label}
              <ChevronDown size={10} strokeWidth={2.5} />
            </button>

            {statusDropdownOpen && (
              <div
                className="absolute right-0 mt-1 w-36 rounded-xl border p-1 shadow-lg z-20"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                {statusOptions.map((key) => {
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={(e) => handleStatusChange(e, key)}
                      className={`w-full text-left px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors ${task.status === key ? "bg-neutral-100 dark:bg-neutral-800" : "hover:bg-neutral-50 dark:hover:bg-neutral-900"}`}
                      style={{ color: task.status === key ? "var(--primary)" : "var(--text)" }}
                    >
                      {statusConfig[key].label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* METRICS ROW FOOTPRINT */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold" onClick={(e) => isEditing && e.stopPropagation()}>
          {isEditing ? (
            <div className="flex items-center gap-3 w-full">
              <div className="flex items-center gap-1.5">
                <Calendar size={12} style={{ color: "var(--muted)" }} />
                <input
                  type="date"
                  value={editForm.due_date}
                  onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                  className="bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-md px-2 py-0.5 text-[var(--text)] text-[11px]"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span style={{ color: "var(--muted)" }}>Priority:</span>
                <select
                  value={editForm.priority}
                  onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                  className="bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-md px-2 py-0.5 text-[var(--text)] text-[11px] uppercase"
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
                <Calendar size={12} />
                Due: {task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Unscheduled"}
              </span>
              <span className={`px-2.5 py-1 rounded-lg uppercase tracking-wide ${currentPriority.bg} ${currentPriority.text}`}>
                • {task.priority} Priority
              </span>
            </>
          )}
        </div>

        {/* ASSIGNED TEAM ROSTER */}
        <div className="mt-5 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-hidden">
              {task?.assigned_users?.length > 0 ? (
                task.assigned_users.filter(Boolean).map((user) => (
                  <span
                    key={user.id}
                    className="group relative px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition bg-black/5 dark:bg-white/5 border border-[var(--border)]"
                    style={{ color: "var(--text)" }}
                  >
                    <span className="truncate max-w-[90px]">{user.name?.split(" ")[0]}</span>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveMemberClick(e, user.id, user.name)}
                      className="text-red-500 hover:text-red-600 transition-opacity cursor-pointer text-[10px]"
                      title="De-authorize user assignation"
                    >
                      <X size={10} strokeWidth={3} />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-xs italic" style={{ color: "var(--muted)" }}>Unassigned Roster</span>
              )}
            </div>

            {!isSelected && task.status !== "completed" && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setAssignOpen(true); }}
                className="p-1 rounded-md text-[var(--muted)] hover:text-[var(--primary)] hover:bg-black/5 dark:hover:bg-white/5 transition"
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
              <UserCheck size={13} />
              Owner: <strong className="text-[var(--text)] font-semibold">{task.created_by?.name || "System"}</strong>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
              {/* Dynamic Action Buttons based on authorization level */}
              {canEdit && (
                isEditing ? (
                  <button
                    type="button"
                    onClick={handleSaveDetails}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg font-bold tracking-wide text-white bg-emerald-600 hover:bg-emerald-700 transition active:scale-98 cursor-pointer"
                  >
                    <Check size={13} /> Save
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg font-bold tracking-wide border border-[var(--border)] text-[var(--text)] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition active:scale-98 cursor-pointer"
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                )
              )}

              {task.status !== "completed" && !isEditing && (
                <button
                  type="button"
                  onClick={() => setAssignOpen(true)}
                  className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-bold tracking-wide text-white transition active:scale-98 cursor-pointer"
                  style={{ background: "var(--primary)" }}
                >
                  Assign member
                </button>
              )}

              {canDelete && task.status !== "completed" && !isEditing && (
                <button
                  type="button"
                  onClick={handleDeleteTaskClick}
                  className="px-3 py-1.5 rounded-lg font-bold tracking-wide bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition active:scale-98 cursor-pointer"
                >
                  Delete Task
                </button>
              )}
            </div>
          </div>
        )}
      </article>

      {/* ASSIGNMENT DRAWER NODE */}
      {task.status !== "completed" && (
        <AssignTaskDrawer open={assignOpen} onClose={() => setAssignOpen(false)} task={task} />
      )}

      {/* UNIFIED DIALOG ROUTER INJECTION */}
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

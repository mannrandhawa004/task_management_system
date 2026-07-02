"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Building2, Users, FolderKanban, CheckCircle, Plus, Edit2, Trash2, X,
  Save, Briefcase, TrendingUp, LayoutGrid, List, Shield,
} from "lucide-react";
import {
  getDepartmentsThunk, createDepartmentThunk, updateDepartmentThunk,
  deleteDepartmentThunk, getDepartmentUsersThunk, getDepartmentStatsThunk,
} from "@/features/departments/thunks/departmentThunks";
import AppLoader from "@/components/common/AppLoader";
import ConfirmDialog from "@/components/common/ConfirmDialog";

// ── Dark-aware status badge ───────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = status === "active"
    ? { bg: "bg-emerald-500/10 dark:bg-emerald-400/[0.12]", text: "text-emerald-600 dark:text-emerald-300", border: "border-emerald-500/20 dark:border-emerald-400/20", dot: "bg-emerald-400" }
    : { bg: "bg-neutral-500/10 dark:bg-neutral-400/[0.10]", text: "text-neutral-500 dark:text-neutral-400", border: "border-neutral-500/20 dark:border-neutral-400/20", dot: "bg-neutral-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

// ── Re-usable form field ──────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 border border-[var(--border)] rounded-xl bg-[var(--hover)]/30 dark:bg-white/[0.04] text-xs font-bold text-[var(--text)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 transition-all placeholder:text-[var(--muted)]";

// ── Modal shell ───────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, subtitle, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-[var(--bg)] border border-[var(--border)] shadow-2xl rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm text-[var(--text)]">{title}</h3>
            {subtitle && <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>
        {/* Body */}
        <div className="p-6 space-y-4">{children}</div>
        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-[var(--border)] bg-black/[0.02] dark:bg-white/[0.02] flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function DepartmentsPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { departmentsList, departmentUsers, departmentStats, loading } = useSelector((s) => s.departments);

  const [viewMode, setViewMode]       = useState("card"); // "card" | "table"
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen]     = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [name, setName]             = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus]         = useState("active");
  const [selectedId, setSelectedId] = useState(null);

  const isSuperAdmin = user?.role?.toLowerCase() === "super_admin";

  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: "", message: "", confirmLabel: "Confirm", onConfirm: null });
  const closeConfirm = () => setConfirmDialog((p) => ({ ...p, open: false, onConfirm: null }));

  useEffect(() => { dispatch(getDepartmentsThunk({ page: 1, limit: 100 })); }, [dispatch]);

  const handleCreate = () => {
    dispatch(createDepartmentThunk({ name, description, status })).then(() => { setIsCreateOpen(false); resetForm(); });
  };
  const handleUpdate = () => {
    dispatch(updateDepartmentThunk({ id: selectedId, data: { name, description, status } })).then(() => { setIsEditOpen(false); resetForm(); });
  };
  const handleDelete = (id) => {
    setConfirmDialog({
      open: true, title: "Delete Department",
      message: "Are you sure you want to delete this department? All associated teams and data will be affected.",
      confirmLabel: "Delete",
      onConfirm: () => { dispatch(deleteDepartmentThunk(id)); closeConfirm(); },
    });
  };
  const handleOpenDetails = (dept) => {
    setSelectedId(dept.id); setName(dept.name);
    dispatch(getDepartmentUsersThunk(dept.id));
    dispatch(getDepartmentStatsThunk(dept.id));
    setIsDetailsOpen(true);
  };
  const handleOpenEdit = (dept, e) => {
    e?.stopPropagation();
    setSelectedId(dept.id); setName(dept.name); setDescription(dept.description || ""); setStatus(dept.status || "active");
    setIsEditOpen(true);
  };
  const resetForm = () => { setName(""); setDescription(""); setStatus("active"); setSelectedId(null); };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full text-[var(--text)]">

      {/* ── PAGE HEADER CARD ── */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1.5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
              <Building2 size={15} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]">Admin Panel</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[var(--text)]">Department Management</h1>
          <p className="mt-1 text-xs md:text-sm font-medium text-[var(--muted)] max-w-xl">
            Create, view, and organize operational department layers across the company.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3 shrink-0">
          {/* View toggle */}
          <div className="flex items-center gap-1 bg-black/[0.03] dark:bg-white/[0.03] p-1 rounded-2xl border border-[var(--border)]">
            <button
              onClick={() => setViewMode("card")}
              className={`p-2 rounded-xl transition-all cursor-pointer ${viewMode === "card" ? "bg-[var(--card)] text-[var(--primary)] shadow-sm border border-[var(--border)]" : "text-[var(--muted)] hover:text-[var(--text)]"}`}
              title="Card View"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-xl transition-all cursor-pointer ${viewMode === "table" ? "bg-[var(--card)] text-[var(--primary)] shadow-sm border border-[var(--border)]" : "text-[var(--muted)] hover:text-[var(--text)]"}`}
              title="Table View"
            >
              <List size={14} />
            </button>
          </div>

          {isSuperAdmin && (
            <button
              onClick={() => { resetForm(); setIsCreateOpen(true); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm text-white hover:opacity-90 hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer shadow-sm"
              style={{ background: "var(--primary)" }}
            >
              <Plus size={16} />
              Add Department
            </button>
          )}
        </div>
      </div>

      {/* ── LOADING ── */}
      {loading && (
        <div className="flex justify-center py-16">
          <AppLoader />
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!loading && (!departmentsList || departmentsList.length === 0) && (
        <div className="flex flex-col items-center justify-center py-20 bg-[var(--card)] border border-dashed border-[var(--border)] rounded-3xl">
          <div className="p-4 bg-[var(--primary)]/10 rounded-2xl mb-4 text-[var(--primary)]"><Building2 size={28} /></div>
          <h3 className="font-black text-base text-[var(--text)]">No Departments Yet</h3>
          <p className="text-xs text-[var(--muted)] mt-1">Create your first department to get started.</p>
        </div>
      )}

      {/* ══════════════ CARD VIEW ══════════════ */}
      {!loading && departmentsList?.length > 0 && viewMode === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departmentsList.map((dept) => (
            <div
              key={dept.id}
              onClick={() => handleOpenDetails(dept)}
              className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col group"
            >
              {/* Top accent */}
              <div className="h-[3px] bg-gradient-to-r from-[var(--primary)] via-[var(--primary)]/40 to-transparent" />

              <div className="p-5 flex-1 flex flex-col gap-4">
                {/* Icon row + status */}
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-2xl group-hover:scale-105 transition-transform">
                    <Building2 size={20} />
                  </div>
                  <StatusBadge status={dept.status} />
                </div>

                {/* Name + description */}
                <div>
                  <h3 className="font-black text-sm tracking-tight text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                    {dept.name}
                  </h3>
                  <p className="text-[11px] text-[var(--muted)] line-clamp-2 mt-1 leading-relaxed">
                    {dept.description || "No description provided."}
                  </p>
                </div>

                {/* Stats strip */}
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <div className="flex items-center gap-2 bg-black/[0.03] dark:bg-white/[0.04] rounded-xl px-3 py-2 border border-[var(--border)]/60">
                    <Users size={12} className="text-[var(--primary)] shrink-0" />
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">Employees</div>
                      <div className="text-sm font-black text-[var(--text)]">{dept.user_count || 0}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-black/[0.03] dark:bg-white/[0.04] rounded-xl px-3 py-2 border border-[var(--border)]/60">
                    <FolderKanban size={12} className="text-amber-500 dark:text-amber-400 shrink-0" />
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">Projects</div>
                      <div className="text-sm font-black text-[var(--text)]">{dept.project_count || 0}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer actions */}
              {isSuperAdmin && (
                <div className="px-5 pb-4 pt-0">
                  <div className="flex gap-2 pt-3 border-t border-[var(--border)]/60">
                    <button
                      onClick={(e) => handleOpenEdit(dept, e)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-black border border-[var(--border)] bg-black/[0.02] dark:bg-white/[0.03] text-[var(--primary)] hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/30 transition-all active:scale-95 cursor-pointer"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(dept.id); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-black border border-transparent text-[var(--muted)] hover:text-rose-400 dark:hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all active:scale-95 cursor-pointer"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ══════════════ TABLE VIEW ══════════════ */}
      {!loading && departmentsList?.length > 0 && viewMode === "table" && (
        <div className="overflow-hidden rounded-3xl border border-[var(--border)] shadow-sm bg-[var(--card)]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-black/[0.02] dark:bg-white/[0.03]">
                  {["Department", "Description", "Status", "Employees", "Projects", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-[var(--muted)] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {departmentsList.map((dept, idx) => (
                  <tr
                    key={dept.id}
                    className={`hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors duration-150 cursor-pointer ${idx !== departmentsList.length - 1 ? "border-b border-[var(--border)]/60" : ""}`}
                    onClick={() => handleOpenDetails(dept)}
                  >
                    {/* Name */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
                          <Building2 size={16} />
                        </div>
                        <span className="text-sm font-black text-[var(--text)]">{dept.name}</span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="px-5 py-4 max-w-[220px]">
                      <p className="text-xs text-[var(--muted)] line-clamp-1">{dept.description || "—"}</p>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge status={dept.status} />
                    </td>

                    {/* Employees */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Users size={13} className="text-[var(--primary)]" />
                        <span className="text-sm font-black text-[var(--text)]">{dept.user_count || 0}</span>
                      </div>
                    </td>

                    {/* Projects */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <FolderKanban size={13} className="text-amber-500 dark:text-amber-400" />
                        <span className="text-sm font-black text-[var(--text)]">{dept.project_count || 0}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {isSuperAdmin ? (
                          <>
                            <button
                              onClick={(e) => handleOpenEdit(dept, e)}
                              className="h-8 w-8 rounded-xl border border-[var(--border)] bg-black/[0.02] dark:bg-white/[0.04] flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/30 transition-all active:scale-95 cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(dept.id)}
                              className="h-8 w-8 rounded-xl border border-transparent flex items-center justify-center text-[var(--muted)] hover:text-rose-400 dark:hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all active:scale-95 cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-[var(--muted)]">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════ CREATE MODAL ══════════════ */}
      <Modal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Department"
        subtitle="Add a new operational layer"
        footer={
          <>
            <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2 border border-[var(--border)] rounded-xl text-xs font-bold hover:bg-[var(--hover)] transition-colors cursor-pointer text-[var(--text)]">
              Cancel
            </button>
            <button onClick={handleCreate} disabled={!name.trim()} className="flex items-center gap-2 px-5 py-2 bg-[var(--primary)] hover:opacity-90 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50">
              <Plus size={14} /> Create
            </button>
          </>
        }
      >
        <Field label="Department Name">
          <input type="text" placeholder="e.g. Engineering, Sales…" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Description">
          <textarea placeholder="Summarize department tasks and roles…" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" className={inputCls} />
        </Field>
      </Modal>

      {/* ══════════════ EDIT MODAL ══════════════ */}
      <Modal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Department"
        subtitle="Modify department parameters"
        footer={
          <>
            <button onClick={() => setIsEditOpen(false)} className="px-4 py-2 border border-[var(--border)] rounded-xl text-xs font-bold hover:bg-[var(--hover)] transition-colors cursor-pointer text-[var(--text)]">
              Cancel
            </button>
            <button onClick={handleUpdate} disabled={!name.trim()} className="flex items-center gap-2 px-5 py-2 bg-[var(--primary)] hover:opacity-90 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50">
              <Save size={14} /> Save Changes
            </button>
          </>
        }
      >
        <Field label="Department Name">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Description">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3" className={inputCls} />
        </Field>
        <Field label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </Field>
      </Modal>

      {/* ══════════════ DETAILS DRAWER ══════════════ */}
      {isDetailsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50 animate-in fade-in duration-200">
          <div className="bg-[var(--bg)] border-l border-[var(--border)] w-full max-w-xl h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Drawer header */}
            <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card)] shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="p-1.5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]"><Building2 size={14} /></div>
                  <h3 className="font-black text-sm text-[var(--primary)]">{name}</h3>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Department Overview & Members</p>
              </div>
              <button onClick={() => setIsDetailsOpen(false)} className="p-2 rounded-xl hover:bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Stats tiles */}
              {departmentStats && (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: <Users size={18} className="text-[var(--primary)]" />, label: "Employees", value: departmentStats.user_count || 0 },
                    { icon: <FolderKanban size={18} className="text-amber-500 dark:text-amber-400" />, label: "Projects",  value: departmentStats.project_count || 0 },
                    { icon: <CheckCircle size={18} className="text-emerald-500 dark:text-emerald-400" />, label: "Tasks", value: departmentStats.task_count || 0 },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 text-center flex flex-col items-center gap-1.5">
                      {icon}
                      <div className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">{label}</div>
                      <div className="text-2xl font-black text-[var(--text)]">{value}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Members list */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase font-black tracking-widest text-[var(--muted)] flex items-center gap-2">
                  <Users size={13} className="text-[var(--primary)]" /> Active Members
                </h4>

                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden divide-y divide-[var(--border)]/50">
                  {departmentUsers && departmentUsers.length > 0 ? (
                    departmentUsers.map((member) => (
                      <div key={member.id} className="px-4 py-3.5 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-[var(--border)] bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-black text-sm">
                            {member.avatar
                              ? <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                              : (member.name?.substring(0, 1).toUpperCase())
                            }
                          </div>
                          <div>
                            <div className="text-xs font-black text-[var(--text)]">{member.name}</div>
                            <div className="text-[10px] text-[var(--muted)]">{member.email}</div>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-black/[0.04] dark:bg-white/[0.05] text-[var(--muted)] border border-[var(--border)]">
                          {member.role || "Employee"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center flex flex-col items-center gap-3">
                      <Briefcase size={32} className="text-[var(--muted)] opacity-40" />
                      <p className="text-xs font-bold text-[var(--muted)]">No employees assigned yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Drawer footer */}
            <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--card)] flex items-center justify-between shrink-0">
              {isSuperAdmin && (
                <button
                  onClick={() => { setIsDetailsOpen(false); handleOpenEdit({ id: selectedId, name, description: "", status: "active" }); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-black text-[var(--primary)] hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/30 transition-all cursor-pointer"
                >
                  <Edit2 size={13} /> Edit Department
                </button>
              )}
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="ml-auto px-5 py-2 bg-[var(--primary)] hover:opacity-90 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ CONFIRM DIALOG ══════════════ */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={closeConfirm}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        variant="danger"
      />
    </div>
  );
}

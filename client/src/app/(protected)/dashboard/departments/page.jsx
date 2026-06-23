"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Building2,
  Users,
  FolderKanban,
  CheckCircle,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Briefcase,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import {
  getDepartmentsThunk,
  createDepartmentThunk,
  updateDepartmentThunk,
  deleteDepartmentThunk,
  getDepartmentUsersThunk,
  getDepartmentStatsThunk,
} from "@/features/departments/thunks/departmentThunks";
import { getAllUsersThunk } from "@/features/auth/thunks/authThunk";
import AppLoader from "@/components/common/AppLoader";
import ConfirmDialog from "@/components/common/ConfirmDialog";

export default function DepartmentsPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { departmentsList, departmentUsers, departmentStats, loading } = useSelector(
    (state) => state.departments
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [selectedId, setSelectedId] = useState(null);

  // Only super_admin can create/edit/delete departments — it is a structural operation
  const isSuperAdminUser = user?.role?.toLowerCase() === "super_admin";

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    confirmLabel: "Confirm",
    onConfirm: null,
  });

  const closeConfirm = () =>
    setConfirmDialog((prev) => ({ ...prev, open: false, onConfirm: null }));

  useEffect(() => {
    dispatch(getDepartmentsThunk({ page: 1, limit: 100 }));
  }, [dispatch]);

  const handleCreate = () => {
    dispatch(createDepartmentThunk({ name, description, status })).then(() => {
      setIsCreateOpen(false);
      resetForm();
    });
  };

  const handleUpdate = () => {
    dispatch(updateDepartmentThunk({ id: selectedId, data: { name, description, status } })).then(() => {
      setIsEditOpen(false);
      resetForm();
    });
  };

  const handleDelete = (id) => {
    setConfirmDialog({
      open: true,
      title: "Delete Department",
      message: "Are you sure you want to delete this department? All associated teams and data will be affected. This action cannot be undone.",
      confirmLabel: "Delete Department",
      onConfirm: () => {
        dispatch(deleteDepartmentThunk(id));
        closeConfirm();
      },
    });
  };

  const handleOpenDetails = (dept) => {
    setSelectedId(dept.id);
    setName(dept.name);
    dispatch(getDepartmentUsersThunk(dept.id));
    dispatch(getDepartmentStatsThunk(dept.id));
    setIsDetailsOpen(true);
  };

  const handleOpenEdit = (dept, e) => {
    e.stopPropagation();
    setSelectedId(dept.id);
    setName(dept.name);
    setDescription(dept.description || "");
    setStatus(dept.status || "active");
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setStatus("active");
    setSelectedId(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-[var(--text)]">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-[var(--text)] to-[var(--muted)] bg-clip-text text-transparent">
            Department Management
          </h1>
          <p className="text-xs text-[var(--muted)]">
            Create, view, and organize operational department layers across the company.
          </p>
        </div>

        {isSuperAdminUser && (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsCreateOpen(true);
            }}
            className="px-4 py-2.5 bg-[var(--primary)] hover:brightness-110 text-white rounded-xl text-xs font-bold shadow-md shadow-[var(--primary)]/10 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            Add Department
          </button>
        )}
      </div>

      {/* DEPARTMENTS LIST/GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departmentsList && departmentsList.length > 0 ? (
          departmentsList.map((dept) => (
            <div
              key={dept.id}
              onClick={() => handleOpenDetails(dept)}
              className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-xs backdrop-blur-md hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group min-h-[220px]"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-2xl group-hover:scale-105 transition-transform">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      dept.status === "active"
                        ? "bg-green-500/10 text-green-500 border border-green-500/20"
                        : "bg-gray-500/10 text-gray-500 border border-gray-500/20"
                    }`}
                  >
                    {dept.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm tracking-tight text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                    {dept.name}
                  </h3>
                  <p className="text-[11px] text-[var(--muted)] line-clamp-2 mt-1">
                    {dept.description || "No description provided."}
                  </p>
                </div>
              </div>

              <div className="border-t border-[var(--border)]/40 pt-4 mt-4 flex items-center justify-between">
                <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{dept.user_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FolderKanban className="w-3.5 h-3.5" />
                    <span>{dept.project_count || 0}</span>
                  </div>
                </div>

                {isSuperAdminUser && (
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEdit(dept, e)}
                      className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(dept.id);
                      }}
                      className="p-1.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-[var(--card)] border border-[var(--border)] rounded-3xl">
            <Building2 className="w-12 h-12 text-[var(--muted)] mx-auto mb-2 animate-bounce" />
            <h3 className="text-xs font-bold text-[var(--muted)]">No departments created yet</h3>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[var(--bg)] border border-[var(--border)] shadow-2xl rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm">Create Department</h3>
                <p className="text-[10px] text-[var(--muted)] uppercase font-bold">
                  Add a new operational layer
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg hover:bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">
                  Department Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Engineering, Sales..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-[var(--border)] rounded-xl bg-[var(--input)] text-xs font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">
                  Description
                </label>
                <textarea
                  placeholder="Summarize department tasks and roles..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="w-full p-3 border border-[var(--border)] rounded-xl bg-[var(--input)] text-xs font-bold focus:outline-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-[var(--border)] bg-[var(--hover)]/40 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 border border-[var(--border)] rounded-xl text-xs font-bold hover:bg-[var(--hover)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                className="px-4 py-2 bg-[var(--primary)] hover:brightness-110 text-white rounded-xl text-xs font-bold shadow-md shadow-[var(--primary)]/10 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Department
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[var(--bg)] border border-[var(--border)] shadow-2xl rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm">Edit Department</h3>
                <p className="text-[10px] text-[var(--muted)] uppercase font-bold">
                  Modify department parameters
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="p-1 rounded-lg hover:bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">
                  Department Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-[var(--border)] rounded-xl bg-[var(--input)] text-xs font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="w-full p-3 border border-[var(--border)] rounded-xl bg-[var(--input)] text-xs font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-3 border border-[var(--border)] rounded-xl bg-[var(--input)] text-xs font-bold focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-[var(--border)] bg-[var(--hover)]/40 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 border border-[var(--border)] rounded-xl text-xs font-bold hover:bg-[var(--hover)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                className="px-4 py-2 bg-[var(--primary)] hover:brightness-110 text-white rounded-xl text-xs font-bold shadow-md shadow-[var(--primary)]/10 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILS / DASHBOARD DRAWER */}
      {isDetailsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-end z-50 animate-in fade-in duration-200">
          <div className="bg-[var(--bg)] border-l border-[var(--border)] w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-[var(--card)]">
              <div>
                <h3 className="font-extrabold text-md tracking-tight text-[var(--primary)]">
                  {name} Department
                </h3>
                <p className="text-[10px] text-[var(--muted)] uppercase font-bold">
                  Overview & Member roster
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                className="p-2 rounded-xl hover:bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* CONTENT SPACE */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* STATS TILES */}
              {departmentStats && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl text-center">
                    <TrendingUp className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                    <div className="text-[9px] uppercase font-bold tracking-wider text-[var(--muted)]">Employees</div>
                    <div className="text-xl font-black">{departmentStats.user_count || 0}</div>
                  </div>
                  <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl text-center">
                    <FolderKanban className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                    <div className="text-[9px] uppercase font-bold tracking-wider text-[var(--muted)]">Projects</div>
                    <div className="text-xl font-black">{departmentStats.project_count || 0}</div>
                  </div>
                  <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl text-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
                    <div className="text-[9px] uppercase font-bold tracking-wider text-[var(--muted)]">Tasks</div>
                    <div className="text-xl font-black">{departmentStats.task_count || 0}</div>
                  </div>
                </div>
              )}

              {/* MEMBERS LIST */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-[var(--muted)] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[var(--primary)]" />
                  Active Employee Members
                </h4>

                <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl overflow-hidden divide-y divide-[var(--border)]/40">
                  {departmentUsers && departmentUsers.length > 0 ? (
                    departmentUsers.map((member) => (
                      <div
                        key={member.id}
                        className="p-4 flex items-center justify-between hover:bg-[var(--hover)]/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-[var(--border)] relative bg-[var(--border)]">
                            {member.avatar ? (
                              <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-[var(--muted)] font-black uppercase">
                                {member.name?.substring(0, 2)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-black">{member.name}</div>
                            <div className="text-[10px] text-[var(--muted)] leading-none">{member.email}</div>
                          </div>
                        </div>

                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[var(--hover)] text-[var(--muted)]">
                          {member.role || "Employee"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Briefcase className="w-10 h-10 text-[var(--muted)] mx-auto mb-1" />
                      <p className="text-xs font-bold text-[var(--muted)]">No employees assigned to this department yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[var(--border)] bg-[var(--card)] flex justify-end">
              <button
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                className="px-5 py-2.5 bg-[var(--primary)] hover:brightness-110 text-white rounded-xl text-xs font-bold shadow-md shadow-[var(--primary)]/10 cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
      {/* CONFIRM DIALOG */}
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

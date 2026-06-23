"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users2,
  Building,
  User,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Users,
  Briefcase,
  ChevronRight,
  TrendingUp,
  UserPlus,
  UserMinus,
} from "lucide-react";
import {
  getTeamsThunk,
  createTeamThunk,
  updateTeamThunk,
  deleteTeamThunk,
  addTeamMemberThunk,
  removeTeamMemberThunk,
  getTeamMembersThunk,
} from "@/features/teams/thunks/teamThunks";
import { getDepartmentsThunk } from "@/features/departments/thunks/departmentThunks";
import { getAllUsersThunk } from "@/features/auth/thunks/authThunk";
import AppLoader from "@/components/common/AppLoader";
import ConfirmDialog from "@/components/common/ConfirmDialog";

export default function TeamsPage() {
  const dispatch = useDispatch();
  const { user, users: allUsers } = useSelector((state) => state.auth);
  const { teamsList, teamMembers, loading } = useSelector((state) => state.teams);
  const { departmentsList } = useSelector((state) => state.departments);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [leadId, setLeadId] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // Filters
  const [filterDept, setFilterDept] = useState("");

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


  // Member management state
  const [memberToAdd, setMemberToAdd] = useState("");

  const isManagement =
    user?.role?.toLowerCase() === "admin" ||
    user?.role?.toLowerCase() === "super_admin" ||
    user?.role?.toLowerCase() === "dept_head";


  // Initial data loading
  useEffect(() => {
    dispatch(getTeamsThunk({ page: 1, limit: 100, departmentId: filterDept }));
    dispatch(getDepartmentsThunk({ page: 1, limit: 100 }));
    dispatch(getAllUsersThunk({ page: 1, limit: 200 }));
  }, [dispatch, filterDept]);

  const handleCreate = () => {
    dispatch(
      createTeamThunk({
        department_id: Number(departmentId),
        name,
        description,
        lead_id: leadId ? Number(leadId) : null,
      })
    ).then(() => {
      setIsCreateOpen(false);
      resetForm();
    });
  };

  const handleUpdate = () => {
    dispatch(
      updateTeamThunk({
        id: selectedId,
        data: {
          department_id: Number(departmentId),
          name,
          description,
          lead_id: leadId ? Number(leadId) : null,
        },
      })
    ).then(() => {
      setIsEditOpen(false);
      resetForm();
    });
  };

  const handleDelete = (id) => {
    setConfirmDialog({
      open: true,
      title: "Delete Team",
      message: "Are you sure you want to delete this team? All member associations will be removed and this action cannot be undone.",
      confirmLabel: "Delete Team",
      onConfirm: () => {
        dispatch(deleteTeamThunk(id));
        closeConfirm();
      },
    });
  };

  const handleOpenDetails = (team) => {
    setSelectedId(team.id);
    setName(team.name);
    setDepartmentId(team.department_id);
    dispatch(getTeamMembersThunk(team.id));
    setIsDetailsOpen(true);
  };

  const handleAddMember = () => {
    if (!memberToAdd) return;
    dispatch(addTeamMemberThunk({ teamId: selectedId, userId: Number(memberToAdd) })).then(() => {
      setMemberToAdd("");
    });
  };

  const handleRemoveMember = (memberId) => {
    setConfirmDialog({
      open: true,
      title: "Remove Team Member",
      message: "Are you sure you want to remove this member from the team? They will lose access to team resources.",
      confirmLabel: "Remove Member",
      onConfirm: () => {
        dispatch(removeTeamMemberThunk({ teamId: selectedId, userId: memberId }));
        closeConfirm();
      },
    });
  };

  const handleOpenEdit = (team, e) => {
    e.stopPropagation();
    setSelectedId(team.id);
    setName(team.name);
    setDescription(team.description || "");
    setDepartmentId(team.department_id);
    setLeadId(team.lead_id || "");
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setDepartmentId("");
    setLeadId("");
    setSelectedId(null);
  };

  // Filter eligible users for lead select (belong to selected department)
  const eligibleLeads = allUsers.filter(
    (u) => !departmentId || Number(u.department_id) === Number(departmentId)
  );

  // Filter eligible users for members (in department and NOT already in the team)
  const existingMemberIds = teamMembers.map((m) => m.id);
  const eligibleMembers = allUsers.filter(
    (u) =>
      Number(u.department_id) === Number(departmentId) &&
      !existingMemberIds.includes(u.id)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-[var(--text)]">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-[var(--text)] to-[var(--muted)] bg-clip-text text-transparent">
            Team Management
          </h1>
          <p className="text-xs text-[var(--muted)]">
            Create organizational teams, assign Team Leads, and manage project member groups.
          </p>
        </div>

        {isManagement && (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsCreateOpen(true);
            }}
            className="px-4 py-2.5 bg-[var(--primary)] hover:brightness-110 text-white rounded-xl text-xs font-bold shadow-md shadow-[var(--primary)]/10 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            Create Team
          </button>
        )}
      </div>

      {/* FILTERS TOOLBAR */}
      <div className="flex items-center gap-3 bg-[var(--card)] border border-[var(--border)] p-4 rounded-2xl shadow-xs">
        <Building className="w-4 h-4 text-[var(--muted)]" />
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="p-2 border border-[var(--border)] rounded-xl bg-[var(--input)] text-xs font-bold"
        >
          <option value="">All Departments</option>
          {departmentsList.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* TEAMS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamsList && teamsList.length > 0 ? (
          teamsList.map((team) => (
            <div
              key={team.id}
              onClick={() => handleOpenDetails(team)}
              className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-xs backdrop-blur-md hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group min-h-[220px]"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-2xl group-hover:scale-105 transition-transform">
                    <Users2 className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                    {team.department_name}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm tracking-tight text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                    {team.name}
                  </h3>
                  <p className="text-[11px] text-[var(--muted)] line-clamp-2 mt-1">
                    {team.description || "No description provided."}
                  </p>
                </div>
              </div>

              <div className="border-t border-[var(--border)]/40 pt-4 mt-4 flex items-center justify-between">
                <div className="text-[10px] text-[var(--muted)] font-bold">
                  <div>Lead: <span className="font-extrabold text-[var(--text)]">{team.lead_name || "Unassigned"}</span></div>
                  <div className="mt-1 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{team.member_count || 0} members</span>
                  </div>
                </div>

                {isManagement && (
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEdit(team, e)}
                      className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(team.id);
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
            <Users2 className="w-12 h-12 text-[var(--muted)] mx-auto mb-2 animate-bounce" />
            <h3 className="text-xs font-bold text-[var(--muted)]">No teams created yet</h3>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[var(--bg)] border border-[var(--border)] shadow-2xl rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm">Create Team</h3>
                <p className="text-[10px] text-[var(--muted)] uppercase font-bold">
                  Define a new team workspace
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
                  Department
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => {
                    setDepartmentId(e.target.value);
                    setLeadId("");
                  }}
                  className="w-full p-3 border border-[var(--border)] rounded-xl bg-[var(--input)] text-xs font-bold focus:outline-none"
                >
                  <option value="">Select Department</option>
                  {departmentsList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">
                  Team Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Frontend Squad, Marketing Ops..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-[var(--border)] rounded-xl bg-[var(--input)] text-xs font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">
                  Team Lead
                </label>
                <select
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                  className="w-full p-3 border border-[var(--border)] rounded-xl bg-[var(--input)] text-xs font-bold focus:outline-none"
                  disabled={!departmentId}
                >
                  <option value="">Select Team Lead (Optional)</option>
                  {eligibleLeads.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">
                  Description
                </label>
                <textarea
                  placeholder="Describe team focus and objectives..."
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
                Add Team
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
                <h3 className="font-extrabold text-sm">Edit Team</h3>
                <p className="text-[10px] text-[var(--muted)] uppercase font-bold">
                  Modify team structures
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
                  Department
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full p-3 border border-[var(--border)] rounded-xl bg-[var(--input)] text-xs font-bold focus:outline-none"
                >
                  {departmentsList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">
                  Team Name
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
                  Team Lead
                </label>
                <select
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                  className="w-full p-3 border border-[var(--border)] rounded-xl bg-[var(--input)] text-xs font-bold focus:outline-none"
                >
                  <option value="">Select Team Lead (Optional)</option>
                  {eligibleLeads.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
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

      {/* TEAM MEMBERS DRAWER */}
      {isDetailsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-end z-50 animate-in fade-in duration-200">
          <div className="bg-[var(--bg)] border-l border-[var(--border)] w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-[var(--card)]">
              <div>
                <h3 className="font-extrabold text-md tracking-tight text-[var(--primary)]">
                  {name} Members
                </h3>
                <p className="text-[10px] text-[var(--muted)] uppercase font-bold">
                  Roster management and allocations
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

            {/* DRAWER CONTENT */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* ADD MEMBER ZONE */}
              {isManagement && (
                <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-2xl space-y-3">
                  <h4 className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)] flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-[var(--primary)]" />
                    Assign Member to Team
                  </h4>

                  <div className="flex gap-2">
                    <select
                      value={memberToAdd}
                      onChange={(e) => setMemberToAdd(e.target.value)}
                      className="flex-1 p-2.5 border border-[var(--border)] rounded-xl bg-[var(--input)] text-xs font-bold"
                    >
                      <option value="">Select Employee</option>
                      {eligibleMembers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.role})
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="px-4 bg-[var(--primary)] hover:brightness-110 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      disabled={!memberToAdd}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {/* MEMBERS LISTING */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-[var(--muted)] flex items-center gap-2">
                  <Users2 className="w-4 h-4 text-[var(--primary)]" />
                  Current Team Members
                </h4>

                <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl overflow-hidden divide-y divide-[var(--border)]/40">
                  {teamMembers && teamMembers.length > 0 ? (
                    teamMembers.map((member) => (
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

                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[var(--hover)] text-[var(--muted)]">
                            {member.role || "Employee"}
                          </span>

                          {isManagement && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(member.id)}
                              className="p-1 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Briefcase className="w-10 h-10 text-[var(--muted)] mx-auto mb-1" />
                      <p className="text-xs font-bold text-[var(--muted)]">No team members assigned yet</p>
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

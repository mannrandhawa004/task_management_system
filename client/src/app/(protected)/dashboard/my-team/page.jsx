"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users2,
  Users,
  UserPlus,
  UserMinus,
  ShieldCheck,
  UserCheck,
  Table,
  LayoutGrid,
} from "lucide-react";
import {
  getMyTeamsThunk,
  addTeamMemberThunk,
  removeTeamMemberThunk,
  getTeamMembersThunk,
} from "@/features/teams/thunks/teamThunks";
import { getAllUsersThunk } from "@/features/auth/thunks/authThunk";
import AppLoader from "@/components/common/AppLoader";
import ConfirmDialog from "@/components/common/ConfirmDialog";

export default function MyTeamPage() {
  const dispatch = useDispatch();
  const { user, users: allUsers } = useSelector((state) => state.auth);
  const { myTeamsList, teamMembers, loading } = useSelector((state) => state.teams);

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [memberToAdd, setMemberToAdd] = useState("");
  const [viewMode, setViewMode] = useState("table"); // "table" | "card"

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
    dispatch(getMyTeamsThunk()).then((res) => {
      const teams = res?.payload || res;
      if (Array.isArray(teams) && teams.length > 0) {
        dispatch(getTeamMembersThunk(teams[0].id));
      }
    });
    dispatch(getAllUsersThunk({ page: 1, limit: 200 }));
  }, [dispatch]);

  const activeTeam = myTeamsList && myTeamsList.length > 0
    ? (selectedTeam ? myTeamsList.find((t) => t.id === selectedTeam.id) || myTeamsList[0] : myTeamsList[0])
    : null;

  const handleSelectTeam = (team) => {
    setSelectedTeam(team);
    dispatch(getTeamMembersThunk(team.id));
  };

  const handleAddMember = () => {
    if (!memberToAdd || !activeTeam) return;
    dispatch(addTeamMemberThunk({ teamId: activeTeam.id, userId: Number(memberToAdd) })).then(() => {
      setMemberToAdd("");
      dispatch(getMyTeamsThunk());
      dispatch(getTeamMembersThunk(activeTeam.id));
      dispatch(getAllUsersThunk({ page: 1, limit: 200 }));
    });
  };

  const handleRemoveMember = (memberId) => {
    if (!activeTeam) return;
    setConfirmDialog({
      open: true,
      title: "Remove Team Member",
      message: "Are you sure you want to remove this member from your team? They will lose access to team resources.",
      confirmLabel: "Remove Member",
      onConfirm: () => {
        dispatch(removeTeamMemberThunk({ teamId: activeTeam.id, userId: memberId })).then(() => {
          dispatch(getMyTeamsThunk());
          dispatch(getTeamMembersThunk(activeTeam.id));
          dispatch(getAllUsersThunk({ page: 1, limit: 200 }));
        });
        closeConfirm();
      },
    });
  };

  const canManageMembers =
    user?.role?.toLowerCase() === "admin" ||
    user?.role?.toLowerCase() === "super_admin" ||
    user?.role?.toLowerCase() === "hr" ||
    (user?.role?.toLowerCase() === "dept_head" && activeTeam && Number(activeTeam.department_id) === Number(user?.department_id)) ||
    (activeTeam && Number(activeTeam.lead_id) === Number(user?.id));

  const targetDeptId = activeTeam?.department_id;
  const existingMemberIds = teamMembers ? teamMembers.map((m) => m.id) : [];
  const eligibleMembers = allUsers.filter(
    (u) =>
      targetDeptId &&
      Number(u.department_id) === Number(targetDeptId) &&
      !existingMemberIds.includes(u.id) &&
      (!u.team_id || u.team_id === null || u.team_id === 0 || u.team_id === "" || u.team_id === "null")
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-[var(--text)]">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
              My Workspace
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-[var(--text)] to-[var(--muted)] bg-clip-text text-transparent">
            My Teams & Collaboration
          </h1>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            View the project teams you lead or participate in, and collaborate with your colleagues.
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <AppLoader />
        </div>
      )}

      {!loading && (!myTeamsList || myTeamsList.length === 0) && (
        <div className="text-center py-16 bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8">
          <Users2 className="w-14 h-14 text-[var(--muted)] mx-auto mb-3 opacity-50" />
          <h3 className="text-sm font-black text-[var(--text)]">No Teams Assigned Yet</h3>
          <p className="text-xs text-[var(--muted)] max-w-md mx-auto mt-1">
            You are not currently assigned as a member or Team Lead of any project team. Contact your Department Head or Manager if you believe this is an error.
          </p>
        </div>
      )}

      {!loading && myTeamsList && myTeamsList.length > 0 && activeTeam && (
        <div className="space-y-6">
          {/* TEAM SELECTOR TABS (If multiple teams) */}
          {myTeamsList.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--border)]">
              {myTeamsList.map((team) => {
                const isSelected = activeTeam.id === team.id;
                const isLead = Number(team.lead_id) === Number(user?.id);
                return (
                  <button
                    key={team.id}
                    onClick={() => handleSelectTeam(team)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                      isSelected
                        ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20 scale-102"
                        : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)]"
                    }`}
                  >
                    <Users2 className="w-4 h-4" />
                    <span>{team.name}</span>
                    {isLead && (
                      <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-black ${
                        isSelected ? "bg-white/20 text-white" : "bg-indigo-500/10 text-indigo-500"
                      }`}>
                        Lead
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* TEAM OVERVIEW BANNER */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                    {activeTeam.department_name || "Department"}
                  </span>
                  {Number(activeTeam.lead_id) === Number(user?.id) ? (
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> You are Team Lead
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                      <UserCheck className="w-3 h-3" /> Team Member
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-black text-[var(--text)] tracking-tight">
                  {activeTeam.name}
                </h2>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  {activeTeam.description || "No description provided for this team."}
                </p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 bg-[var(--hover)]/40 p-4 rounded-2xl border border-[var(--border)] shrink-0 min-w-[160px]">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">
                  Team Lead
                </div>
                <div className="text-xs font-black text-[var(--text)]">
                  {activeTeam.lead_name || "Unassigned"}
                </div>
                <div className="text-[11px] font-bold text-[var(--primary)] flex items-center gap-1 mt-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{teamMembers?.length || 0} Total Members</span>
                </div>
              </div>
            </div>

            {/* ADD MEMBER ZONE (For Lead / Admin) */}
            {canManageMembers && (
              <div className="mt-6 pt-6 border-t border-[var(--border)]/60">
                <div className="bg-[var(--bg)] border border-[var(--border)] p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] uppercase font-extrabold tracking-wider text-[var(--text)] flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-[var(--primary)]" />
                      Add New Member to {activeTeam.name}
                    </h4>
                    <span className="text-[9px] font-extrabold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                      Eligible: {eligibleMembers.length} employees from {activeTeam.department_name}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <select
                      value={memberToAdd}
                      onChange={(e) => setMemberToAdd(e.target.value)}
                      className="flex-1 p-3 border border-[var(--border)] rounded-xl bg-[var(--input)] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    >
                      <option value="">Select Employee from {activeTeam.department_name} (Not in any team)</option>
                      {eligibleMembers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.role || "Employee"})
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="px-6 py-3 bg-[var(--primary)] hover:brightness-110 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-[var(--primary)]/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      disabled={!memberToAdd}
                    >
                      <UserPlus className="w-4 h-4" />
                      Add Member
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ROSTER HEADER & VIEW SWITCHER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text)] flex items-center gap-2">
              <Users2 className="w-4 h-4 text-[var(--primary)]" />
              Team Roster & Collaborators ({teamMembers?.length || 0})
            </h3>

            <div className="flex items-center gap-1 bg-[var(--card)] border border-[var(--border)] p-1 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "table"
                    ? "bg-[var(--primary)] text-white shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                Table View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("card")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "card"
                    ? "bg-[var(--primary)] text-white shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Card View
              </button>
            </div>
          </div>

          {/* TABLE VIEW */}
          {viewMode === "table" && (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--hover)]/30 text-[10px] uppercase font-extrabold tracking-wider text-[var(--muted)]">
                      <th className="p-4 pl-6">Member</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">System Role</th>
                      <th className="p-4">Team Role</th>
                      <th className="p-4">Joined At</th>
                      {canManageMembers && <th className="p-4 pr-6 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]/40 text-xs font-bold">
                    {teamMembers && teamMembers.length > 0 ? (
                      teamMembers.map((member) => {
                        const isTeamLead = Number(member.id) === Number(activeTeam.lead_id);
                        return (
                          <tr key={member.id} className="hover:bg-[var(--hover)]/30 transition-colors">
                            <td className="p-4 pl-6">
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
                                <span className="font-black text-[var(--text)]">{member.name}</span>
                              </div>
                            </td>
                            <td className="p-4 text-[var(--muted)] font-medium">{member.email}</td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[var(--hover)] text-[var(--text)] border border-[var(--border)]">
                                {member.role || "Employee"}
                              </span>
                            </td>
                            <td className="p-4">
                              {isTeamLead ? (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center gap-1 w-max">
                                  <ShieldCheck className="w-3 h-3" /> Team Lead
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1 w-max">
                                  <UserCheck className="w-3 h-3" /> Member
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-[var(--muted)] text-[11px]">
                              {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : "Recently"}
                            </td>
                            {canManageMembers && (
                              <td className="p-4 pr-6 text-right">
                                {!isTeamLead ? (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveMember(member.id)}
                                    className="p-2 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px]"
                                    title="Remove from team"
                                  >
                                    <UserMinus className="w-3.5 h-3.5" />
                                    <span>Remove</span>
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-[var(--muted)] italic">Protected</span>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={canManageMembers ? 6 : 5} className="p-12 text-center text-[var(--muted)]">
                          No members found in this team.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CARD VIEW */}
          {viewMode === "card" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {teamMembers && teamMembers.length > 0 ? (
                teamMembers.map((member) => {
                  const isTeamLead = Number(member.id) === Number(activeTeam.lead_id);
                  return (
                    <div
                      key={member.id}
                      className="bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)]/40 rounded-3xl p-5 transition-all flex flex-col justify-between space-y-4 group relative overflow-hidden"
                    >
                      {isTeamLead && (
                        <div className="absolute top-0 right-0 bg-purple-500 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-xs flex items-center gap-1">
                          <ShieldCheck className="w-2.5 h-2.5" /> Lead
                        </div>
                      )}

                      <div className="flex flex-col items-center text-center space-y-3 pt-2">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--border)] group-hover:border-[var(--primary)] transition-colors relative bg-[var(--border)] shadow-md">
                          {member.avatar ? (
                            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg text-[var(--muted)] font-black uppercase">
                              {member.name?.substring(0, 2)}
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="font-black text-sm text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                            {member.name}
                          </h4>
                          <p className="text-[11px] text-[var(--muted)] font-medium mt-0.5 break-all">
                            {member.email}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-[var(--border)]/40 pt-3 flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-[var(--hover)] text-[var(--text)] border border-[var(--border)] truncate max-w-[120px]">
                          {member.role || "Employee"}
                        </span>

                        {canManageMembers && !isTeamLead && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-1.5 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer text-[10px] font-bold flex items-center gap-1 shrink-0"
                            title="Remove from team"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12 bg-[var(--card)] border border-[var(--border)] rounded-3xl">
                  <p className="text-xs font-bold text-[var(--muted)]">No team members assigned yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

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


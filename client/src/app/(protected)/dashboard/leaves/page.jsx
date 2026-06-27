"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Calendar, Filter, Plus, FileText, CheckCircle, XCircle, AlertTriangle, Briefcase, Clock, Users, Settings, RefreshCw, Sparkles, ShieldAlert, Download, DollarSign } from "lucide-react";
import { getMyLeavesThunk, getManageLeavesThunk, applyLeaveThunk, updateLeaveStatusThunk, getColleaguesOnLeaveThunk, getPoliciesThunk, getMyBalancesThunk, allocateQuotasThunk, getSalaryReportThunk } from "@/features/leaves/thunks/leaveThunks";
import AppLoader from "@/components/common/AppLoader";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Pagination from "@/components/common/Pagination";
import { showToast } from "@/lib/toast";

export default function LeavesPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myLeaves, myLeavesMeta, manageLeaves, manageLeavesMeta, colleaguesOnLeave, policies, balances, salaryReport, loading } = useSelector((state) => state.leaves);

  const role = user?.role?.toLowerCase() || "";
  const isManagement = ["super_admin", "admin", "hr", "dept_head"].includes(role);
  const isSuperAdmin = role === "super_admin";
  const isAdminOrSuper = role === "super_admin" || role === "admin";

  const [activeTab, setActiveTab] = useState(isAdminOrSuper ? "manage_leaves" : "my_leaves");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [allocating, setAllocating] = useState(false);

  const [formData, setFormData] = useState({
    type: "casual",
    startDate: "",
    endDate: "",
    reason: "",
  });

  useEffect(() => {
    if (!isAdminOrSuper) {
      dispatch(getMyLeavesThunk({ page: 1, limit: 10 }));
      dispatch(getMyBalancesThunk());
    }
    dispatch(getColleaguesOnLeaveThunk());
    if (isManagement) {
      dispatch(getManageLeavesThunk({ page: 1, limit: 10 }));
      dispatch(getSalaryReportThunk({ year: new Date().getFullYear() }));
    }
    if (isSuperAdmin) {
      dispatch(getPoliciesThunk());
    }
  }, [dispatch, isManagement, isSuperAdmin, isAdminOrSuper]);

  const handleMyLeavesPageChange = ({ page, limit }) => {
    dispatch(getMyLeavesThunk({ page, limit }));
  };

  const handleManageLeavesPageChange = ({ page, limit }) => {
    dispatch(getManageLeavesThunk({ page, limit }));
  };

  // Live calculation of duration and LWP split
  const start = formData.startDate ? new Date(formData.startDate) : null;
  const end = formData.endDate ? new Date(formData.endDate) : null;
  let calculatedDays = 0;
  if (start && end && !isNaN(start) && !isNaN(end) && end >= start) {
    calculatedDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
  }
  if (formData.type === "half_day") {
    calculatedDays = 0.5;
  }

  const typeMapping = { casual: "Casual Leave", sick: "Sick Leave", earned: "Earned Leave", wfh: "Work From Home", unpaid: "Unpaid Leave", half_day: "Casual Leave" };
  const targetPolicyName = typeMapping[formData.type] || "Casual Leave";
  const matchedBalance = balances.find((b) => b.leave_type === targetPolicyName);
  const availableRem = matchedBalance ? matchedBalance.remaining : 0;
  const lwpDaysWarn = calculatedDays > availableRem && matchedBalance?.is_paid ? Number((calculatedDays - Math.max(0, availableRem)).toFixed(1)) : 0;

  const handleApply = (e) => {
    e.preventDefault();
    if (calculatedDays <= 0) {
      showToast.error("Invalid Dates", "End date must be on or after start date.");
      return;
    }
    dispatch(applyLeaveThunk({ ...formData, totalDays: calculatedDays }))
      .unwrap()
      .then(() => {
        setShowApplyModal(false);
        setFormData({ type: "casual", startDate: "", endDate: "", reason: "" });
        showToast.success("Leave Applied", "Your leave request has been submitted successfully.");
        dispatch(getMyBalancesThunk());
      })
      .catch((err) => {
        showToast.error("Error", err || "Failed to submit leave request.");
      });
  };

  const handleStatusUpdate = (id, status) => {
    setConfirmAction({ id, status });
  };

  const handleConfirmStatusUpdate = () => {
    if (!confirmAction) return;
    const { id, status } = confirmAction;
    dispatch(updateLeaveStatusThunk({ id, status }))
      .unwrap()
      .then(() => {
        showToast.success("Leave Updated", `Leave request has been ${status} successfully.`);
        if (!isAdminOrSuper) dispatch(getMyBalancesThunk());
        dispatch(getSalaryReportThunk({ year: new Date().getFullYear() }));
      })
      .catch((err) => {
        showToast.error("Error", err || "Failed to update leave request.");
      });
    setConfirmAction(null);
  };

  const handleAllocateQuotas = () => {
    setAllocating(true);
    const year = new Date().getFullYear();
    dispatch(allocateQuotasThunk(year))
      .unwrap()
      .then((res) => {
        showToast.success("Quotas Allocated", `Allocated annual leave balances for ${res.usersCount} employees.`);
        if (!isAdminOrSuper) dispatch(getMyBalancesThunk());
      })
      .catch((err) => showToast.error("Allocation Failed", err))
      .finally(() => setAllocating(false));
  };

  const handleExportCSV = () => {
    if (!salaryReport || salaryReport.length === 0) {
      showToast.error("No Data", "No salary report data available to export.");
      return;
    }
    const headers = ["Employee ID", "Name", "Email", "Department", "Base Salary", "Total Leaves Taken", "LWP Days (Unpaid)", "Salary Deduction", "Net Payable Salary"];
    const rows = salaryReport.map((r) => [
      r.employee_id,
      `"${r.name}"`,
      `"${r.email}"`,
      `"${r.department_name}"`,
      r.base_salary,
      r.total_leaves_taken,
      r.lwp_days,
      r.deduction,
      r.net_salary
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Payroll_Salary_Report_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast.success("Export Successful", "Downloaded payroll salary report CSV.");
  };

  if (loading && myLeaves.length === 0 && manageLeaves.length === 0 && balances.length === 0) return <AppLoader />;

  const renderStatus = (status) => {
    const colors = {
      pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      approved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      rejected: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      cancelled: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
    };
    return (
      <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${colors[status] || "bg-zinc-500/10 text-zinc-500"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full text-[var(--text)] pb-12 animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--border)] pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
              <Calendar size={28} strokeWidth={2.5} />
            </div>
            {isAdminOrSuper ? "Management Leave & Payroll Portal" : "Enterprise Leave Portal"}
          </h1>
          <p className="mt-1 text-sm font-medium text-[var(--muted)]">
            {isAdminOrSuper 
              ? "Review team time off requests, monitor department schedules, and generate payroll salary reports." 
              : "Track personal leave balances, submit time off applications, and view team schedules."}
          </p>
        </div>
        {!isAdminOrSuper && (
          <button
            onClick={() => setShowApplyModal(true)}
            className="bg-[var(--primary)] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[var(--primary)]/20 cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} /> Apply Leave
          </button>
        )}
      </div>

      {/* BALANCE CARDS ROW (Hidden for Super Admin & Admin) */}
      {!isAdminOrSuper && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {["Casual Leave", "Sick Leave", "Earned Leave"].map((typeTitle, i) => {
            const bal = balances.find((b) => b.leave_type === typeTitle) || { allocated: 12, used: 0, remaining: 12 };
            const percent = bal.allocated > 0 ? Math.min(100, Math.round((bal.used / bal.allocated) * 100)) : 0;
            const gradient = i === 0 ? "from-emerald-500/10 to-teal-500/5 border-emerald-500/20 text-emerald-500" : i === 1 ? "from-amber-500/10 to-orange-500/5 border-amber-500/20 text-amber-500" : "from-blue-500/10 to-indigo-500/5 border-blue-500/20 text-blue-500";
            
            return (
              <div key={typeTitle} className={`p-5 rounded-3xl bg-gradient-to-br ${gradient} border backdrop-blur-md relative overflow-hidden shadow-sm transition-all hover:-translate-y-0.5`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-[var(--muted)]">{typeTitle}</span>
                    <div className="text-2xl font-black text-[var(--text)] mt-1">{bal.remaining} <span className="text-xs font-bold text-[var(--muted)]">days left</span></div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md dark:bg-black/10 font-bold text-xs">
                    {bal.used}/{bal.allocated}
                  </div>
                </div>
                <div className="w-full h-2 bg-[var(--border)] rounded-full overflow-hidden">
                  <div className="h-full bg-current rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                </div>
              </div>
            );
          })}

          {/* LWP Summary Card */}
          <div className="p-5 rounded-3xl bg-[var(--card)] border border-[var(--border)] relative overflow-hidden shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[var(--muted)]">Unpaid Leaves (LWP)</span>
                <div className="text-2xl font-black text-rose-500 mt-1">
                  {myLeaves.reduce((acc, l) => acc + (l.status === "approved" ? Number(l.lwp_days || 0) : 0), 0)} <span className="text-xs font-bold text-[var(--muted)]">days</span>
                </div>
              </div>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                <ShieldAlert size={18} strokeWidth={2.5} />
              </div>
            </div>
            <p className="text-[11px] text-[var(--muted)] font-medium mt-3">Exceeding free quota automatically converts to LWP deduction.</p>
          </div>
        </div>
      )}

      {/* TABS NAVIGATION */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-[var(--card)] border border-[var(--border)] rounded-2xl w-max shadow-sm backdrop-blur-md">
        {!isAdminOrSuper && (
          <button
            onClick={() => setActiveTab("my_leaves")}
            className={`px-5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "my_leaves" 
                ? "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20" 
                : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)]"
            }`}
          >
            <FileText size={14} /> My Leaves
          </button>
        )}
        {isManagement && (
          <button
            onClick={() => setActiveTab("manage_leaves")}
            className={`px-5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "manage_leaves" 
                ? "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20" 
                : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)]"
            }`}
          >
            <Users size={14} /> Manage Requests
            {manageLeaves.filter(l => l.status === "pending").length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-black">
                {manageLeaves.filter(l => l.status === "pending").length}
              </span>
            )}
          </button>
        )}
        <button
          onClick={() => setActiveTab("calendar")}
          className={`px-5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "calendar" 
              ? "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20" 
              : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)]"
          }`}
        >
          <Clock size={14} /> Team On Leave ({colleaguesOnLeave.length})
        </button>
        {isManagement && (
          <button
            onClick={() => setActiveTab("payroll")}
            className={`px-5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "payroll" 
                ? "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20" 
                : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)]"
            }`}
          >
            <DollarSign size={14} /> Payroll & Salary Sheet
          </button>
        )}
        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab("policies")}
            className={`px-5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "policies" 
                ? "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20" 
                : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)]"
            }`}
          >
            <Settings size={14} /> Policy Setup
          </button>
        )}
      </div>

      {/* TAB CONTENT: MY LEAVES & MANAGE REQUESTS */}
      {(activeTab === "my_leaves" || activeTab === "manage_leaves") && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--hover)] border-b border-[var(--border)]">
                  {activeTab === "manage_leaves" && <th className="p-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-wider">Employee</th>}
                  <th className="p-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-wider">Leave Type</th>
                  <th className="p-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-wider">Dates</th>
                  <th className="p-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-wider">Duration</th>
                  <th className="p-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-wider">LWP Split</th>
                  <th className="p-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-wider">Reason</th>
                  <th className="p-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-wider">Status</th>
                  {activeTab === "manage_leaves" && <th className="p-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-wider text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {(activeTab === "my_leaves" ? myLeaves : manageLeaves).map((leave) => (
                  <tr key={leave.id} className="hover:bg-[var(--hover)]/50 transition-colors">
                    {activeTab === "manage_leaves" && (
                      <td className="p-4">
                        <div className="font-black text-sm text-[var(--text)]">{leave.user_name}</div>
                        <div className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mt-0.5">{leave.department_name || "Department"}</div>
                      </td>
                    )}
                    <td className="p-4 font-bold text-sm text-[var(--text)] capitalize">
                      {leave.type.replace('_', ' ')}
                    </td>
                    <td className="p-4 text-xs font-medium text-[var(--muted)] whitespace-nowrap">
                      {new Date(leave.start_date).toLocaleDateString()} <span className="mx-1 font-bold text-[var(--primary)]">→</span> {new Date(leave.end_date).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm font-black text-[var(--text)]">
                      {leave.total_days || 1} <span className="text-[10px] font-bold text-[var(--muted)] uppercase">days</span>
                    </td>
                    <td className="p-4">
                      {Number(leave.lwp_days) > 0 ? (
                        <span className="px-2 py-0.5 text-[10px] font-black bg-rose-500/10 text-rose-500 rounded-md border border-rose-500/20">
                          {leave.lwp_days} LWP
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--muted)] font-medium">Fully Paid</span>
                      )}
                    </td>
                    <td className="p-4 text-xs font-medium text-[var(--muted)] max-w-xs truncate">{leave.reason}</td>
                    <td className="p-4">{renderStatus(leave.status)}</td>
                    {activeTab === "manage_leaves" && (
                      <td className="p-4 text-right">
                        {leave.status === "pending" && (
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => handleStatusUpdate(leave.id, "approved")} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-colors cursor-pointer" title="Approve Leave">
                              <CheckCircle size={18} />
                            </button>
                            <button onClick={() => handleStatusUpdate(leave.id, "rejected")} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer" title="Reject Leave">
                              <XCircle size={18} />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
                {(activeTab === "my_leaves" ? myLeaves : manageLeaves).length === 0 && (
                  <tr>
                    <td colSpan={activeTab === "manage_leaves" ? "8" : "7"} className="p-12 text-center text-[var(--muted)]">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p className="text-sm font-bold">No leave records found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={activeTab === "my_leaves" ? myLeavesMeta.page : manageLeavesMeta.page}
            limit={activeTab === "my_leaves" ? myLeavesMeta.limit : manageLeavesMeta.limit}
            total={activeTab === "my_leaves" ? myLeavesMeta.total : manageLeavesMeta.total}
            totalPages={activeTab === "my_leaves" ? myLeavesMeta.totalPages : manageLeavesMeta.totalPages}
            onPageChange={activeTab === "my_leaves" ? handleMyLeavesPageChange : handleManageLeavesPageChange}
          />
        </div>
      )}

      {/* TAB CONTENT: TEAM ON LEAVE CALENDAR */}
      {activeTab === "calendar" && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-black tracking-tight mb-4 flex items-center gap-2">
            <Clock className="text-[var(--primary)]" size={18} /> Colleagues Currently On Leave Today
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colleaguesOnLeave.map((c) => (
              <div key={c.id} className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--hover)]/30 flex justify-between items-center">
                <div>
                  <div className="font-bold text-sm text-[var(--text)]">{c.user_name}</div>
                  <div className="text-xs text-[var(--muted)] mt-0.5 capitalize">{c.type.replace('_', ' ')}</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 text-[10px] font-black rounded-md bg-emerald-500/10 text-emerald-500">Active Leave</span>
                  <div className="text-[10px] text-[var(--muted)] mt-1">Until {new Date(c.end_date).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
            {colleaguesOnLeave.length === 0 && (
              <div className="col-span-full p-12 text-center text-[var(--muted)] border border-dashed border-[var(--border)] rounded-2xl">
                <Sparkles className="w-10 h-10 mx-auto mb-3 text-emerald-500 opacity-40" />
                <p className="text-sm font-bold">Full team availability! No colleagues are currently on leave today.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: PAYROLL & SALARY SHEET */}
      {activeTab === "payroll" && isManagement && (
        <div className="space-y-6">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-black tracking-tight text-[var(--text)] flex items-center gap-2">
                <DollarSign className="text-emerald-500" size={22} /> Employee Payroll & LWP Salary Deduction
              </h3>
              <p className="text-xs text-[var(--muted)] mt-1">
                Salary is only reduced when an employee takes unpaid leave (LWP) beyond their allocated free annual leave balance.
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 hover:bg-emerald-500 active:scale-95 transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              <Download size={15} strokeWidth={2.5} /> Export Salary Report (CSV)
            </button>
          </div>

          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--hover)] border-b border-[var(--border)]">
                    <th className="p-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-wider">Employee</th>
                    <th className="p-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-wider">Base Salary</th>
                    <th className="p-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-wider">Total Leaves Taken</th>
                    <th className="p-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-wider">LWP Days (Unpaid)</th>
                    <th className="p-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-wider">Salary Deduction</th>
                    <th className="p-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-wider text-right">Net Payable Salary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {salaryReport.map((row) => (
                    <tr key={row.employee_id} className="hover:bg-[var(--hover)]/50 transition-colors">
                      <td className="p-4">
                        <div className="font-black text-sm text-[var(--text)]">{row.name}</div>
                        <div className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mt-0.5">{row.department_name}</div>
                      </td>
                      <td className="p-4 text-sm font-bold text-[var(--text)]">₹{row.base_salary.toLocaleString()}</td>
                      <td className="p-4 text-sm font-medium text-[var(--muted)]">{row.total_leaves_taken} days</td>
                      <td className="p-4">
                        {row.lwp_days > 0 ? (
                          <span className="px-2 py-0.5 text-[10px] font-black bg-rose-500/10 text-rose-500 rounded-md border border-rose-500/20">
                            {row.lwp_days} LWP
                          </span>
                        ) : (
                          <span className="text-xs text-emerald-500 font-bold">0 LWP (Free Quota)</span>
                        )}
                      </td>
                      <td className="p-4 text-sm font-black text-rose-500">
                        {row.deduction > 0 ? `-₹${row.deduction.toLocaleString()}` : "₹0"}
                      </td>
                      <td className="p-4 text-sm font-black text-emerald-500 text-right">
                        ₹{row.net_salary.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {salaryReport.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-[var(--muted)]">
                        <p className="text-sm font-bold">No payroll records found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SUPER ADMIN POLICY SETUP */}
      {activeTab === "policies" && isSuperAdmin && (
        <div className="space-y-6">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-black tracking-tight text-[var(--text)]">Annual Quota Allocation</h3>
              <p className="text-xs text-[var(--muted)] mt-1">Automatically initialize or update annual leave balances for all active employees.</p>
            </div>
            <button
              onClick={handleAllocateQuotas}
              disabled={allocating}
              className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-bold flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={allocating ? "animate-spin" : ""} />
              {allocating ? "Allocating..." : "Allocate Quotas for 2026"}
            </button>
          </div>

          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-[var(--border)]">
              <h3 className="text-base font-black tracking-tight">Active Leave Policies</h3>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--hover)] border-b border-[var(--border)]">
                  <th className="p-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-wider">Leave Type</th>
                  <th className="p-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-wider">Annual Quota</th>
                  <th className="p-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-wider">Paid / Unpaid</th>
                  <th className="p-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-wider">Carry Forward Limit</th>
                  <th className="p-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {policies.map((p) => (
                  <tr key={p.id} className="hover:bg-[var(--hover)]/50 transition-colors">
                    <td className="p-4 font-bold text-sm text-[var(--text)]">{p.leave_type}</td>
                    <td className="p-4 text-sm font-black text-[var(--text)]">{p.annual_quota} <span className="text-xs font-medium text-[var(--muted)]">days/yr</span></td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-[10px] font-black rounded-md ${p.is_paid ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-500/10 text-zinc-500"}`}>
                        {p.is_paid ? "Paid Leave" : "Unpaid (LWP)"}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-bold text-[var(--muted)]">{p.carry_forward_limit} days</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-500/10 text-emerald-500 rounded-md">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* APPLY MODAL */}
      {showApplyModal && !isAdminOrSuper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--card)] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[var(--border)] animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black tracking-tight text-[var(--text)] mb-6 flex items-center gap-2">
              <Calendar className="text-[var(--primary)]" size={22} /> Apply for Leave
            </h2>
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-2">Leave Type</label>
                <select required value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] font-medium outline-none focus:border-[var(--primary)] transition-colors cursor-pointer">
                  <option value="casual">Casual Leave ({balances.find(b => b.leave_type === "Casual Leave")?.remaining ?? 12} avail)</option>
                  <option value="sick">Sick Leave ({balances.find(b => b.leave_type === "Sick Leave")?.remaining ?? 12} avail)</option>
                  <option value="earned">Earned Leave ({balances.find(b => b.leave_type === "Earned Leave")?.remaining ?? 18} avail)</option>
                  <option value="wfh">Work From Home</option>
                  <option value="half_day">Half Day (0.5 day)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-2">Start Date</label>
                  <input required type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] font-medium outline-none focus:border-[var(--primary)] transition-colors cursor-pointer" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-2">End Date</label>
                  <input required type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] font-medium outline-none focus:border-[var(--primary)] transition-colors cursor-pointer" />
                </div>
              </div>

              {calculatedDays > 0 && (
                <div className="p-3.5 rounded-xl bg-[var(--hover)] border border-[var(--border)] flex justify-between items-center text-xs font-bold">
                  <span className="text-[var(--muted)]">Calculated Duration:</span>
                  <span className="text-[var(--primary)] text-sm font-black">{calculatedDays} {calculatedDays === 1 ? "Day" : "Days"}</span>
                </div>
              )}

              {lwpDaysWarn > 0 && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs leading-relaxed flex gap-3 items-start animate-in fade-in duration-200">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black block mb-1">Quota Exceeded Notice</span>
                    Your request exceeds your remaining balance by <strong className="font-black underline">{lwpDaysWarn} days</strong>. Upon approval, these excess days will be automatically converted to <strong>Leave Without Pay (LWP)</strong>.
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-2">Reason / Medical Note</label>
                <textarea required rows="3" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} className="w-full p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] font-medium outline-none focus:border-[var(--primary)] transition-colors resize-none placeholder-[var(--muted)]/50" placeholder="Provide a brief explanation for your leave request..."></textarea>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--border)] mt-6">
                <button type="button" onClick={() => setShowApplyModal(false)} className="flex-1 p-3.5 rounded-xl border border-[var(--border)] font-bold bg-[var(--bg)] hover:bg-[var(--hover)] text-[var(--text)] transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 p-3.5 rounded-xl bg-[var(--primary)] text-white font-bold hover:brightness-110 transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-[var(--primary)]/20">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DIALOG COMPONENT */}
      {confirmAction && (
        <ConfirmDialog
          open={true}
          title={`${confirmAction.status === "approved" ? "Approve" : "Reject"} Leave Request`}
          message={`Are you sure you want to ${confirmAction.status} this leave request? The employee's leave balance will be adjusted accordingly.`}
          onConfirm={handleConfirmStatusUpdate}
          onClose={() => setConfirmAction(null)}
          confirmLabel={`Yes, ${confirmAction.status}`}
          cancelLabel="Cancel"
          variant={confirmAction.status === "approved" ? "warning" : "danger"}
        />
      )}
    </div>
  );
}

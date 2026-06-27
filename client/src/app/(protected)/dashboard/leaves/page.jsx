"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Calendar, Filter, Plus, FileText, CheckCircle, XCircle } from "lucide-react";
import { getMyLeavesThunk, getManageLeavesThunk, applyLeaveThunk, updateLeaveStatusThunk } from "@/features/leaves/thunks/leaveThunks";
import AppLoader from "@/components/common/AppLoader";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { showToast } from "@/lib/toast";

export default function LeavesPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myLeaves, manageLeaves, loading } = useSelector((state) => state.leaves);

  const isManagement = ["super_admin", "admin", "hr", "dept_head"].includes(user?.role?.toLowerCase());
  const [activeTab, setActiveTab] = useState("my_leaves");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const [formData, setFormData] = useState({
    type: "casual",
    startDate: "",
    endDate: "",
    reason: "",
  });

  useEffect(() => {
    dispatch(getMyLeavesThunk());
    if (isManagement) {
      dispatch(getManageLeavesThunk());
    }
  }, [dispatch, isManagement]);

  const handleApply = (e) => {
    e.preventDefault();
    dispatch(applyLeaveThunk(formData)).then(() => {
      setShowApplyModal(false);
      setFormData({ type: "casual", startDate: "", endDate: "", reason: "" });
      showToast.success("Leave Applied", "Your leave request has been submitted successfully.");
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
        showToast.success(
          "Leave Updated",
          `Leave request has been ${status} successfully.`
        );
      })
      .catch((err) => {
        showToast.error("Error", err || "Failed to update leave request");
      });
    setConfirmAction(null);
  };

  if (loading && myLeaves.length === 0) return <AppLoader />;

  const renderStatus = (status) => {
    const colors = {
      pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      approved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      rejected: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      cancelled: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
    };
    return (
      <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${colors[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full text-[var(--text)]">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--border)] pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3">
            <Calendar className="text-[var(--primary)]" />
            Leave Management
          </h1>
          <p className="mt-1 text-sm font-medium text-[var(--muted)]">Apply for time off and manage requests.</p>
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="bg-[var(--primary)] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[var(--primary)]/20"
        >
          <Plus size={16} /> Apply Leave
        </button>
      </div>

      {/* TABS (For Management) */}
      {isManagement && (
        <div className="flex gap-2 p-1.5 bg-[var(--card)] border border-[var(--border)] rounded-2xl w-max shadow-sm backdrop-blur-md">
          <button
            onClick={() => setActiveTab("my_leaves")}
            className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
              activeTab === "my_leaves" 
                ? "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20" 
                : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)]"
            }`}
          >
            My Leaves
          </button>
          <button
            onClick={() => setActiveTab("manage_leaves")}
            className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
              activeTab === "manage_leaves" 
                ? "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20" 
                : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)]"
            }`}
          >
            Manage Requests
          </button>
        </div>
      )}

      {/* TABLE DATA */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--hover)] border-b border-[var(--border)]">
                {activeTab === "manage_leaves" && <th className="p-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-wider">Employee</th>}
                <th className="p-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-wider">Type</th>
                <th className="p-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-wider">Duration</th>
                <th className="p-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-wider">Reason</th>
                <th className="p-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-wider">Status</th>
                {activeTab === "manage_leaves" && <th className="p-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-wider text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {(activeTab === "my_leaves" ? myLeaves : manageLeaves).map((leave) => (
                <tr key={leave.id} className="hover:bg-[var(--hover)] transition-colors">
                  {activeTab === "manage_leaves" && (
                    <td className="p-4">
                      <div className="font-black text-sm text-[var(--text)]">{leave.user_name}</div>
                      <div className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mt-0.5">{leave.department_name || "N/A"}</div>
                    </td>
                  )}
                  <td className="p-4 font-bold text-sm text-[var(--text)] capitalize">{leave.type.replace('_', ' ')}</td>
                  <td className="p-4 text-sm font-medium text-[var(--muted)] whitespace-nowrap">
                    {new Date(leave.start_date).toLocaleDateString()} <span className="mx-1">→</span> {new Date(leave.end_date).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-sm font-medium text-[var(--muted)] max-w-xs truncate">{leave.reason}</td>
                  <td className="p-4">{renderStatus(leave.status)}</td>
                  {activeTab === "manage_leaves" && (
                    <td className="p-4 text-right">
                      {leave.status === "pending" && (
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => handleStatusUpdate(leave.id, "approved")} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-colors">
                            <CheckCircle size={18} />
                          </button>
                          <button onClick={() => handleStatusUpdate(leave.id, "rejected")} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors">
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
                  <td colSpan={activeTab === "manage_leaves" ? "6" : "5"} className="p-12 text-center text-[var(--muted)]">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-bold">No leave requests found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPLY MODAL */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--card)] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[var(--border)]">
            <h2 className="text-xl font-black tracking-tight text-[var(--text)] mb-6">Apply for Leave</h2>
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-2">Leave Type</label>
                <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] font-medium outline-none focus:border-[var(--primary)] transition-colors">
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="earned">Earned Leave</option>
                  <option value="wfh">Work From Home</option>
                  <option value="half_day">Half Day</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-2">Start Date</label>
                  <input required type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] font-medium outline-none focus:border-[var(--primary)] transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-2">End Date</label>
                  <input required type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] font-medium outline-none focus:border-[var(--primary)] transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-2">Reason</label>
                <textarea required rows="3" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] font-medium outline-none focus:border-[var(--primary)] transition-colors resize-none placeholder-[var(--muted)]/50" placeholder="Brief explanation for your leave..."></textarea>
              </div>
              <div className="flex gap-3 pt-4 border-t border-[var(--border)] mt-6">
                <button type="button" onClick={() => setShowApplyModal(false)} className="flex-1 p-3.5 rounded-xl border border-[var(--border)] font-bold bg-[var(--bg)] hover:bg-[var(--hover)] text-[var(--text)] transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 p-3.5 rounded-xl bg-[var(--primary)] text-white font-bold hover:brightness-110 transition-all active:scale-[0.98]">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DIALOG COMPONENT */}
      {confirmAction && (
        <ConfirmDialog
          open={true}
          title={`${confirmAction.status === "approved" ? "Approve" : "Reject"} Leave`}
          message={`Are you sure you want to ${confirmAction.status} this leave request?`}
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

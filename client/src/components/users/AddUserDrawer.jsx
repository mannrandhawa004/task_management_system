"use client";

import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  UserPlus,
  Upload,
  User,
  Mail,
  Lock,
  Loader2,
  FileSpreadsheet,
  Eye,
  EyeOff,
  CloudLightning,
  Camera,
  Phone,
  Briefcase,
  Building2,
  Shield,
  Users2,
  Activity
} from "lucide-react";

import { createUserThunk, updateUserThunk, getRolesThunk } from "@/features/auth/thunks/authThunk";
import { getDepartmentsThunk } from "@/features/departments/thunks/departmentThunks";
import { getTeamsThunk } from "@/features/teams/thunks/teamThunks";
import { showToast } from "@/lib/toast";
import { api } from "@/lib/axios";

export default function AddUserDrawer({ open, onClose, page, limit, editingUser = null, onUserSaved }) {
  const dispatch = useDispatch();

  const [tab, setTab] = useState("manual");
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState([]);
  const [managersLoading, setManagersLoading] = useState(false);
  const avatarInputRef = useRef(null);

  // Profile Picture States
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Redux Selectors
  const { departmentsList } = useSelector((state) => state.departments);
  const { teamsList } = useSelector((state) => state.teams);
  const { roles } = useSelector((state) => state.auth);

  // Form Fields
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    employeeId: "",
    departmentId: "",
    roleId: "",
    teamId: "",
    managerId: "",
    status: "active",
    password: "",
  });

  // Fetch lists on drawer open
  useEffect(() => {
    if (open) {
      dispatch(getDepartmentsThunk({ page: 1, limit: 100 }));
      dispatch(getTeamsThunk({ page: 1, limit: 100 }));
      dispatch(getRolesThunk());
      fetchManagersList();

      if (editingUser) {
        setForm({
          firstName: editingUser.first_name || "",
          lastName: editingUser.last_name || "",
          email: editingUser.email || "",
          phone: editingUser.phone || "",
          employeeId: editingUser.employee_id || "",
          departmentId: editingUser.department_id || "",
          roleId: editingUser.role_id || "",
          teamId: editingUser.team_id || "",
          managerId: editingUser.reporting_manager_id || "",
          status: editingUser.status || "active",
          password: "", // password remains empty unless they change it
        });
        setAvatarPreview(editingUser.avatar || null);
        setAvatarFile(null);
      } else {
        setForm({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          employeeId: "",
          departmentId: "",
          roleId: "",
          teamId: "",
          managerId: "",
          status: "active",
          password: "",
        });
        setAvatarPreview(null);
        setAvatarFile(null);
      }
    }
  }, [open, editingUser, dispatch]);

  const fetchManagersList = async () => {
    try {
      setManagersLoading(true);
      const res = await api.get("/users?limit=1000");
      setManagers(res.data?.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch potential reporting managers:", err);
    } finally {
      setManagersLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Reset team/manager if department changes to prevent invalid relationships
      if (name === "departmentId") {
        updated.teamId = "";
        updated.managerId = "";
      }
      return updated;
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return showToast.error("Invalid File Type", "Please choose an image file (PNG, JPG, WEBP).");
    }
    if (file.size > 5 * 1024 * 1024) {
      return showToast.error("File Too Large", "Profile image must be less than 5MB.");
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("firstName", form.firstName);
      formData.append("lastName", form.lastName);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("employeeId", form.employeeId);
      formData.append("departmentId", form.departmentId);
      formData.append("roleId", form.roleId);
      if (form.teamId) formData.append("teamId", form.teamId);
      if (form.managerId) formData.append("managerId", form.managerId);
      formData.append("status", form.status);

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      let result;
      if (editingUser) {
        result = await dispatch(updateUserThunk({ id: editingUser.id, formData }));
      } else {
        formData.append("password", form.password);
        result = await dispatch(createUserThunk(formData));
      }

      if (createUserThunk.fulfilled.match(result) || updateUserThunk.fulfilled.match(result)) {
        showToast.success(editingUser ? "Employee updated successfully." : "Employee created successfully.");
        if (onUserSaved) onUserSaved();
        onClose();
      } else {
        showToast.error(result.payload || "Failed to save employee entry.");
      }
    } catch (err) {
      console.error(err);
      showToast.error("An error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  // Filter teams and managers based on selected department
  const filteredTeams = teamsList.filter(
    (t) => t.department_id === Number(form.departmentId)
  );

  const filteredManagers = managers.filter((m) => {
    const managerRoleId = Number(m.role_id);
    const isGlobalManager = managerRoleId === 1 || managerRoleId === 5; // Admin / Super Admin
    return isGlobalManager || m.department_id === Number(form.departmentId);
  });

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-all h-screen duration-300 ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      <aside
        className={`fixed top-0 right-0 z-50 h-screen w-full sm:w-[500px] flex flex-col transition-transform duration-300 ease-out shadow-2xl ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          background: "var(--card)",
          borderLeft: "1px solid var(--border)",
        }}
      >
        {/* HEADER */}
        <div className="p-6 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
                {editingUser ? "Edit Employee details" : "Add Employee Account"}
              </h2>
              <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                {editingUser
                  ? "Modify department, role, team and reporting manager settings."
                  : "Provision a new internal company employee and set their role & department."}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border transition-colors hover:bg-neutral-500/10 cursor-pointer text-[var(--text)] shrink-0"
              style={{ background: "var(--input)", borderColor: "var(--border)" }}
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* DRAWERS BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center justify-center space-y-2 pb-2">
              <label className="w-full text-xs font-bold tracking-wide text-left" style={{ color: "var(--text)" }}>
                Profile Picture <span className="text-[var(--muted)] font-normal text-[10px]">(Optional)</span>
              </label>

              <div
                onClick={() => avatarInputRef.current?.click()}
                className="group relative h-20 w-20 cursor-pointer rounded-2xl border-2 border-dashed flex items-center justify-center transition-all overflow-hidden"
                style={{
                  background: "var(--input)",
                  borderColor: avatarPreview ? "var(--primary)" : "var(--border)",
                }}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <User size={22} className="text-[var(--muted)] opacity-50 group-hover:scale-110 transition-transform" />
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera size={16} className="text-white" />
                </div>
              </div>
              <input
                type="file"
                ref={avatarInputRef}
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              {avatarPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setAvatarFile(null);
                    setAvatarPreview(null);
                  }}
                  className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
                >
                  Remove Image
                </button>
              )}
            </div>

            {/* Name Grid */}
            <div className="grid grid-cols-2 gap-4">
              <InputField
                icon={User}
                label="First Name"
                name="firstName"
                placeholder="e.g. John"
                value={form.firstName}
                onChange={handleChange}
                required
              />
              <InputField
                icon={User}
                label="Last Name"
                name="lastName"
                placeholder="e.g. Doe"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <InputField
              icon={Mail}
              label="Company Email Address"
              type="email"
              name="email"
              placeholder="employee@company.com"
              value={form.email}
              onChange={handleChange}
              required
            />

            <InputField
              icon={Phone}
              label="Phone Number"
              name="phone"
              placeholder="+1234567890"
              value={form.phone}
              onChange={handleChange}
            />

            <InputField
              icon={Briefcase}
              label="Employee ID"
              name="employeeId"
              placeholder="e.g. EMP-0098"
              value={form.employeeId}
              onChange={handleChange}
              required
            />

            {/* Department Select */}
            <SelectField
              icon={Building2}
              label="Department"
              name="departmentId"
              value={form.departmentId}
              onChange={handleChange}
              placeholder="Select Department"
              options={departmentsList.map((d) => ({ value: d.id, label: d.name }))}
              required
            />

            {/* Role Select */}
            <SelectField
              icon={Shield}
              label="Role"
              name="roleId"
              value={form.roleId}
              onChange={handleChange}
              placeholder="Select System Role"
              options={roles.map((r) => ({ value: r.id, label: r.name.toUpperCase() }))}
              required
            />

            {/* Team Select (conditional on Department selection) */}
            <SelectField
              icon={Users2}
              label="Team (Optional)"
              name="teamId"
              value={form.teamId}
              onChange={handleChange}
              placeholder={form.departmentId ? "Select Team" : "Select Department First"}
              options={filteredTeams.map((t) => ({ value: t.id, label: t.name }))}
              disabled={!form.departmentId}
            />

            {/* Reporting Manager Select (conditional on Department selection) */}
            <SelectField
              icon={User}
              label="Reporting Manager (Optional)"
              name="managerId"
              value={form.managerId}
              onChange={handleChange}
              placeholder={
                managersLoading
                  ? "Loading managers..."
                  : form.departmentId
                  ? "Select Reporting Manager"
                  : "Select Department First"
              }
              options={filteredManagers.map((m) => ({
                value: m.id,
                label: `${m.name} (${m.role})`,
              }))}
              disabled={!form.departmentId || managersLoading}
            />

            {/* Status Select */}
            <SelectField
              icon={Activity}
              label="Account Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              placeholder="Select Status"
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Pending hold" },
                { value: "suspended", label: "Suspended" },
              ]}
              required
            />

            {/* Password (Only required for new users) */}
            {(!editingUser) && (
              <InputField
                icon={Lock}
                label="Access Password"
                type="password"
                name="password"
                placeholder="Construct temporary key phrase"
                value={form.password}
                onChange={handleChange}
                required
              />
            )}

            <div className="pt-3">
              <PrimaryButton loading={loading} icon={UserPlus}>
                {editingUser ? "Save Employee Changes" : "Commit Employee Account"}
              </PrimaryButton>
            </div>
          </form>
        </div>
      </aside>
    </>
  );
}

function InputField({ icon: Icon, label, type = "text", ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold tracking-wide" style={{ color: "var(--text)" }}>
        {label}
      </label>

      <div
        className="flex items-center gap-3 rounded-xl border px-3.5 transition-all duration-200 ease-in-out focus-within:ring-2 focus-within:ring-[var(--primary)]/10 focus-within:border-[var(--primary)]"
        style={{ background: "var(--input)", borderColor: "var(--border)", color: "var(--text)" }}
      >
        <Icon size={16} className="shrink-0 text-[var(--muted)] opacity-60" />

        <input
          {...props}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          className="w-full bg-transparent py-3.5 text-xs font-medium outline-none placeholder:opacity-40"
          style={{ color: "var(--text)" }}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-neutral-400 hover:text-[var(--text)] transition-colors cursor-pointer shrink-0 p-1 rounded"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  );
}

function SelectField({ icon: Icon, label, options, value, onChange, placeholder, ...props }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold tracking-wide" style={{ color: "var(--text)" }}>
        {label}
      </label>
      <div
        className="flex items-center gap-3 rounded-xl border px-3.5 transition focus-within:ring-2 focus-within:ring-[var(--primary)]/10 focus-within:border-[var(--primary)]"
        style={{ background: "var(--input)", borderColor: "var(--border)", color: "var(--text)" }}
      >
        {Icon && <Icon size={16} className="shrink-0 text-[var(--muted)] opacity-60" />}
        <select
          value={value}
          onChange={onChange}
          className="w-full bg-transparent py-3.5 text-xs font-medium outline-none appearance-none cursor-pointer text-[var(--text)]"
          {...props}
        >
          <option value="" className="bg-[var(--card)] text-[var(--muted)]">
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[var(--card)] text-[var(--text)]">
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function PrimaryButton({ loading, icon: Icon, children, ...props }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className="w-full rounded-xl py-3.5 flex items-center justify-center gap-2 text-xs font-bold text-white transition active:scale-98 disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-sm hover:opacity-95"
      style={{ background: "var(--primary)" }}
    >
      {loading ? (
        <Loader2 size={15} className="animate-spin" />
      ) : (
        <Icon size={15} strokeWidth={2.5} />
      )}
      {loading ? "Processing Pipelines..." : children}
    </button>
  );
}
"use client";

import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
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
    Camera // Added for avatar upload indicator
} from "lucide-react";

import { registerThunk, getAllUsersThunk } from "@/features/auth/thunks/authThunk";
import { showToast } from "@/lib/toast";

export default function AddUserDrawer({ open, onClose, page, limit }) {
    const dispatch = useDispatch();

    const [tab, setTab] = useState("manual");
    const [loading, setLoading] = useState(false);
    const [csvLoading, setCsvLoading] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const avatarInputRef = useRef(null); // Ref for hidden avatar input

    // --- New Profile Picture States ---
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    // --- New Avatar Handler ---
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

    const refreshUsers = () => {
        dispatch(getAllUsersThunk({ page, limit }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 📦 Transform standard object into FormData for handling the raw file binary safely
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("email", form.email);
            formData.append("password", form.password);
            
            if (avatarFile) {
                formData.append("avatar", avatarFile); // Key names match back-end uploadProfilePic.single("avatar")
            }

            // Dispatching the multipart form matrix directly to the registry operation
            const result = await dispatch(registerThunk(formData));

            if (registerThunk.fulfilled.match(result)) {
                showToast.success("User created successfully.");
                refreshUsers();
                
                // Reset text inputs and local file targets
                setForm({ name: "", email: "", password: "" });
                setAvatarFile(null);
                setAvatarPreview(null);
                onClose();
            } else {
                showToast.error(result.payload || "Failed to provision user entry.");
            }
        } finally {
            setLoading(false);
        }
    };

    // --- Drag & Drop Operations ---
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type === "text/csv") {
            setCsvFile(file);
        } else {
            showToast.error("Invalid File Type", "Please drop a valid .csv file.");
        }
    };

    return (
        <>
            {/* Structural Layer Overlay */}
            <div
                onClick={onClose}
                className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-all h-screen duration-300 ${open ? "opacity-100 visible" : "opacity-0 invisible"
                    }`}
            />

            {/* Slide-out Drawer Panel Frame */}
            <aside
                className={`fixed top-0 right-0 z-50 h-screen w-full sm:w-[460px] flex flex-col transition-transform duration-300 ease-out shadow-2xl ${open ? "translate-x-0" : "translate-x-full"
                    }`}
                style={{
                    background: "var(--card)",
                    borderLeft: "1px solid var(--border)",
                }}
            >
                {/* HEADER SECTION HEADER */}
                <div className="p-6 border-b" style={{ borderColor: "var(--border)" }}>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
                                Add Users
                            </h2>
                            <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                                Provision a singular user manually or upload bulk registers using a custom CSV manifest template.
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

                    {/* Segmented Tab Row Control */}
                    <div
                        className="mt-6 flex p-1 rounded-xl gap-1 border"
                        style={{ background: "var(--input)", borderColor: "var(--border)" }}
                    >
                        <TabButton active={tab === "manual"} onClick={() => setTab("manual")} icon={UserPlus}>
                            Manual Input
                        </TabButton>
                        <TabButton active={tab === "csv"} onClick={() => setTab("csv")} icon={Upload}>
                            Bulk CSV Ingest
                        </TabButton>
                    </div>
                </div>

                {/* DRAWERS BODY WRAPPER SCROLL AREA */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {tab === "manual" && (
                        <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-200">
                            
                            {/* --- Optional Profile Pic Upload Component --- */}
                            <div className="flex flex-col items-center justify-center space-y-2 pb-2">
                                <label className="w-full text-xs font-bold tracking-wide text-left" style={{ color: "var(--text)" }}>
                                    Profile Picture <span className="text-[var(--muted)] font-normal text-[10px]">(Optional)</span>
                                </label>
                                
                                <div 
                                    onClick={() => avatarInputRef.current?.click()}
                                    className="group relative h-20 w-20 cursor-pointer rounded-2xl border-2 border-dashed flex items-center justify-center transition-all overflow-hidden"
                                    style={{ 
                                        background: "var(--input)", 
                                        borderColor: avatarPreview ? "var(--primary)" : "var(--border)" 
                                    }}
                                >
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <User size={22} className="text-[var(--muted)] opacity-50 group-hover:scale-110 transition-transform" />
                                    )}
                                    
                                    {/* Action Hover Shade layer overlay */}
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
                                {avatarFile && (
                                    <button 
                                        type="button" 
                                        onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}
                                        className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
                                    >
                                        Remove Image
                                    </button>
                                )}
                            </div>

                            <InputField
                                icon={User}
                                label="Full Identity Name"
                                name="name"
                                placeholder="e.g. Alexander Wright"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                            <InputField
                                icon={Mail}
                                label="Workspace Email Address"
                                type="email"
                                name="email"
                                placeholder="alex@workspace.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                            <InputField
                                icon={Lock}
                                label="Access Security Password"
                                type="password"
                                name="password"
                                placeholder="Construct safe key phrase"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />

                            <div className="pt-3">
                                <PrimaryButton loading={loading} icon={UserPlus}>
                                    Commit User Account
                                </PrimaryButton>
                            </div>
                        </form>
                    )}

                    {tab === "csv" && (
                        <div className="space-y-5 animate-in fade-in duration-200">
                            {/* Premium Drag and Drop Zone Canvas Frame */}
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${isDragging
                                    ? "border-[var(--primary)] bg-[var(--primary)]/5"
                                    : "border(--border) hover:border-neutral-400/30"
                                    }`}
                                style={{ background: "var(--input)" }}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept=".csv"
                                    onChange={(e) => setCsvFile(e.target.files[0])}
                                    className="hidden"
                                />

                                <div
                                    className="p-4 rounded-xl mb-4 text-[var(--muted)] border"
                                    style={{ background: "var(--card)", borderColor: "var(--border)" }}
                                >
                                    <FileSpreadsheet size={24} strokeWidth={1.5} className={isDragging ? "text-[var(--primary)] scale-110 transition-transform" : ""} />
                                </div>

                                <h3 className="text-sm font-bold tracking-tight" style={{ color: "var(--text)" }}>
                                    {csvFile ? "Roster File Staged" : "Upload Manifest Document"}
                                </h3>
                                <p className="mt-1 text-xs max-w-[260px] leading-relaxed" style={{ color: "var(--muted)" }}>
                                    Drag & drop your file sheet right here, or click anywhere to open local file explorer systems.
                                </p>

                                <div
                                    className="mt-4 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border"
                                    style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--muted)" }}
                                >
                                    Template Format: name, email, password
                                </div>
                            </div>

                            {/* Upload Target Context State Feedback Row Banner */}
                            {csvFile && (
                                <div
                                    className="flex items-center justify-between p-4 rounded-xl border animate-in slide-in-from-bottom-2 duration-200"
                                    style={{ background: "var(--input)", borderColor: "var(--border)" }}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <CloudLightning size={16} className="text-[var(--primary)] shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold truncate" style={{ color: "var(--text)" }}>{csvFile.name}</p>
                                            <p className="text-[10px] mt-0.5" style={{ color: "var(--muted)" }}>{(csvFile.size / 1024).toFixed(1)} KB file space size</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setCsvFile(null); }}
                                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                                    >
                                        <X size={14} strokeWidth={2.5} />
                                    </button>
                                </div>
                            )}

                            <div className="pt-3">
                                <PrimaryButton
                                    onClick={(e) => { e.stopPropagation(); /* handleCSVImport(); */ }} // Note: component missed defining this function originally
                                    loading={csvLoading}
                                    disabled={!csvFile}
                                    icon={Upload}
                                >
                                    Deploy Bulk Registers
                                </PrimaryButton>
                            </div>
                        </div>
                    )}
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

function TabButton({ children, active, icon: Icon, ...props }) {
    return (
        <button
            type="button"
            {...props}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${active
                ? "text-[var(--primary)] shadow-xs font-extrabold"
                : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
            style={{ background: active ? "var(--card)" : "transparent" }}
        >
            <Icon size={14} strokeWidth={active ? 2.5 : 2} />
            {children}
        </button>
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
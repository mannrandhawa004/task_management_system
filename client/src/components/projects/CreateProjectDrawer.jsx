"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { X, FolderPlus, Loader2, Info } from "lucide-react";
import { createProjectThunk, getProjectsThunk } from "@/features/projects/thunks/projectThunk";
import { createProjectSchema } from "@/features/projects/validations/project.schema";
import { showToast } from "@/lib/toast";

export default function CreateProjectDrawer({ open, onClose }) {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({ name: "", description: "" });

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (errors[e.target.name]) {
            setErrors((prev) => ({ ...prev, [e.target.name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validated = createProjectSchema.safeParse(form);

        if (!validated.success) {
            const fieldErrors = {};
            validated.error.errors.forEach((err) => {
                fieldErrors[err.path[0]] = err.message;
            });
            return setErrors(fieldErrors);
        }

        setLoading(true);
        try {
            const result = await dispatch(createProjectThunk(form));
            if (createProjectThunk.fulfilled.match(result)) {
                showToast.success("Project created successfully");
                dispatch(getProjectsThunk({ page: 1, limit: 10 }));
                setForm({ name: "", description: "" });
                onClose();
            }
        } catch (err) {
            showToast.error("Failed to construct the workspace dashboard layout.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* DIALOG BACKDROP SCREEN */}
            <div
                onClick={onClose}
                className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? "visible opacity-100" : "invisible opacity-0"
                    }`}
            />

            {/* DRAWER VIEW SLIDER PANEL */}
            <aside
                className={`fixed top-0 right-0 h-screen w-full sm:w-[540px] z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"
                    }`}
                style={{
                    background: "var(--profile)",
                    borderLeft: "1px solid var(--border)",
                }}
            >
                {/* PANEL HEADER ELEMENT */}
                <div className="flex justify-between items-center px-8 py-6 border-b" style={{ borderColor: "var(--border)" }}>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
                            Create New Project
                        </h2>
                        <p className="text-xs font-medium mt-0.5" style={{ color: "var(--muted)" }}>
                            Establish a new central operational node framework.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl transition hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                        style={{ color: "var(--text)" }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* INPUT LAYOUT FORM COMPONENT */}
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between p-8 overflow-y-auto space-y-6">
                    <div className="space-y-5">
                        {/* COMPONENT ELEMENT: PROJECT TITLES */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold tracking-wide" style={{ color: "var(--text)" }}>
                                Project Target Title
                            </label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="e.g., Enterprise Client Portal Automation"
                                className="w-full rounded-xl border px-4 py-3.5 text-sm outline-none transition-all focus:ring-2"
                                style={{
                                    background: "var(--input)",
                                    color: "var(--text)",
                                    borderColor: errors.name ? "#ef4444" : "var(--border)",
                                }}
                            />
                            {errors.name && (
                                <p className="flex items-center gap-1.5 text-xs font-medium text-red-500 mt-1">
                                    <Info size={12} /> {errors.name}
                                </p>
                            )}
                        </div>

                        {/* COMPONENT ELEMENT: TEXT SUMMARY BOUNDS */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold tracking-wide" style={{ color: "var(--text)" }}>
                                Description Summary
                            </label>
                            <textarea
                                rows={5}
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Outline core objectives, parameters, scope details, and team layout rules..."
                                className="w-full rounded-xl border p-4 text-sm outline-none resize-none transition-all focus:ring-2"
                                style={{
                                    background: "var(--input)",
                                    color: "var(--text)",
                                    borderColor: errors.description ? "#ef4444" : "var(--border)",
                                }}
                            />
                            {errors.description && (
                                <p className="flex items-center gap-1.5 text-xs font-medium text-red-500 mt-1">
                                    <Info size={12} /> {errors.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* PERSISTENCE TRIGGER ACTION CONTAINER */}
                    <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                        <button
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 rounded-xl py-4 font-bold shadow-md tracking-wide cursor-pointer select-none transition-all duration-200 active:scale-98 disabled:opacity-50"
                            style={{
                                background: "var(--primary)",
                                color: "#fff",
                            }}
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <FolderPlus size={18} />
                            )}
                            {loading ? "Constructing Layout..." : "Initialize New Project"}
                        </button>
                    </div>
                </form>
            </aside>
        </>
    );
}
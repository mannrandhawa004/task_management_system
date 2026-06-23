"use client";

import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    ClipboardList,
    CalendarDays,
    Flag,
    FileText,
    Loader2,
    Sparkles,
    CheckCircle2
} from "lucide-react";

import { createTaskSchema } from "@/features/tasks/validations/task.schmea";
import { createTaskThunk, getProjectTasksThunk } from "@/features/tasks/thunks/taskThunk";
import { showToast } from "@/lib/toast";

export default function CreateTaskForm({ onSuccess, projectId, onCancel }) {
    const dispatch = useDispatch();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        resolver: zodResolver(createTaskSchema),
        defaultValues: {
            title: "",
            description: "",
            priority: "medium",
            due_date: "",
        },
    });

    const onSubmit = async (data) => {
        try {
            await dispatch(createTaskThunk({ projectId, data })).unwrap();
            await dispatch(getProjectTasksThunk({ projectId, page: 1, limit: 10 })).unwrap();

            reset();
            onSuccess?.();
            showToast.success("Task initialized successfully");
        } catch (error) {
            console.error(error);
            showToast.error(error?.message || "Failed to process task parameters.");
        }
    };

    return (
        <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* TASK TITLE */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: "var(--muted)" }}>
                        <ClipboardList size={14} className="text-[var(--primary)]" />
                        Task Specification Title
                    </label>
                    <input
                        {...register("title")}
                        placeholder="e.g., Architect production telemetry pipeline"
                        className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[var(--primary)]/20"
                        style={{
                            background: "var(--input)",
                            color: "var(--text)",
                            borderColor: errors.title ? "#ef4444" : "var(--border)"
                        }}
                    />
                    {errors.title && (
                        <p className="text-xs font-medium text-red-500 mt-1 flex items-center gap-1">⚠️ {errors.title.message}</p>
                    )}
                </div>

                {/* DESCRIPTION */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: "var(--muted)" }}>
                        <FileText size={14} />
                        Context & Objectives
                    </label>
                    <textarea
                        rows={4}
                        {...register("description")}
                        placeholder="Provide deep structural data requirements or execution goals..."
                        className="w-full rounded-xl border px-4 py-3 text-sm outline-none resize-none transition focus:ring-2 focus:ring-[var(--primary)]/20"
                        style={{
                            background: "var(--input)",
                            color: "var(--text)",
                            borderColor: "var(--border)"
                        }}
                    />
                </div>

                {/* SPECIFICATION PARAMETERS GRID */}
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: "var(--muted)" }}>
                            <Flag size={14} />
                            Priority Matrix
                        </label>
                        <select
                            {...register("priority")}
                            className="w-full rounded-xl border px-4 py-3 text-sm outline-none cursor-pointer transition focus:ring-2 focus:ring-[var(--primary)]/20"
                            style={{
                                background: "var(--input)",
                                color: "var(--text)",
                                borderColor: "var(--border)"
                            }}
                        >
                            <option value="low">Low Severity</option>
                            <option value="medium">Medium Urgency</option>
                            <option value="high">High Velocity Critical</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: "var(--muted)" }}>
                            <CalendarDays size={14} />
                            Target Delivery Date
                        </label>
                        <input
                            type="date"
                            {...register("due_date")}
                            className="w-full rounded-xl border px-4 py-3 text-sm outline-none cursor-pointer transition focus:ring-2 focus:ring-[var(--primary)]/20"
                            style={{
                                background: "var(--input)",
                                color: "var(--text)",
                                borderColor: "var(--border)"
                            }}
                        />
                    </div>
                </div>

                {/* SUBMIT FOOTER ACTIONS */}
                <div className="pt-6 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={{ borderColor: "var(--border)" }}>
                    <div className="flex items-center gap-2 text-xs font-medium" style={{ color: "var(--muted)" }}>
                        <Sparkles size={14} className="text-amber-500" />
                        Default State: <strong className="text-[var(--text)]">To Do backlog pool</strong>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold border transition active:scale-98 cursor-pointer"
                            style={{
                                background: "var(--card)",
                                color: "var(--text)",
                                borderColor: "var(--border)"
                            }}
                        >
                            Discard
                        </button>

                        <button
                            disabled={isSubmitting}
                            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50 cursor-pointer"
                            style={{ background: "var(--primary)" }}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Staging...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={16} />
                                    Deploy Task
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
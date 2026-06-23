"use client";

import { Loader2, TriangleAlert, Trash2, ShieldAlert } from "lucide-react";

/**
 * Reusable confirmation dialog.
 *
 * Props:
 *  open         — boolean, controls visibility
 *  onClose      — () => void, called on Cancel / backdrop click
 *  onConfirm    — () => void, called on confirm button click
 *  title        — string, dialog heading
 *  message      — string | ReactNode, body text
 *  confirmLabel — string (default: "Confirm"), text on the confirm button
 *  cancelLabel  — string (default: "Cancel"), text on the cancel button
 *  variant      — "danger" | "warning" (default: "danger"), controls icon + button color
 *  loading      — boolean, shows spinner on confirm button when true
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
}) {
  if (!open) return null;

  const isDanger = variant === "danger";
  const accentColor = isDanger ? "#ef4444" : "#f59e0b";
  const accentBg = isDanger ? "rgba(239,68,68,.12)" : "rgba(245,158,11,.12)";
  const Icon = isDanger ? Trash2 : ShieldAlert;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-3xl border p-7 shadow-2xl mx-4 animate-in zoom-in-95 duration-200"
        style={{
          background: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        {/* Icon + Text */}
        <div className="flex gap-4">
          <div
            className="h-14 w-14 shrink-0 rounded-2xl flex items-center justify-center"
            style={{ background: accentBg }}
          >
            <Icon size={24} color={accentColor} strokeWidth={2.5} />
          </div>

          <div className="min-w-0">
            <h2
              className="text-base font-extrabold tracking-tight leading-snug"
              style={{ color: "var(--text)" }}
            >
              {title}
            </h2>
            <p
              className="mt-1.5 text-xs leading-relaxed"
              style={{ color: "var(--muted)" }}
            >
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl px-5 py-2.5 text-xs font-bold transition-colors hover:brightness-95 disabled:opacity-50 cursor-pointer"
            style={{
              background: "var(--input)",
              color: "var(--text)",
              border: "1px solid var(--border)",
            }}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="rounded-xl px-5 py-2.5 text-xs font-bold flex items-center gap-2 disabled:opacity-60 cursor-pointer transition-all hover:brightness-110 active:scale-98"
            style={{
              background: accentColor,
              color: "#fff",
            }}
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Icon size={14} strokeWidth={2.5} />
            )}
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

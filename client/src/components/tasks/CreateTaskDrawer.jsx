"use client";

import { useEffect } from "react";
import { X, ClipboardList } from "lucide-react";
import CreateTaskForm from "./CreateTaskForm";

export default function CreateTaskDrawer({ open, onClose, projectId }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 ${open ? "visible" : "invisible"}`}>
      {/* SHIELD OVERLAY BACKDROP */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
      />

      {/* COMPOSITION DRAWER CORE SLIDER */}
      <aside
        className={`absolute right-0 top-0 h-full w-full sm:w-[600px] shadow-2xl transition-transform duration-300 ease-out flex flex-col ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{
          background: "var(--card)",
          borderLeft: "1px solid var(--border)",
        }}
      >
        {/* STRUCTURAL COMPOSE HEADER */}
        <div className="px-6 sm:px-8 py-5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl text-white shadow-sm flex items-center justify-center shrink-0" style={{ background: "var(--primary)" }}>
              <ClipboardList size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight" style={{ color: "var(--text)" }}>
                Compose Task Entry
              </h2>
              <p className="text-xs font-medium mt-0.5" style={{ color: "var(--muted)" }}>
                Instantiate a new structural milestone target context block.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-[var(--muted)] hover:bg-black/5 dark:hover:bg-white/5 transition transition-all cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* INPUT LAYOUT CORE BODY */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <CreateTaskForm
            projectId={projectId}
            onCancel={onClose}
            onSuccess={() => {
              onClose();
            }}
          />
        </div>
      </aside>
    </div>
  );
}
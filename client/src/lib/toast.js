import toast from "react-hot-toast";

import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

export const showToast = {
  success: (title, description) => {
    toast.custom((t) => (
      <div
        className={`w-[340px] relative rounded-3xl border p-5 shadow-2xl backdrop-blur-xl transition-all duration-300

        ${t.visible ? "animate-enter" : "animate-leave"}`}
        style={{
          background: "var(--card)",
          borderColor: "var(--border)",
          color: "var(--text)",
        }}
      >
        <div className="flex gap-4">
          <div className="mt-1 text-emerald-500">
            <CheckCircle2 size={22} />
          </div>

          <div className="flex-1">
            <h4 className="font-semibold">{title}</h4>

            <p
              className="mt-1 text-sm"
              style={{
                color: "var(--muted)",
              }}
            >
              {description}
            </p>
          </div>

          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-xs opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      </div>
    ));
  },

  error: (title, description) => {
    toast.custom((t) => (
      <div
        className="w-[340px] rounded-3xl border p-5 backdrop-blur-xl shadow-xl"
        style={{
          background: "var(--card)",
          borderColor: "var(--border)",
          color: "var(--text)",
        }}
      >
        <div className="flex gap-4">
          <XCircle size={22} className="text-red-500 text-center" />

          <div className="flex-1">
            <h4 className="font-semibold">{title}</h4>

            <p
              className="mt-1 text-sm"
              style={{
                color: "var(--muted)",
              }}
            >
              {description}
            </p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-xs opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      </div>
    ));
  },

  warning: (title, description) => {
    toast.custom((t) => (
      <div
        className="w-[340px] rounded-3xl border p-5 backdrop-blur-xl shadow-xl"
        style={{
          background: "var(--card)",
          borderColor: "var(--border)",
          color: "var(--text)",
        }}
      >
        <div className="flex gap-4">
          <AlertTriangle size={22} className="text-amber-500" />

          <div className="flex-1">
            <h4 className="font-semibold">{title}</h4>

            <p
              className="mt-1 text-sm"
              style={{
                color: "var(--muted)",
              }}
            >
              {description}
            </p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-xs opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      </div>
    ));
  },

  info: (title, description) => {
    toast.custom((t) => (
      <div
        className="w-[340px] rounded-3xl border p-5 backdrop-blur-xl shadow-xl"
        style={{
          background: "var(--card)",
          borderColor: "var(--border)",
          color: "var(--text)",
        }}
      >
        <div className="flex gap-4">
          <Info size={22} className="text-blue-500" />

          <div className="flex-1">
            <h4 className="font-semibold">{title}</h4>

            <p
              className="mt-1 text-sm"
              style={{
                color: "var(--muted)",
              }}
            >
              {description}
            </p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-xs opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      </div>
    ));
  },
};

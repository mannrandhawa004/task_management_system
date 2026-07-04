import toast from "react-hot-toast";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

const renderToast = (t, { icon: Icon, bgClass, title, description }) => (
  <div
    className={`max-w-[90vw] rounded-full border border-white/20 px-6 py-3.5 shadow-2xl backdrop-blur-xl pointer-events-auto flex items-center gap-3 transition-all duration-300 text-white ${bgClass} ${
      t.visible ? "animate-enter opacity-100 translate-y-0 scale-100" : "animate-leave opacity-0 translate-y-4 scale-95"
    }`}
  >
    <Icon size={18} className="shrink-0 stroke-[2.5]" />

    <div className="flex-1 min-w-0 text-xs font-black tracking-wide leading-snug">
      <span>{title}</span>
      {description && <span className="ml-1.5 font-medium opacity-90">({description})</span>}
    </div>

    <button
      onClick={() => toast.dismiss(t.id)}
      className="p-1 rounded-full hover:bg-black/20 text-white/80 hover:text-white transition-colors shrink-0 cursor-pointer ml-1"
      aria-label="Close notification"
    >
      <X size={14} className="stroke-[2.5]" />
    </button>
  </div>
);

export const showToast = {
  success: (title, description) => {
    toast.custom((t) =>
      renderToast(t, {
        icon: CheckCircle2,
        bgClass: "bg-[var(--primary)]",
        title,
        description,
      })
    );
  },

  error: (title, description) => {
    toast.custom((t) =>
      renderToast(t, {
        icon: XCircle,
        bgClass: "bg-rose-600 dark:bg-rose-500",
        title,
        description,
      })
    );
  },

  warning: (title, description) => {
    toast.custom((t) =>
      renderToast(t, {
        icon: AlertTriangle,
        bgClass: "bg-amber-600 dark:bg-amber-500",
        title,
        description,
      })
    );
  },

  info: (title, description) => {
    toast.custom((t) =>
      renderToast(t, {
        icon: Info,
        bgClass: "bg-[var(--primary)]",
        title,
        description,
      })
    );
  },
};


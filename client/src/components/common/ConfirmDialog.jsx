"use client";

import { Loader2, TriangleAlert } from "lucide-react";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  loading,
}) {
  if (!open) return null;

  return (
    <div
      className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/50
            backdrop-blur-sm
            min-h-screen
            "
    >
      <div
        className="
                w-full
                max-w-md
                rounded-3xl
                border
                p-7
                shadow-2xl
                "
        style={{
          background: "var(--card)",

          borderColor: "var(--border)",
        }}
      >
        <div className="flex gap-4">
          <div
            className="
                        h-14
                        w-14
                        rounded-full
                        flex
                        items-center
                        justify-center
                        p-4
                        "
            style={{
              background: "rgba(239,68,68,.12)",
            }}
          >
            <TriangleAlert size={28} color="#ef4444" />
          </div>

          <div>
            <h2
              className="
                            text-xl
                            font-bold
                            "
              style={{
                color: "var(--text)",
              }}
            >
              {title}
            </h2>

            <p
              className="mt-2"
              style={{
                color: "var(--muted)",
              }}
            >
              {message}
            </p>
          </div>
        </div>

        <div
          className="
                    mt-8
                    flex
                    justify-center
                    gap-4
                    "
        >
          <button
            onClick={onClose}
            className="
                        rounded-2xl
                        px-5
                        py-3
                        font-medium
                        "
            style={{
              background: "var(--input)",
            }}
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={onConfirm}
            className="
                        rounded-2xl
                        px-5
                        py-3
                        font-semibold
                        flex
                        items-center
                        gap-2
                        disabled:opacity-60
                        "
            style={{
              background: "#ef4444",

              color: "#fff",
            }}
          >
            {loading ? (
              <Loader2
                size={16}
                className="
                                        animate-spin
                                        "
              />
            ) : (
              "Remove Member"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

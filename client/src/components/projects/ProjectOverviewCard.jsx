"use client";

export default function ProjectOverviewCard({ title, value, icon: Icon, color, meta }) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            {/* Top accent stripe */}
            <div
                className="h-[3px] rounded-t-2xl w-full absolute top-0 left-0 opacity-60"
                style={{ background: color }}
            />

            {/* Icon */}
            <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                    background: color + "12",
                    border: "1px solid " + color + "25",
                }}
            >
                <Icon size={20} color={color} />
            </div>

            {/* Label */}
            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] mt-3">
                {title}
            </p>

            {/* Value */}
            <h3 className="text-2xl sm:text-3xl font-black text-[var(--text)]">
                {value}
            </h3>

            {/* Optional meta */}
            {meta && (
                <p className="text-[11px] text-[var(--muted)] mt-0.5">{meta}</p>
            )}
        </div>
    );
}
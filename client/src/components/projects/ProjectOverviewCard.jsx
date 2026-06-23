"use client";

export default function ProjectOverviewCard({ title, value, icon: Icon, color, meta }) {
    return (
        <div
            className="rounded-2xl border p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            style={{
                background: "var(--card)",
                borderColor: "var(--border)",
                boxShadow: "var(--shadow)",
            }}
        >
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                        {title}
                    </p>
                    <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
                        {value}
                    </h3>
                    {meta && <p className="text-xs font-medium pt-1" style={{ color: "var(--muted)" }}>{meta}</p>}
                </div>

                <div
                    className="p-3.5 rounded-xl border flex items-center justify-center shrink-0"
                    style={{
                        background: `${color}12`,
                        borderColor: `${color}25`,
                    }}
                >
                    <Icon size={20} color={color} strokeWidth={2.5} />
                </div>
            </div>
        </div>
    );
}
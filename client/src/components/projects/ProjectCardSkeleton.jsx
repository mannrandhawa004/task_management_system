"use client";

export default function ProjectCardSkeleton() {

    return (

        <div className="space-y-6 animate-pulse">

            {/* header */}

            <div
                className="
                rounded-3xl
                border
                p-7
                "
                style={{
                    background:
                        "var(--card)",

                    borderColor:
                        "var(--border)",
                }}
            >

                <div
                    className="
                    h-10
                    w-72
                    rounded-xl
                    "
                    style={{
                        background:
                            "var(--input)"
                    }}
                />

                <div
                    className="
                    h-4
                    w-full
                    mt-5
                    rounded-xl
                    "
                    style={{
                        background:
                            "var(--input)"
                    }}
                />

                <div
                    className="
                    h-4
                    w-2/3
                    mt-3
                    rounded-xl
                    "
                    style={{
                        background:
                            "var(--input)"
                    }}
                />

            </div>

            {/* cards */}

            <div
                className="
                grid
                grid-cols-1
                md:grid-cols-3
                gap-6
                "
            >

                {[1, 2, 3].map(item => (

                    <div

                        key={item}

                        className="
                        rounded-3xl
                        border
                        p-6
                        h-[150px]
                        "
                        style={{
                            background:
                                "var(--card)",

                            borderColor:
                                "var(--border)",
                        }}
                    />

                ))}

            </div>

        </div>

    );
}
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { loginSchema } from "../validations/auth.validation";
import { useDispatch, useSelector } from "react-redux";

import { loginThunk } from "@/features/auth/thunks/authThunk";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const router = useRouter();

    const { loading } = useSelector((state) => state.auth);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        const response = await dispatch(loginThunk(data));

        if (loginThunk.fulfilled.match(response)) {
            router.push("/dashboard");
            showToast.success("Login Success", "Welcome back.");
        } else {
            showToast.error("Login Failed", response.payload || "Invalid email or password");
        }
    };

    return (
        <div className="w-full max-w-[420px]">
            {/* Card */}
            <div
                className="rounded-[28px] border p-6 sm:p-8 backdrop-blur-3xl shadow-[0_15px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_15px_60px_rgba(0,0,0,0.35)] transition-all"
                style={{
                    background: "var(--card)",
                    borderColor: "var(--border)",
                }}
            >
                {/* Header */}
                <div className="mb-6">
                    <span
                        className="mb-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                        style={{
                            background: "var(--primary-soft)",
                            color: "var(--primary)",
                        }}
                    >
                        Workspace Access
                    </span>

                    <h1
                        className="text-2xl sm:text-3xl font-bold tracking-tight"
                        style={{ color: "var(--text)" }}
                    >
                        Welcome back
                    </h1>

                    <p
                        className="mt-1.5 text-xs sm:text-sm"
                        style={{ color: "var(--muted)" }}
                    >
                        Sign in to manage projects, teams and tasks.
                    </p>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    {/* EMAIL */}
                    <div>
                        <label
                            className="mb-1.5 block text-xs font-semibold"
                            style={{ color: "var(--text)" }}
                        >
                            Email
                        </label>

                        <input
                            type="email"
                            placeholder="john@example.com"
                            {...register("email")}
                            className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]"
                            style={{
                                background: "var(--input)",
                                borderColor: "var(--border)",
                                color: "var(--text)",
                            }}
                        />

                        {errors.email && (
                            <p className="mt-1 text-xs text-rose-500">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* PASSWORD */}
                    <div>
                        <label
                            className="mb-1.5 block text-xs font-semibold"
                            style={{ color: "var(--text)" }}
                        >
                            Password
                        </label>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...register("password")}
                                className="w-full rounded-xl border px-4 py-3 pr-12 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]"
                                style={{
                                    background: "var(--input)",
                                    borderColor: "var(--border)",
                                    color: "var(--text)",
                                }}
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff size={16} />
                                ) : (
                                    <Eye size={16} />
                                )}
                            </button>
                        </div>

                        {errors.password && (
                            <p className="mt-1 text-xs text-rose-500">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* REMEMBER ME & FORGOT PASSWORD */}
                    <div className="flex items-center justify-between text-xs pt-1">
                        <label
                            className="flex items-center gap-2 cursor-pointer select-none font-medium"
                            style={{ color: "var(--muted)" }}
                        >
                            <input
                                type="checkbox"
                                defaultChecked
                                className="h-3.5 w-3.5 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]/30 cursor-pointer accent-[var(--primary)]"
                            />
                            Remember me
                        </label>

                        <button
                            type="button"
                            className="font-semibold hover:underline transition-all"
                            style={{ color: "var(--primary)" }}
                        >
                            Forgot password?
                        </button>
                    </div>

                    {/* SUBMIT */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:opacity-95 active:scale-[0.99] disabled:opacity-70 shadow-md cursor-pointer"
                        style={{
                            background: "var(--primary)",
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
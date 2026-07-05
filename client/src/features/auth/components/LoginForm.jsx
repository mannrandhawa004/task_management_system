"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Mail, KeyRound, ArrowRight, Sparkles, ShieldCheck, ArrowLeft } from "lucide-react";

import { loginSchema } from "../validations/auth.validation";
import { useDispatch, useSelector } from "react-redux";

import { loginThunk, verify2FALoginThunk } from "@/features/auth/thunks/authThunk";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState("login"); // "login" | "2fa"
    const [tempToken, setTempToken] = useState(null);
    const [otp, setOtp] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);

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
            if (response.payload?.requires2FA) {
                setTempToken(response.payload.tempToken);
                setStep("2fa");
                showToast.success("2FA Required", "Please enter the code from Microsoft Authenticator");
                return;
            }
            router.push("/dashboard");
            showToast.success("Login Success", "Welcome back.");
        } else {
            showToast.error("Login Failed", response.payload || "Invalid email or password");
        }
    };

    const handle2FASubmit = async (e) => {
        e.preventDefault();
        if (!otp || otp.length < 6) {
            showToast.error("Invalid Code", "Please enter a valid 6-digit code");
            return;
        }

        try {
            setOtpLoading(true);
            const response = await dispatch(verify2FALoginThunk({ tempToken, otp }));

            if (verify2FALoginThunk.fulfilled.match(response)) {
                router.push("/dashboard");
                showToast.success("Login Success", "Identity verified. Welcome back!");
            } else {
                showToast.error("Verification Failed", response.payload || "Invalid verification code");
            }
        } finally {
            setOtpLoading(false);
        }
    };

    if (step === "2fa") {
        return (
            <div className="w-full max-w-[420px] animate-in fade-in zoom-in-95 duration-500">
                <div
                    className="relative overflow-hidden rounded-[28px] border p-6 sm:p-8 backdrop-blur-3xl shadow-[0_15px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_15px_60px_rgba(0,0,0,0.35)] transition-all"
                    style={{
                        background: "var(--card)",
                        borderColor: "var(--border)",
                    }}
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-75" />

                    <div className="mb-6">
                        <span
                            className="mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                            style={{
                                background: "var(--primary-soft)",
                                color: "var(--primary)",
                            }}
                        >
                            <ShieldCheck size={14} />
                            Security Verification
                        </span>

                        <h1
                            className="text-2xl sm:text-3xl font-extrabold tracking-tight"
                            style={{ color: "var(--text)" }}
                        >
                            Two-Factor Auth
                        </h1>

                        <p
                            className="mt-1.5 text-xs sm:text-sm font-medium leading-relaxed"
                            style={{ color: "var(--muted)" }}
                        >
                            Enter the 6-digit code from Microsoft Authenticator to confirm your identity.
                        </p>
                    </div>

                    <form onSubmit={handle2FASubmit} className="space-y-5">
                        <div>
                            <label
                                className="mb-2 block text-xs font-semibold text-center uppercase tracking-wider"
                                style={{ color: "var(--muted)" }}
                            >
                                6-Digit Verification Code
                            </label>

                            <input
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                placeholder="000000"
                                autoFocus
                                className="w-full rounded-2xl border py-3.5 text-center text-2xl font-black tracking-[0.35em] outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] shadow-inner"
                                style={{
                                    background: "var(--input)",
                                    borderColor: "var(--border)",
                                    color: "var(--text)",
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={otpLoading || otp.length < 6}
                            className="group flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all duration-300 hover:scale-[1.01] hover:opacity-95 active:scale-[0.99] disabled:opacity-50 shadow-md cursor-pointer"
                            style={{
                                background: "var(--primary)",
                                boxShadow: "0 8px 20px -4px var(--primary)/30",
                            }}
                        >
                            {otpLoading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Verifying Code...
                                </>
                            ) : (
                                <>
                                    <span>Verify & Sign In</span>
                                    <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setStep("login");
                                setOtp("");
                                setTempToken(null);
                            }}
                            className="flex w-full items-center justify-center gap-1.5 text-xs font-semibold hover:underline pt-2 transition-all cursor-pointer"
                            style={{ color: "var(--muted)" }}
                        >
                            <ArrowLeft size={14} />
                            Back to Sign In
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-right-3 duration-700">
            {/* Card */}
            <div
                className="relative overflow-hidden rounded-[28px] border p-6 sm:p-8 backdrop-blur-3xl shadow-[0_15px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_15px_60px_rgba(0,0,0,0.35)] transition-all"
                style={{
                    background: "var(--card)",
                    borderColor: "var(--border)",
                }}
            >
                {/* Subtle Top Ambient Light Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-75" />

                {/* Header */}
                <div className="mb-6">
                    <span
                        className="mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                        style={{
                            background: "var(--primary-soft)",
                            color: "var(--primary)",
                        }}
                    >
                        <Sparkles size={13} className="animate-spin" style={{ animationDuration: "10s" }} />
                        Workspace Access
                    </span>

                    <h1
                        className="text-2xl sm:text-3xl font-extrabold tracking-tight"
                        style={{ color: "var(--text)" }}
                    >
                        Welcome back
                    </h1>

                    <p
                        className="mt-1.5 text-xs sm:text-sm font-medium"
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

                        <div className="relative group/input">
                            <Mail
                                size={16}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within/input:text-[var(--primary)] transition-colors duration-200 pointer-events-none"
                            />
                            <input
                                type="email"
                                placeholder="john@example.com"
                                {...register("email")}
                                className="w-full rounded-xl border pl-10 pr-4 py-3 text-sm font-medium outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]"
                                style={{
                                    background: "var(--input)",
                                    borderColor: "var(--border)",
                                    color: "var(--text)",
                                }}
                            />
                        </div>

                        {errors.email && (
                            <p className="mt-1 text-xs text-rose-500 font-medium">
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

                        <div className="relative group/input">
                            <KeyRound
                                size={16}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within/input:text-[var(--primary)] transition-colors duration-200 pointer-events-none"
                            />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...register("password")}
                                className="w-full rounded-xl border pl-10 pr-11 py-3 text-sm font-medium outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]"
                                style={{
                                    background: "var(--input)",
                                    borderColor: "var(--border)",
                                    color: "var(--text)",
                                }}
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <EyeOff size={16} />
                                ) : (
                                    <Eye size={16} />
                                )}
                            </button>
                        </div>

                        {errors.password && (
                            <p className="mt-1 text-xs text-rose-500 font-medium">
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
                        className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all duration-300 hover:scale-[1.01] hover:opacity-95 active:scale-[0.99] disabled:opacity-70 shadow-md cursor-pointer"
                        style={{
                            background: "var(--primary)",
                            boxShadow: "0 8px 20px -4px var(--primary)/30",
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
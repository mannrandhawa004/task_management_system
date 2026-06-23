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
import toast from "react-hot-toast";

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const router = useRouter();

    const { loading, error } =
        useSelector((state) => state.auth);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {

        const response =
            await dispatch(
                loginThunk(data)
            );

        if (
            loginThunk.fulfilled.match(
                response
            )
        ) {
            router.push(
                "/dashboard"
            );

            showToast.success(
                "Login Success",
                "Welcome back."
            );

        } else {

            showToast.error(
                "Login Failed",
                response.payload ||
                "Something went wrong"
            );

        }

    };

    return (
        <div className="w-full max-w-[460px]">

            {/* card */}
            <div
                className="rounded-[32px] border p-10 backdrop-blur-3xl shadow-[0_20px_80px_rgba(0,0,0,0.12)]"
                style={{
                    background: "var(--card)",
                    borderColor: "var(--border)",
                }}
            >

                {/* header */}
                <div className="mb-10">
                    <span
                        className="mb-4 inline-flex rounded-full py-1 text-sm font-medium"
                        style={{
                            background: "var(--primary-soft)",
                            color: "var(--primary)",
                        }}
                    >
                        Workspace Access
                    </span>

                    <h1
                        className="text-4xl font-semibold tracking-tight"
                        style={{ color: "var(--text)" }}
                    >
                        Welcome back
                    </h1>

                    <p
                        className="mt-3 text-sm leading-6"
                        style={{ color: "var(--muted)" }}
                    >
                        Sign in to manage projects, teams and tasks.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                >

                    {/* EMAIL */}

                    <div>
                        <label
                            className="mb-2 block text-sm font-medium"
                            style={{ color: "var(--text)" }}
                        >
                            Email
                        </label>

                        <input
                            type="email"
                            placeholder="john@example.com"
                            {...register("email")}
                            className="w-full rounded-2xl border px-5 py-4 text-sm outline-none transition-all duration-200"
                            style={{
                                background: "var(--input)",
                                borderColor: "var(--border)",
                                color: "var(--text)",
                            }}
                        />

                        {errors.email && (
                            <p className="mt-2 text-sm text-red-500">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* PASSWORD */}

                    <div>
                        <label
                            className="mb-2 block text-sm font-medium"
                            style={{ color: "var(--text)" }}
                        >
                            Password
                        </label>

                        <div className="relative">

                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...register("password")}
                                className="w-full rounded-2xl border px-5 py-4 pr-14 text-sm outline-none transition-all duration-200"
                                style={{
                                    background: "var(--input)",
                                    borderColor: "var(--border)",
                                    color: "var(--text)",
                                }}
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2"
                                style={{ color: "var(--muted)" }}
                            >
                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>

                        </div>

                        {errors.password && (
                            <p className="mt-2 text-sm text-red-500">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* remember */}

                    <div className="flex items-center justify-between text-sm">

                        <label
                            className="flex items-center gap-2"
                            style={{ color: "var(--muted)" }}
                        >
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded"
                            />
                            Remember me
                        </label>

                        <button
                            type="button"
                            className="font-medium hover:opacity-80"
                            style={{ color: "var(--primary)" }}
                        >
                            Forgot password?
                        </button>

                    </div>

                    {/* submit */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.01] disabled:opacity-70"
                        style={{
                            background: "var(--primary)",
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2
                                    size={18}
                                    className="animate-spin"
                                />
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

// {
// error && (
//    <p className="text-red-500">
//       {error}
//    </p>
// )
// }
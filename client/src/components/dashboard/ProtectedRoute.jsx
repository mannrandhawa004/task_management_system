"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import AppLoader from "@/components/common/AppLoader";

export default function ProtectedRoute({
    children,
}) {

    const router = useRouter();
    const pathname = usePathname();

    const {
        user,
        initialized
    } = useSelector(
        state => state.auth
    );


    useEffect(() => {
        if (initialized && user && pathname?.startsWith("/dashboard")) {
            sessionStorage.setItem("last_valid_dashboard_path", pathname);
        }

    }, [
        initialized,
        user,
        pathname,
    ]);

    useEffect(() => {

        if (
            initialized &&
            !user
        ) {
            router.replace("/");
        }

    }, [
        initialized,
        user,
        router,
    ]);

    if (!initialized) {
        return <AppLoader fullScreen message="Preparing your workspace..." />;
    }

    if (!user) {
        return <AppLoader fullScreen message="Redirecting to sign in..." />;
    }

    return children;
}

"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";
import ProtectedRoute from "@/components/dashboard/ProtectedRoute";
import { removeTask } from "@/features/tasks/slice/taskSlice";
import { getSocket } from "@/lib/socket";

export default function DashboardLayout({
    children,
}) {
    const dispatch = useDispatch();

    useEffect(() => {
        const socket = getSocket();

        const handleTaskDeleted = ({ taskId } = {}) => {
            dispatch(removeTask(taskId));
        };

        socket.on("task_deleted", handleTaskDeleted);

        return () => {
            socket.off("task_deleted", handleTaskDeleted);
        };
    }, [dispatch]);

    return (

        <ProtectedRoute>

            <div
                className="
                flex
                min-h-screen
                "
                style={{
                    background: "var(--bg)"
                }}
            >

                <Sidebar />

                <div className="flex flex-1 flex-col">

                    <Navbar />

                    <main
                        className="flex-1 p-6"
                    >
                        {children}
                    </main>

                </div>

            </div>

        </ProtectedRoute>
    );
}

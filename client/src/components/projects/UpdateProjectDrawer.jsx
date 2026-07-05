"use client";

import { useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { getDepartmentsThunk } from "@/features/departments/thunks/departmentThunks";

import {
    updateProjectThunk
} from "@/features/projects/thunks/projectThunk";

import { showToast }
    from "@/lib/toast";

export default function UpdateProjectDrawer({
    open,
    onClose,
    project,
}) {

    const dispatch =
        useDispatch();

    const { departmentsList } = useSelector((state) => state.departments);

    useEffect(() => {
        if (open && (!departmentsList || departmentsList.length === 0)) {
            dispatch(getDepartmentsThunk({ page: 1, limit: 100 }));
        }
    }, [open, dispatch, departmentsList]);

    const {
        register,
        handleSubmit,
        reset,
        formState: {
            isSubmitting
        }
    } = useForm({

        defaultValues: {
            name: "",
            description: "",
            status: "active",
            department_id: "",
        },

    });

    useEffect(() => {
        if (project) {
            reset({

                name:
                    project.name || "",

                description:
                    project.description || "",

                status:
                    project.status || "active",

                department_id:
                    project.department_id || project.department?.id || "",

            });

        }

    }, [project, reset]);

    if (!open)
        return null;

    const onSubmit =
        async (data) => {

            try {
                const payload = {
                    ...data,
                    department_id: data.department_id !== "" && data.department_id !== undefined ? Number(data.department_id) : (data.department_id === "" ? "" : undefined),
                };

                await dispatch(
                    updateProjectThunk({

                        id:
                            project.id,

                        data: payload,

                    })
                ).unwrap();

                showToast.success(
                    "Project updated successfully"
                );

                onClose();

            } catch (err) {

                showToast.error(
                    err ||
                    "Update failed"
                );

            }
        };

    return (

        <div className="fixed inset-0 z-50">

            {/* Overlay */}

            <div
                onClick={onClose}
                className="
          absolute
          inset-0
          bg-black/50
          backdrop-blur-sm
        "
            />

            {/* Drawer */}

            <div
                className="
          absolute
          top-0
          right-0
          h-full
          w-full
          sm:w-[520px]
          border-l
          p-6
          overflow-y-auto
        "
                style={{
                    background:
                        "var(--card)",

                    borderColor:
                        "var(--border)",
                }}
            >

                {/* Header */}

                <div
                    className="
            flex
            justify-between
            items-center
            mb-8
          "
                >

                    <div>

                        <h2
                            className="
                text-2xl
                font-bold
              "
                        >
                            Update Project
                        </h2>

                        <p
                            style={{
                                color:
                                    "var(--muted)"
                            }}
                        >
                            Edit project details
                        </p>

                    </div>

                    <button
                        onClick={onClose}
                    >
                        <X />
                    </button>

                </div>

                {/* FORM */}

                <form
                    onSubmit={
                        handleSubmit(
                            onSubmit
                        )
                    }
                    className="
            space-y-6
          "
                >

                    {/* NAME */}

                    <div>

                        <label
                            className="
                block
                mb-2
                font-medium
              "
                        >
                            Project Name
                        </label>

                        <input
                            {...register(
                                "name"
                            )}
                            className="
                w-full
                rounded-xl
                border
                px-4
                py-3
                outline-none
              "
                            style={{
                                background:
                                    "var(--input)",

                                borderColor:
                                    "var(--border)",
                            }}
                        />

                    </div>

                    {/* DESCRIPTION */}

                    <div>

                        <label
                            className="
                block
                mb-2
                font-medium
              "
                        >
                            Description
                        </label>

                        <textarea
                            rows={5}

                            {...register(
                                "description"
                            )}

                            className="
                w-full
                rounded-xl
                border
                px-4
                py-3
                outline-none
              "

                            style={{
                                background:
                                    "var(--input)",

                                borderColor:
                                    "var(--border)",
                            }}
                        />

                    </div>

                    {/* STATUS */}

                    <div>

                        <label
                            className="
                block
                mb-2
                font-medium
              "
                        >
                            Status
                        </label>

                        <select

                            {...register(
                                "status"
                            )}

                            className="
                w-full
                rounded-xl
                border
                px-4
                py-3
              "

                            style={{
                                background:
                                    "var(--input)",

                                borderColor:
                                    "var(--border)",
                            }}
                        >

                            <option value="active">
                                Active
                            </option>

                            <option value="inactive">
                                Inactive
                            </option>

                            <option value="completed">
                                Completed
                            </option>

                        </select>

                    </div>

                    {/* DEPARTMENT */}

                    <div>

                        <label
                            className="
                block
                mb-2
                font-medium
              "
                        >
                            Department
                        </label>

                        <select

                            {...register(
                                "department_id"
                            )}

                            className="
                w-full
                rounded-xl
                border
                px-4
                py-3
              "

                            style={{
                                background:
                                    "var(--input)",

                                borderColor:
                                    "var(--border)",
                            }}
                        >

                            <option value="">
                                Select Department (Optional)
                            </option>

                            {(departmentsList || []).map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </option>
                            ))}

                        </select>

                    </div>

                    {/* ACTIONS */}

                    <div
                        className="
              flex
              gap-4
              pt-6
            "
                    >

                        <button
                            type="button"
                            onClick={onClose}
                            className="
                flex-1
                rounded-xl
                py-3
                font-medium
              "
                            style={{
                                background:
                                    "var(--input)"
                            }}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"

                            disabled={
                                isSubmitting
                            }

                            className="
                flex-1
                rounded-xl
                py-3
                font-semibold
                text-white
                flex
                items-center
                justify-center
                gap-2
              "
                            style={{
                                background:
                                    "var(--primary)"
                            }}
                        >

                            {isSubmitting
                                ? (
                                    <>
                                        <Loader2
                                            size={18}
                                            className="
                        animate-spin
                      "
                                        />
                                        Updating...
                                    </>
                                )
                                : (
                                    "Update Project"
                                )}

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}
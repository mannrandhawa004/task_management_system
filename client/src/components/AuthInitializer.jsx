"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
    useDispatch,
    useSelector,
} from "react-redux";

import {
    profileThunk
} from "@/features/auth/thunks/authThunk";
import NotificationToastListener from "./common/NotificationToastListener";

export default function AuthInitializer(){

    const dispatch = useDispatch();
    const pathname = usePathname();

    const {
        initialized,
    } = useSelector(
        state=>state.auth
    );

    useEffect(()=>{

        if (!initialized && pathname !== "/auth/handoff") {

            dispatch(
                profileThunk()
            );

        }

    },[
        initialized,
        dispatch,
        pathname,
    ]);

    return <NotificationToastListener />;
}

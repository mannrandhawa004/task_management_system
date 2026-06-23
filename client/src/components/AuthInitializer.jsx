"use client";

import { useEffect } from "react";
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

    const {
        initialized,
    } = useSelector(
        state=>state.auth
    );

    useEffect(()=>{

        if (!initialized) {

            dispatch(
                profileThunk()
            );

        }

    },[
        initialized,
        dispatch,
    ]);

    return <NotificationToastListener />;
}

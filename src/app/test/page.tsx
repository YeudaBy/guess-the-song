"use client"

import {useEffect} from "react";
import {TextInput} from "@tremor/react";
import {useSupabase} from "@/server/supabase";


export default function () {
    const {data, sendData, setChannelName} = useSupabase()

    useEffect(() => {
        setChannelName("בדיקה")
    }, []);

    return (
        <>
            <TextInput onValueChange={sendData}/>
            {data}
        </>
    )
}

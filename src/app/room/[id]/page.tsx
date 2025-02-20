"use client"

import React, {use} from "react";
import RoomView from "@/app/room/[id]/RoomView";

export default function RoomPage({params}: { params: Promise<{ id: string }> }) {
    const {id} = use(params)
    return <RoomView id={id}/>;
}

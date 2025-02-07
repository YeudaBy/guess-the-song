"use client"

import React from "react";
import RoomView from "@/app/room/[id]/RoomView";

export default function RoomPage({params}: { params: { id: string } }) {
    return <RoomView id={params.id}/>;
}

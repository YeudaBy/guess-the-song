import React from "react";
import RoomView from "@/app/room/[id]/RoomView";

export default async function RoomPage({params}: {
    params: Promise<{ id: string }>
}) {
    const id = (await params).id

    return <RoomView id={id}/>
}

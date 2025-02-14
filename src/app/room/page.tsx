"use client"

import {repo} from "remult";
import {Room, RoomStatus} from "@/server/entities/Room";
import {CreateRoom} from "@/app/room/CreateRoom";
import {useEffect, useState} from "react";
import {User} from "@/server/entities/User";
import {Participant} from "@/server/entities/Participant";
import {Badge, Card, Color, Flex, Grid, Text, Title} from "@tremor/react";
import AuthWrapper from "@/ui/AuthReq";

const roomRepo = repo(Room)
const userRepo = repo(User)
const participantRepo = repo(Participant)

function roomStatusText(roomStatus: RoomStatus) {
    switch (roomStatus) {
        case RoomStatus.Completed:
            return "נגמר"
        case RoomStatus.Error:
            return "שגיאה"
        case RoomStatus.Initializing:
            return "מאתחל"
        case RoomStatus.InProgress:
            return "בתהליך"
        case RoomStatus.Loading:
            return "טוען"
        case RoomStatus.Lobby:
            return "ממתין למשתתפים"
    }
}

function roomStatusColor(roomStatus: RoomStatus): Color {
    switch (roomStatus) {
        case RoomStatus.Error:
            return "red"
        case RoomStatus.InProgress:
            return "yellow"
        case RoomStatus.Lobby:
            return "green"
        default:
            return "gray"
    }
}

export default function RoomPage() {
    const [user, setUser] = useState<User | null>()
    const [rooms, setRooms] = useState<Room[]>()

    useEffect(() => {
        const uid = Number(localStorage.getItem("uid"))
        if (Number.isNaN(uid)) {
            userRepo.insert({name: "Guess"}).then(setUser)
        } else {
            userRepo.findId(uid).then((user) => {
                if (!user) {
                    userRepo.insert({name: "Guess"}).then(setUser)
                } else {
                    userRepo.findId(uid).then(setUser)
                }
            })
        }
    }, [])

    useEffect(() => {
        if (!user) return
        localStorage.setItem("uid", user.id.toString())
        participantRepo.find({
            where: {
                user: user
            },
            include: {
                room: true
            }
        }).then(r => {
            setRooms(r.map(p => p.room).filter(r => !!r))
        })
    }, [user]);

    return <AuthWrapper>
        <div className={"m-4"}>
            <CreateRoom/>


            <Grid className={'mt-8'}>
                <Title>
                    חדרים שיצרת:
                </Title>
                {
                    rooms?.map(room => <Card
                        decoration={"right"}
                        decorationColor={roomStatusColor(room.status)}
                        className={"text-start"}>
                        <Flex justifyContent={"between"}>
                            <Title>#{room.id}</Title>

                            <Badge color={roomStatusColor(room.status)}>
                                ({roomStatusText(room.status)})
                            </Badge>
                        </Flex>

                        {!!room.participants && <Text>
                            {room.participants.length} משתתפים
                        </Text>}
                        <Text>{room.createdAt.toLocaleDateString()}</Text>
                    </Card>)
                }
            </Grid>
        </div>
    </AuthWrapper>
}

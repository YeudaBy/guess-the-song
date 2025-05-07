"use client"

import React, {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {repo} from 'remult';
import {Room, RoomStatus} from '@/server/entities/Room';
import {GameManager} from "@/app/room/[id]/GameView";
import {Button, Callout, Card, Flex, Text, TextInput, Title} from "@tremor/react";
import {RiFireFill} from "@remixicon/react";
import {Participant} from "@/server/entities/Participant";
import {VolumeSpinner} from "@/ui/components";
import {useSession} from "next-auth/react";
import {User} from "@/server/entities/User";
import {useAutoAnimate} from "@formkit/auto-animate/react";
import Image from "next/image";
import {useSupabase} from "@/server/supabase";

const roomRepo = repo(Room);
const participantRepo = repo(Participant)
const userRepo = repo(User)


export default function RoomView({id}: { id: string }) {
    const {data} = useSession();
    const [isHost, setIsHost] = useState(false)

    const [room, setRoom] = useState<Room>();
    const [allowed, setAllowed] = useState<boolean>(true)

    useEffect(() => {
        setIsHost((data?.user?.email) === room?.host.user?.email)
    }, [data?.user?.email, room?.host]);
    useEffect(() => {
        setAllowed(isHost)
    }, [isHost]);

    const {data: gameState, sendData, setChannelName, channel} = useSupabase<RoomStatus>()

    const [error, setError] = useState<string>()
    const [currentParticipant, setCurrentParticipant] = useState<Participant>()

    const updateRoomStatus = async (status: RoomStatus) => {
        await sendData(status)
        if (!!room) await roomRepo.update(room!.id, {status});
    }

    useEffect(() => {
        // Load room
        (async () => {
            const _room = await roomRepo.findFirst({id: Number(id)}, {
                include: {
                    tracks: {include: {track: true}},
                    participants: {include: {user: true}},
                    host: {include: {user: true}}
                }
            })
            if (!_room) {
                setError("לא הצלחנו לטעון את החדר :(")
                await updateRoomStatus(RoomStatus.Error)
                return
            }
            setChannelName(`room~${_room.id}`)
            setRoom(_room)

            if (_room.password && _room.password !== "") { // change logic to include requests
                setAllowed(false)
            }
        })()
    }, [id]);

    useEffect(() => {
        if (!room || !channel) return
        sendData(room.status)
        if (room.status === RoomStatus.Initializing) {
            updateRoomStatus(RoomStatus.Lobby)
        }
    }, [channel, room]);

    useEffect(() => {
        if (!room) return
        window.addEventListener("beforeunload", (event) => {
            // roomRepo.relations(room).participants.delete(currentParticipant?.id || "")
            event.preventDefault()
        });
    }, []);

    const startGame = async () => {
        if (!room) return;
        console.log("start game")
        await updateRoomStatus(RoomStatus.InProgress)
        navigator.vibrate([100, 50, 100])
    };

    const renderContent = () => {
        if (!room) {
            return <Callout title={"טוען חדר..."}/>; // TODO
        }
        switch (gameState) {
            case RoomStatus.Loading:
                return <Callout title={"טוען חדר..."}/>; // TODO
            case RoomStatus.Error:
                return <Callout title={error || "unknown error"} color={"red"}/>
            case RoomStatus.Lobby:
                if (!allowed) return (
                    <JoinRequest
                        validate={p => p === room?.password}
                        onAccept={() => setAllowed(true)}
                    />
                )
                return (
                    <WaitingLobby
                        setCurrentParticipant={setCurrentParticipant}
                        onStartGame={startGame}
                        room={room}
                        isHost={isHost}
                    />
                );
            case RoomStatus.InProgress:
                if (!currentParticipant) {
                    return
                }
                return (
                    <GameManager
                        room={room}
                        currentPlayer={currentParticipant!}
                    />
                );
            case RoomStatus.Completed:
                return (
                    <ResultsView
                        participants={room.participants || []}
                    />
                );
            case RoomStatus.Initializing:
                return (<Card>
                    <Title>הנתונים נטענים...</Title>
                </Card>)
        }
    };

    return (
        <div className={"m-3 flex flex-col gap-4 items-center"}>
            {!!room && <RoomHeader
                roomCode={room.id.toString()}
                participants={room.participants || []}
            />}
            {renderContent()}

            <Text
                className={"bg-tremor-background-emphasis text-white text-sm absolute bottom-0"}>{gameState || "test"}</Text>
        </div>
    );
}

function WaitingLobby({
                          setCurrentParticipant,
                          room,
                          onStartGame,
                          isHost
                      }: {
    setCurrentParticipant: Dispatch<SetStateAction<Participant | undefined>>
    room: Room,
    onStartGame: () => void,
    isHost: boolean
}) {
    const [nickname, setNickname] = useState<string>();
    const {data} = useSession()
    const [participants, setParticipants] = useState<Participant[]>()
    const [joined, setJoined] = useState(false)

    const [listRef] = useAutoAnimate()

    useEffect(() => {
        // subscribe to participants
        const unsubscribe = participantRepo
            .liveQuery({where: {roomId: Number(room.id)}, include: {user: true}})
            .subscribe(info => {
                console.log(info.items)
                setParticipants(info.applyChanges)
            })

        return () => {
            unsubscribe()
        };
    }, [room.id]);

    useEffect(() => {
        if (!data?.user) return
        const ps = participants?.filter(p => p.user?.email === data.user?.email)[0]
        !!ps && setCurrentParticipant(ps)
        setJoined(!!ps)
    }, [data, participants]);

    const joinRoom = async () => {
        const guest = await userRepo.insert({name: nickname, isGuest: true})
        const newParticipant = await roomRepo.relations(room).participants.insert({user: guest})
        setCurrentParticipant(newParticipant)
        setJoined(true)
    };

    useEffect(() => {
        !!data?.user?.name && setNickname(data.user.name)
    }, []);

    return (
        <Card className={"max-w-md w-screen m-auto"}>
            <Flex className={"justify-center items-center flex-col"}>
                <VolumeSpinner/>
                <Title className={"text-xl mb-4 text-center"}>
                    חדר המתנה
                </Title>
            </Flex>

            {!joined && <Flex className={"gap-2"}>
                <TextInput
                    value={nickname}
                    onValueChange={setNickname}
                    placeholder="הכנס כינוי"
                />
                <Button
                    onClick={joinRoom}
                    disabled={!nickname}>
                    הצטרף
                </Button>
            </Flex>}

            <div ref={listRef} className="grid" style={{gridTemplateColumns: "auto auto auto"}}>
                {participants?.map(p => (
                    <div key={p.id} className="flex gap-2 items-center">
                        <Image src={p.user?.image || "/images/person.png"} alt="pfp"
                               className="rounded-full" width={40} height={40}/>
                        <Text className="text-black text-md">{p.user?.name}</Text>
                    </div>
                ))}
            </div>


            {isHost && <Button
                // @ts-ignore todo
                icon={RiFireFill}
                className={"w-full gap-2 mt-4"}
                onClick={onStartGame}
                // disabled={participants.length < 2}
            >
                התחל משחק
            </Button>}

            <Button onClick={() => {
                navigator.share({url: location.href})
            }}
                    variant={"secondary"} size={"sm"} className={"mt-2"}>
                שתף קישור הצטרפות
            </Button>
        </Card>
    );
}


function ResultsView({
                         participants
                     }: {
    participants: Participant[]
}) {
    return (
        <div>
            <h2>תוצאות המשחק</h2>
            {/*// @ts-ignore*/}
            {participants.sort((a, b) => b.score - a.score).map(p => (
                // @ts-ignore todo
                <div key={p.id}>{p.nickname}: {p.score} נקודות
                </div>
            ))}
        </div>
    );
}

function JoinRequest({onAccept, validate}: {
    onAccept: () => void,
    validate: (password: string) => boolean
}) {
    const [password, setPassword] = useState("")
    const [error, setError] = useState(false)
    return <Card>
        <Title className={"text-xl mb-4 text-center"}>
            הזן ססמא
        </Title>
        <Text>
            חדר זה הינו פרטי. הזינו את הססמא שקיבלתם מיוצר החדר:
        </Text>
        <form onSubmit={e => {
            e.preventDefault()
            if (validate(password)) {
                console.log("Validated")
                onAccept()
            } else setError(true)
        }}>
            <TextInput error={error} errorMessage={"ססמא שגויה!"} value={password} onValueChange={setPassword}
                       placeholder={"ססמא"}/>
            <Button type={"submit"}>כנס</Button>
        </form>
    </Card>
}

function RoomHeader({
                        roomCode,
                        participants
                    }: {
    roomCode: string,
    participants: Participant[]
}) {
    return (
        <div className={"m-2 text-right"}>
            <Text className={"text-3xl font-semibold"}>חדר משחק #{roomCode}</Text>
            <div className={"w-1/4 h-1 bg-gray-400 ml-auto mb-2"}/>
            <Text>
                משתתפים: {participants.length}
            </Text>

        </div>
    );
}

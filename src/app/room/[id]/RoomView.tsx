"use client"

import React, {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {repo} from 'remult';
import {Room, RoomStatus} from '@/server/entities/Room';
import {Track} from '@/server/entities/Track';
import {GameManager} from "@/app/room/[id]/GameView";
import {Button, Callout, Flex, Text, TextInput, Title} from "@tremor/react";
import {RiFireFill} from "@remixicon/react";
import {Participant} from "@/server/entities/Participant";
import {Pair} from "yaml";
import {Card, VolumeSpinner} from "@/ui/components";
import {useSession} from "next-auth/react";
import {User} from "@/server/entities/User";
import {useAutoAnimate} from "@formkit/auto-animate/react";
import Image from "next/image";

const roomRepo = repo(Room);
const participantRepo = repo(Participant)
const userRepo = repo(User)

export default function RoomView({id}: { id: string }) {
    const [room, setRoom] = useState<Room>();
    const [gameState, setGameState] = useState<RoomStatus>(RoomStatus.Initializing);
    const [error, setError] = useState<string>()

    const [currentTrack, setCurrentTrack] = useState<Track>();

    const [currentParticipant, setCurrentParticipant] = useState<Participant>()
    const [scores, setScores] = useState<Pair<string, number>[]>([])


    const updateRoomStatus = async (status: RoomStatus) => {
        setGameState(status)
        console.log(status)
        if (room) {
            await roomRepo.update(room.id, {status});
        }
    }

    useEffect(() => {
        // Load room
        (async () => {
            const _room = await roomRepo.findFirst({id: Number(id)}, {
                include: {
                    tracks: {include: {track: true}},
                    participants: {include: {user: true}}
                }
            })
            if (!_room) {
                setError("לא הצלחנו לטעון את החדר :(")
                await updateRoomStatus(RoomStatus.Error)
                return
            }
            setRoom(_room)
            await updateRoomStatus(_room!.status === RoomStatus.Initializing ? RoomStatus.Lobby : _room!.status)
        })()
    }, [id]);

    useEffect(() => {
        if (!room) return
        window.addEventListener("beforeunload", (event) => {
            // roomRepo.relations(room).participants.delete(currentParticipant?.id || "")
            event.preventDefault()
        });
    }, []);

    const startGame = async () => {
        if (!room) return;
        await updateRoomStatus(RoomStatus.InProgress)
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
                return (
                    <WaitingLobby
                        setCurrentParticipant={setCurrentParticipant}
                        onStartGame={startGame}
                        room={room}
                    />
                );
            case RoomStatus.InProgress:
                return (
                    <GameManager
                        tracks={room.tracks || []}
                        duration={room?.songDuration || 5}
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
        </div>
    );
}

function WaitingLobby({
                          setCurrentParticipant,
                          room,
                          onStartGame
                      }: {
    setCurrentParticipant: Dispatch<SetStateAction<Participant | undefined>>
    room: Room,
    onStartGame: () => void
}) {
    const [nickname, setNickname] = useState<string>();
    const {data} = useSession()
    const [participants, setParticipants] = useState<Participant[]>()

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

    const joinRoom = async () => {
        const guest = await userRepo.insert({name: nickname, isGuest: true})
        const newParticipant = await roomRepo.relations(room).participants.insert({user: guest})
        setCurrentParticipant(newParticipant)

    };

    useEffect(() => {
        !!data?.user?.name && setNickname(data.user.name)
    }, []);

    const alreadyJoined = () => {
        if (!data?.user) return
        const ps = participants?.filter(p => p.user?.email === data.user?.email)
        console.log(ps)
        return Boolean(ps?.length)
    }

    return (
        <Card className={"max-w-md w-screen m-auto"}>
            <Flex className={"justify-center items-center flex-col"}>
                <VolumeSpinner/>
                <Title className={"text-xl mb-4 text-center"}>
                    חדר המתנה
                </Title>
            </Flex>

            {!alreadyJoined() && <Flex className={"gap-2"}>
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


            <Button
                // @ts-ignore todo
                icon={RiFireFill}
                className={"w-full gap-2 mt-4"}
                onClick={onStartGame}
                // disabled={participants.length < 2}
            >
                התחל משחק
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

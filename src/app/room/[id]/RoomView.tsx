"use client"

import React, {useEffect, useState} from 'react';
import {repo} from 'remult';
import {Room, RoomStatus} from '@/server/entities/Room';
import {Track} from '@/server/entities/Track';
import {GameManager} from "@/app/room/[id]/GameView";
import {Button, Callout, Card, Divider, Flex, Text, TextInput, Title} from "@tremor/react";
import {RiFireFill} from "@remixicon/react";
import {Participant} from "@/server/entities/Participant";
import {Pair} from "yaml";


export default function RoomView({id}: { id: string }) {
    const [room, setRoom] = useState<Room>();
    const [gameState, setGameState] = useState<RoomStatus>(RoomStatus.Initializing);
    const [error, setError] = useState<string>()

    const [currentTrack, setCurrentTrack] = useState<Track>();

    const [participants, setParticipants] = useState<Participant[]>([]);
    const [currentParticipant, setCurrentParticipant] = useState<Participant>()
    const [scores, setScores] = useState<Pair<string, number>[]>([])

    const roomRepo = repo(Room);
    const participantRepo = repo(Participant)

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
                    participants: true
                }
            })
            if (!_room) {
                setError("לא הצלחנו לטעון את החדר :(") // todo
                await updateRoomStatus(RoomStatus.Error)
                return
            }
            setRoom(_room)
            await updateRoomStatus(_room!.status === RoomStatus.Initializing ? RoomStatus.Lobby : _room!.status)
        })()
    }, [id]);

    useEffect(() => {
        console.log({gameState}) // todo remove when works
    }, [gameState]);

    console.log(room)

    useEffect(() => {
        // subscribe to participants
        const unsubscribe = participantRepo
            .liveQuery({where: {roomId: Number(id)}})
            .subscribe(info => setParticipants(info.applyChanges))

        return () => {
            unsubscribe()
        };
    }, [id]);

    useEffect(() => {
        // logout when exit page
        window.addEventListener("beforeunload", (event) => {
            participantRepo.delete(currentParticipant?.id || "")
        });
    }, []);

    const startGame = async () => {
        if (!room) return;

        await updateRoomStatus(RoomStatus.Loading)

        await updateRoomStatus(RoomStatus.InProgress)
    };

    const joinRoom = async (nickname: string) => {
        // TODO
        if (room) {
            const newParticipant = await participantRepo.insert({
                nickname,
                roomId: Number(id)
            })
            setCurrentParticipant(newParticipant)
        }
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
                        participants={participants}
                        onJoin={joinRoom}
                        onStartGame={startGame}
                        canJoin={!currentParticipant}
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
                        participants={participants}
                    />
                );
            case RoomStatus.Initializing:
                return (<Card>
                    <Title>הנתונים נטענים...</Title>
                </Card>)
        }
    };

    return (
        <div>
            {!!room && <RoomHeader
                roomCode={room.id.toString()}
                participants={participants}
            />}
            {renderContent()}
        </div>
    );
}

function WaitingLobby({
                          participants,
                          onJoin,
                          canJoin,
                          onStartGame
                      }: {
    participants: Participant[],
    onJoin: (nickname: string) => void,
    canJoin: boolean
    onStartGame: () => void
}) {
    const [nickname, setNickname] = useState('');

    return (
        <Card className={"m-2 text-white bg-blue-800 w-fit m-auto"}>
            <Flex className={"gap-2"}>
                <TextInput
                    value={nickname}
                    onValueChange={setNickname}
                    placeholder="הכנס כינוי"
                />
                <Button onClick={() => onJoin(nickname)} disabled={!canJoin}>הצטרף</Button>
            </Flex>

            <Divider/>

            <div>
                <Text className={"text-lg text-white text-right"}>משתתפים:</Text>
                {participants.map(p => (
                    <div key={p.id}>{p.nickname}</div>
                ))}
            </div>

            <Button
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
                <div key={p.id}>
                    {p.nickname}: {p.score} נקודות
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

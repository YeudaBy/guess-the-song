"use client"

import React, {useEffect, useState} from 'react';
import {repo} from 'remult';
import {Room} from '@/server/Room';
import {Track} from '@/server/Track';
import {GameManager} from "@/app/room/[id]/GameView";
import {Button, Callout, Card, Divider, Flex, Text, TextInput} from "@tremor/react";
import {RiFireFill} from "@remixicon/react";
import {Participant} from "@/server/Participant";

export default function RoomView({id}: { id: string }) {
    const [room, setRoom] = useState<Room>();
    const [gameState, setGameState] = useState<'waiting' | 'in-progress' | 'completed'>('waiting');
    const [tracks, setTracks] = useState<Track[]>([]);
    const [currentTrack, setCurrentTrack] = useState<Track>();
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [currentParticipant, setCurrentParticipant] = useState<Participant>()

    const roomRepo = repo(Room);
    const trackRepo = repo(Track);
    const participantRepo = repo(Participant)

    useEffect(() => {
        async function loadRoomData() {
            const fetchedRoom = await roomRepo.findFirst({id: Number(id)});
            setRoom(fetchedRoom);
        }

        loadRoomData();
    }, [id]);

    useEffect(() => {
        const unsubscribe = participantRepo
            .liveQuery({
                where: {
                    roomId: Number(id)
                }
            })
            .subscribe(info => setParticipants(info.applyChanges))

        return () => {
            unsubscribe()
        };
    }, [id]);

    useEffect(() => {
        window.addEventListener("beforeunload", (event) => {
            participantRepo.delete(currentParticipant?.id || "")
        });
    }, []);

    const startGame = async () => {
        if (!room) return;

        const tracks = await trackRepo.find({
            limit: room.limit
        });

        await roomRepo.update(room, {
            status: 'in-progress',
        });

        setTracks(tracks)
        setGameState('in-progress');
        setCurrentTrack(tracks[0]);
    };

    const joinRoom = async (nickname: string) => {
        if (room) {
            const newParticipant = await participantRepo.insert({
                nickname,
                roomId: Number(id)
            })
            setCurrentParticipant(newParticipant)
        }
    };

    const renderContent = () => {
        switch (gameState) {
            case 'waiting':
                return (
                    <WaitingLobby
                        participants={participants}
                        onJoin={joinRoom}
                        onStartGame={startGame}
                        canJoin={!currentParticipant}
                    />
                );
            case 'in-progress':
                return (
                    <GameManager
                        tracks={tracks}
                        duration={room?.songDuration || 5}
                        currentPlayer={currentParticipant!}
                    />
                );
            case 'completed':
                return (
                    <ResultsView
                        participants={participants}
                    />
                );
        }
    };

    if (!room) return <Callout title={"טוען חדר..."}/>;

    return (
        <div>
            <RoomHeader
                roomCode={room.id.toString()}
                participants={participants}
            />
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

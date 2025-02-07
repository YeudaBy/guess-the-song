"use client"

import {repo} from "remult";
import {Room} from "@/server/entities/Room";
import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {Button, Callout, Card, Flex, NumberInput, Text, TextInput} from "@tremor/react";
import {RiCloseLine, RiEyeFill, RiFileCopy2Fill, RiNumbersFill, RiPencilFill, RiTimeFill} from "@remixicon/react";
import {Participant} from "@/server/entities/Participant";
import {Track} from "@/server/entities/Track";
import {TrackMetadata} from "@/server/sp-fetcher";

const roomRepo = repo(Room)
const participantRepo = repo(Participant)
const trackRepo = repo(Track)

export function CreateRoom() {
    const [limit, setLimit] = useState<number>(5)
    const [songDuration, setSongDuration] = useState<number>(5)
    const [password, setPassword] = useState<string>("")
    const [hostName, setHostName] = useState<string>()
    const [error, setError] = useState<string>("")
    const [loadingState, setLoadingState] = useState<string>()

    const router = useRouter()

    const create = async () => {
        // ולידציה
        if (!limit || limit < 3 || limit > 30) {
            setError("מספר שירים צריך להיות בין 3 ל-30")
            return
        }

        if (!songDuration || songDuration < 3 || songDuration > 30) {
            setError("משך שיר צריך להיות בין 3 ל-30 שניות")
            return
        }

        try {
            setLoadingState('יוצר חדר...')
            const room = await roomRepo.insert({
                limit,
                songDuration,
                password: password || undefined,
            })
            setLoadingState('מגדיר אותך כמנהל...')
            room.hostId = await participantRepo.insert({
                nickname: hostName,
                roomId: room.id
            })

            setLoadingState('אוסף שירים...')
            const randomTracks = await Track.getRandom(room.limit);
            const randomIds: number[] = randomTracks.map((t: any) => t.id);

            const tracks = await trackRepo.find({
                where: {id: randomIds}
            });

            setLoadingState('מלקט נתונים...')
            const metadataResults = await Promise.allSettled(tracks.map(async (track) => {
                const metadata = await Track.getMetadata(track.spId);
                return {id: track.id, track, metadata};
            }));

            const validTracks = metadataResults
                .filter(res => res.status === "fulfilled" && res.value.metadata)
                .map(res => ({
                    ...(res as PromiseFulfilledResult<{
                        id: number;
                        track: Track;
                        metadata: TrackMetadata
                    }>).value
                }))

            setLoadingState('שומר...')
            await roomRepo.relations(room).tracks.insert(validTracks)

            setLoadingState('מעביר אותך למשחק...')
            router.push(`/room/${room.id}`)
        } catch (err) {
            setError("Failed to create room")
            console.log(err)
        }
    }

    return (
        <Card className={"w-full rounded-tl-none border-2 border-tremor-brand-subtle"}>
            <Text className={"text-2xl text-center font-semibold"}>צור חדר חדש</Text>
            {error && <Callout title={error} color={"red"} icon={RiCloseLine}/>}

            <form onSubmit={e => {
                e.preventDefault()
                create()
            }} className={"flex flex-col gap-3"}>
                <div>
                    <NumberInput
                        icon={RiTimeFill}
                        min={3}
                        max={30}
                        placeholder="משך שיר"
                        value={songDuration}
                        onValueChange={setSongDuration}
                    />
                    <Text className={"text-sm"}>משך שיר (בשניות)</Text>
                </div>

                <div>
                    <NumberInput
                        icon={RiNumbersFill}
                        min={3}
                        max={30}
                        placeholder="מספר שירים"
                        value={limit}
                        onValueChange={setLimit}
                    />
                    <Text className={"text-sm"}>מספר שירים במשחק</Text>
                </div>

                <Flex className={"gap-4"}>
                    <TextInput
                        icon={RiEyeFill}
                        type="text"
                        placeholder="סיסמה לחדר"
                        value={password}
                        onValueChange={setPassword}
                    />
                    <Button variant={"light"}
                            size={"xs"}
                            disabled={!password.length}
                            icon={RiFileCopy2Fill}
                            type={"button"}
                            onClick={() => {
                                navigator.clipboard.writeText(password)
                            }}>
                        <Text>העתק</Text>
                    </Button>

                </Flex>

                <div>
                    <TextInput
                        icon={RiPencilFill}
                        placeholder="לואי"
                        value={hostName}
                        onValueChange={setHostName}
                    />
                    <Text className={"text-sm"}>הזן את שמך</Text>
                </div>

                <Button type="submit" disabled={!!loadingState}>
                    צור חדר
                </Button>

                {!!loadingState && <Callout title={loadingState} className={"w-fit"}/>}
            </form>
        </Card>
    )
}

"use client"

import {repo} from "remult";
import {Room} from "@/server/entities/Room";
import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {Button, Callout, Dialog, DialogPanel, Flex, NumberInput, Text, TextInput, Title} from "@tremor/react";
import {RiErrorWarningFill, RiLockFill} from "@remixicon/react";
import {Track} from "@/server/entities/Track";
import {TrackMetadata} from "@/server/sp-fetcher";
import {AnimatePresence, motion} from "framer-motion";
import {Card, VolumeSpinner} from "@/ui/components";
import {useSession} from "next-auth/react";
import {User} from "@/server/entities/User";

const roomRepo = repo(Room)
const trackRepo = repo(Track)

export function CreateRoom() {
    const {data} = useSession();

    const [limit, setLimit] = useState<number>(5)
    const [songDuration, setSongDuration] = useState<number>(15)
    const [password, setPassword] = useState<string>("")
    const [error, setError] = useState<string>()
    const [loadingState, setLoadingState] = useState<string>()

    const router = useRouter()


    const reset = () => {
        setError(undefined)
        setLimit(5)
        setSongDuration(15)
        setPassword("")
        setLoadingState(undefined)
    }

    const create = async () => {
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
            let user = await repo(User).findFirst({email: data?.user?.email || ""})
            if (!user) {
                setError("משום מה לא הצלחנו למצוא את החשבון שלך :(")
                return
            }
            room.host = await roomRepo.relations(room).participants.insert({user})

            setLoadingState('אוסף שירים...')
            const randomTracks = await Track.getRandom(room.limit);
            const randomIds: number[] = randomTracks.map((t: any) => t.id);

            const tracks = await trackRepo.find({
                where: {id: randomIds}
            });

            setLoadingState('מלקט נתונים...')
            const metadataResults = await Promise.allSettled(tracks.map(async (track) => {
                try {
                    const metadata = await Track.getMetadata(track.spId);
                    return {id: track.id, track, metadata};
                } catch (error) {
                    console.error(`Failed to get metadata for track ${track.id}:`, error);
                    return null;
                }
            }));

            const validTracks = metadataResults
                .filter((res): res is PromiseFulfilledResult<{
                    id: number;
                    track: Track;
                    metadata: TrackMetadata;
                } | null> => res.status === "fulfilled" && res.value !== null)
                .map(res => res.value!)

            setLoadingState('שומר...')
            if (validTracks.length > 0) {
                await roomRepo.relations(room).tracks.insert(validTracks)
            } else {
                throw new Error("No valid tracks found")
            }

            setLoadingState('מעביר אותך למשחק...')
            router.push(`/room/${room.id}`)
        } catch (err) {
            const errorMessage = err instanceof Error ?
                err.message :
                "Failed to create room"
            setError(errorMessage)
            console.error("Room creation error:", err)
        }
    }

    return (
        <Card className={"w-full rounded-tl-none border shadow-lg border-tremor-brand-subtle"}>

            <form onSubmit={e => {
                e.preventDefault()
                create()
            }} className={"flex flex-col gap-3 text-start"}>
                <Title className={"text-center"}>צור חדר חדש</Title>
                <div>
                    <NumberInput
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
                        icon={RiLockFill}
                        type="text"
                        placeholder="סיסמה לחדר"
                        value={password}
                        onValueChange={setPassword}
                    />
                    <Button variant={"secondary"}
                            size={"sm"}
                            className={"gap-2"}
                            disabled={!password.length}
                            type={"button"}
                            onClick={() => navigator.clipboard.writeText(password)}>
                        <Text>העתק</Text>
                    </Button>

                </Flex>

                <Button type="submit" disabled={!!loadingState}>
                    צור חדר
                </Button>
            </form>

            <Dialog open={!!error} onClose={reset}>
                <DialogPanel className={"flex flex-col gap-8"}>
                    <Callout
                        title={error!}
                        color={"red"}
                        icon={RiErrorWarningFill}/>
                    <Button color={"red"} onClick={reset}>
                        איפוס
                    </Button>
                </DialogPanel>
            </Dialog>

            <Dialog open={!!loadingState} onClose={() => {
            }}>
                <DialogPanel>
                    <Flex justifyContent={"center"} flexDirection={"col"} className={"gap-4"}>
                        <VolumeSpinner/>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={loadingState}
                                initial={{opacity: 0, y: 10}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: -10}}
                                transition={{duration: 0.5}}
                            >

                                <Text className={"text-lg tracking-wide"}>
                                    {loadingState}
                                </Text>
                            </motion.div>
                        </AnimatePresence>
                    </Flex>
                </DialogPanel>
            </Dialog>
        </Card>
    )
}

"use client"

import {repo} from "remult";
import {Room} from "@/server/entities/Room";
import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {Button, Callout, Card, Dialog, DialogPanel, Flex, Text, TextInput, Title} from "@tremor/react";
import {RiErrorWarningFill, RiLockFill} from "@remixicon/react";
import {Track} from "@/server/entities/Track";
import {TrackMetadata} from "@/server/sp-fetcher";
import {AnimatePresence, motion} from "framer-motion";
import {VolumeSpinner} from "@/ui/components";
import {useSession} from "next-auth/react";
import {User} from "@/server/entities/User";
import {Slider} from "@/components/ui/slider";

const roomRepo = repo(Room)
const trackRepo = repo(Track)

export function CreateRoom() {
    const {data} = useSession();

    const [limit, setLimit] = useState<number>(5)
    const [songDuration, setSongDuration] = useState<number>(15)
    const [password, setPassword] = useState<string>("")
    const [error, setError] = useState<string>()
    const [copied, setCopied] = useState(false)
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
            // creating a new room with the selected settings
            setLoadingState('יוצר חדר...')
            let room = await roomRepo.insert({
                limit,
                songDuration,
                password: password || undefined,
            })

            // adding the creator as a first participant, and setting him as room host
            setLoadingState('מגדיר אותך כמנהל...')
            let user = await repo(User).findFirst({email: data?.user?.email || ""})
            if (!user) {
                setError("משום מה לא הצלחנו למצוא את החשבון שלך :(")
                return
            }
            const host = await roomRepo.relations(room).participants.insert({user})
            room = await roomRepo.update(room.id, {host})
            console.log(host)

            // retrieving list of random songs to play with
            setLoadingState('אוסף שירים...')
            const tracks = await trackRepo.find({
                orderBy: {randomValue: "asc"},
                limit: room.limit
            });

            // retrieving songs metadata (audio url, etc)
            setLoadingState('מלקט נתונים...')
            const metadataResults = await Promise.allSettled(tracks.map(async (t) => {
                try {
                    const metadata = await Track.getMetadata(t.spId);
                    return {id: t.id, track: t, metadata};
                } catch (error) {
                    console.error(`Failed to get metadata for track ${t.id}:`, error);
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

            if (validTracks.length !== room.limit) {
                console.warn("For some reasons, the songs count of the game are not exactly as requested.")
            }

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
        <Card className={"w-full rounded-3xl border shadow-lg border-tremor-brand-subtle"}>

            <form onSubmit={e => {
                e.preventDefault()
                create()
            }} className={"flex flex-col gap-3 text-start"}>
                <Title className={"text-center text-2xl"}>צור חדר חדש 🥳</Title>
                <div className={""}>
                    <Slider
                        onValueChange={e => setSongDuration(e[0])}
                        value={[songDuration]}
                        min={5}
                        max={60}
                        dir={"rtl"}
                        onValueCommit={() => navigator.vibrate([100, 100])}
                        defaultValue={[15]}/>
                    {/*<Slider onValueChange={setSongDuration} value={songDuration}/>*/}
                    <Text className={"text-sm mt-4 mb-8"}>משך שיר (בשניות): <span
                        className={"text-tremor-brand font-bold text-sm"}>{songDuration}</span></Text>
                </div>

                <div>
                    <Slider
                        onValueChange={e => setLimit(e[0])}
                        value={[limit]}
                        min={3}
                        max={15}
                        dir={"rtl"}
                        onValueCommit={() => navigator.vibrate([100, 100])}
                        defaultValue={[7]}/>
                    <Text className={"text-sm mt-4 mb-8"}>מספר שירים במשחק: <span
                            className={"text-tremor-brand font-bold text-sm"}>{limit}</span>
                    </Text>
                </div>

                <Flex className={"gap-4"}>
                    <TextInput
                        icon={RiLockFill}
                        type="text"
                        placeholder="סיסמה לחדר"
                        value={password}
                        onValueChange={setPassword}
                        className={"h-12 text-lg"}
                    />
                    <Button variant={"secondary"}
                            size={"xl"}
                            className={"gap-2 disabled:text-white"}
                            disabled={!password.length}
                            type={"button"}
                            onClick={() => navigator.clipboard.writeText(password).finally(() => setCopied(true))}>
                        <Text>
                            {copied ? "הועתק ✅" : "העתקה ✍🏻"}
                        </Text>
                    </Button>

                </Flex>

                <Button type="submit" disabled={!!loadingState} className={"h-12"}>
                    צור חדר 💃🏼
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

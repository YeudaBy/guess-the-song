"use client"


import {repo} from "remult";
import {Track} from "@/server/entities/Track";
import {useEffect, useState} from "react";
import {Button, Callout, Card, Flex, TextInput} from "@tremor/react";
import {TrackMetadata} from "@/server/sp-fetcher";
import Image from "next/image";

const trackRepo = repo(Track)

export default function AddTracks() {
    const [spId, setSpId] = useState<string>()
    const [metadata, setMetadata] = useState<TrackMetadata>()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string>()

    useEffect(() => {
        if (!spId) return
        setLoading(true)
        Track.getMetadata(spId).then(setMetadata).finally(() => setLoading(false))
    }, [spId]);

    const save = async () => {
        const ex = await trackRepo.findFirst({spId})
        if (ex) {
            setError("שיר זה כבר נמצא במאגר :)")
            return
        }
        if (!metadata?.name || !metadata.audioPreview) {
            setError("מטעמי זכויות יוצרים אין לנו את היכולת להציג שיר זה")
            return
        }
        await trackRepo.insert({
            name: metadata?.name,
            artist: metadata?.artist,
            spId,
        })
        location.reload()
    }

    return (<div>
        <Flex>
            <TextInput className={"w-fit m-auto my-4"}
                       value={spId} onValueChange={setSpId} placeholder={"SP ID"} disabled={loading}/>
        </Flex>

        {!!error && <Callout title={error} color={"red"}/>}

        {!!metadata && <Card className={"w-fit gap-2 m-auto my-4 flex flex-col"}>
            <Image src={metadata.imageUrl!} alt={metadata.name} width={200} height={200}/>
            <TextInput value={metadata.name} onValueChange={n => setMetadata(prevState => ({...prevState!, name: n}))}/>
            <TextInput value={metadata.artist}
                       onValueChange={a => setMetadata(prevState => ({...prevState!, artist: a}))}/>

            <Button onClick={save}>
                שמירה
            </Button>
        </Card>}
    </div>)
}

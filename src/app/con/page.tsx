"use client"


import {repo} from "remult";
import {Track} from "@/server/entities/Track";
import {useEffect, useState} from "react";
import {Button, Callout, Card, Flex, TextInput} from "@tremor/react";
import {TrackMetadata} from "@/server/sp-fetcher";
import {LoadingSpinner} from "@/ui/components";

const trackRepo = repo(Track)

export default function AddTracks() {
    const [spId, setSpId] = useState<string>()
    const [metadata, setMetadata] = useState<TrackMetadata>()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string>()

    useEffect(() => {
        if (!spId) return
        try {
            const trackId = extractSpotifyTrackId(spId)
            setLoading(true)
            Track.getMetadata(trackId)
                .then(setMetadata)
                .catch(setError)
                .finally(() => setLoading(false))
        } catch (e) {
            setError(e?.toString())
        }
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
            spId: extractSpotifyTrackId(spId!),
        })
        location.reload()
    }

    return (<div className={"max-w-3xl m-auto px-4"}>
        <Flex>
            <TextInput className={"max-w-full m-auto my-4"}
                       value={spId} onValueChange={setSpId} placeholder={"מזהה בספוטיפיי:"} disabled={loading}/>
        </Flex>

        {!!error && <Callout title={error} color={"red"}/>}
        {loading && <LoadingSpinner/>}

        {!!metadata && <form onSubmit={e => {
            e.preventDefault();
            save()
        }}>
            <Card
                className={"w-full gap-2 m-auto my-4 flex flex-col justify-center items-center bg-tremor-brand-faint"}>
                <img src={metadata.imageUrl!} alt={metadata.name} className={"max-w-sm aspect-square rounded-xl"}/>

                <TextInput value={metadata.name}
                           onValueChange={n => setMetadata(prevState => ({...prevState!, name: n}))}/>
                <TextInput value={metadata.artist}
                           onValueChange={a => setMetadata(prevState => ({...prevState!, artist: a}))}/>

                <Button type={"submit"}>
                    שמירה
                </Button>
            </Card>
        </form>
        }
    </div>)
}

function extractSpotifyTrackId(url: string): string {
    const regex = /^https:\/\/open\.spotify\.com\/track\/([a-zA-Z0-9]{22})(?:\?.*)?$/;
    const match = url.match(regex);

    if (!match) {
        throw new Error("הקישור אינו לטראק תקני של Spotify.");
    }

    return match[1];
}

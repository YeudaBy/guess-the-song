"use client"


import {repo} from "remult";
import {Track} from "@/server/entities/Track";
import {useEffect, useState} from "react";
import {Button, Callout, Card, Flex, TextInput} from "@tremor/react";
import {PlaylistMetadata, TrackMetadata} from "@/server/sp-fetcher";
import {LoadingSpinner} from "@/ui/components";

const trackRepo = repo(Track)

export default function AddTracks() {
    const [spId, setSpId] = useState<string>()
    const [trackMetadata, setTrackMetadata] = useState<TrackMetadata>()
    const [playlistMetadata, setPlaylistMetadata] = useState<PlaylistMetadata>()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string>()

    useEffect(() => {
        if (!spId) return
        try {
            const trackId = extractSpotifyTrackId(spId)
            setLoading(true)
            if (spId.includes("/playlist")) {

            } else {
                Track.getMetadata(trackId)
                    .then(setTrackMetadata)
                    .catch(setError)
                    .finally(() => setLoading(false))
            }
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
        if (!trackMetadata?.name || !trackMetadata.audioPreview) {
            setError("מטעמי זכויות יוצרים אין לנו את היכולת להציג שיר זה")
            return
        }
        await trackRepo.insert({
            name: trackMetadata?.name,
            artist: trackMetadata?.subtitle,
            spId: extractSpotifyTrackId(spId!),
            category: trackMetadata.lastFmTag
        })
        location.reload()
    }

    return (<div className={"max-w-3xl m-auto px-4"}>
        <Flex>
            <TextInput className={"max-w-full m-auto my-4"}
                       value={spId} onValueChange={setSpId} placeholder={"קישור לספוטיפיי:"} disabled={loading}/>
        </Flex>

        {!!error && <Callout title={error} color={"red"}/>}
        {loading && <LoadingSpinner/>}

        {!!trackMetadata && <form onSubmit={e => {
            e.preventDefault();
            save()
        }}>
            <Card
                className={"w-full gap-2 m-auto my-4 flex flex-col justify-center items-center bg-tremor-brand-faint"}>
                <img src={trackMetadata.imageUrl!} alt={trackMetadata.name}
                     className={"max-w-sm aspect-square rounded-xl"}/>

                <TextInput value={trackMetadata.name}
                           onValueChange={n => setTrackMetadata(prevState => ({...prevState!, name: n}))}/>
                <TextInput value={trackMetadata.subtitle}
                           onValueChange={a => setTrackMetadata(prevState => ({...prevState!, subtitle: a}))}/>
                <TextInput value={trackMetadata.lastFmTag} placeholder={"קטגוריה"}
                           onValueChange={a => setTrackMetadata(prevState => ({...prevState!, lastFmTag: a}))}/>

                <Button type={"submit"}>
                    שמירה
                </Button>
            </Card>
        </form>
        }
    </div>)
}

function extractSpotifyTrackId(url: string): string {
    const regex = /^https:\/\/open\.spotify\.com\/(track|playlist)\/([a-zA-Z0-9]{22})(?:\?.*)?$/;
    const match = url.match(regex);

    if (!match) {
        throw new Error("הקישור אינו לטראק תקני של Spotify.");
    }

    return match[2];
}

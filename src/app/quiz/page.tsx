"use client"

import {FormEvent, useEffect, useState} from "react";
import {repo, withRemult} from "remult";
import {Quiz} from "@/server/entities/Quiz";
import {signIn, signOut, useSession} from "next-auth/react";
import {Button, Callout, Card, Divider, Grid, Icon, List, ListItem, Text, TextInput, Title} from "@tremor/react";
import {useRouter} from "next/navigation";
import AuthWrapper from "@/ui/AuthReq";
import Link from "next/link";
import Image from "next/image";
import {Spinner} from "@/ui/components";
import {Playlist, SimplifiedPlaylist, SpotifyApi, Track} from "@spotify/web-api-ts-sdk";
import {RiFileCopyLine, RiSearchLine, RiSpotifyFill} from "@remixicon/react";

const qRepo = repo(Quiz)

export default function QuizPage() {
    const [topQuizzes, setTopQuizzes] = useState<Quiz[]>()
    const {data: session, status} = useSession();

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            withRemult(async r => {
                qRepo.find({
                    where: {
                        tracks: {
                            "!=": []
                        }
                    },
                    orderBy: {
                        visits: "asc",
                        completes: "asc"
                    }
                }).then(setTopQuizzes)
            })
        }
    }, [session, status]);

    console.log(topQuizzes)

    return <>
        <AuthWrapper>
            <CreateQuiz/>
            <Grid className={"gap-2 my-2"} numItems={1} numItemsSm={2} numItemsLg={3}>
                {topQuizzes?.map(q => <Link href={`/quiz/${q.id}`} key={q.id}>
                    <Card className={"text-right flex"}>
                        {q.tracks.length && <div className={"relative w-16 h-12"}>
                            {q.tracks.map((t) => t.album.images[0]).slice(0, 10).slice(0, 4).map((image, index) =>
                                <Image key={index} src={image.url} alt={"arts"}
                                       height={50}
                                       width={50}
                                       style={{
                                           right: index * 2,
                                           rotate: `-${index * 2}deg`,
                                           bottom: index * 2
                                       }}
                                       className={`absolute rounded`}/>)}
                        </div>}
                        <div>
                            <Title className={"text-xl"}>{q.name}</Title>
                            <Text
                                className={"font-light"}>{q.visits} ביקורים, {q.completes} השלמות, {q.tracks.length} רצועות</Text>
                        </div>
                    </Card>
                </Link>)}
            </Grid>
            <SpotifyPlaylistSelector/>

            <Button onClick={() => signOut()} className={"mt-24"}>
                Log out
            </Button>
        </AuthWrapper>
    </>
}

function SpotifyPlaylistSelector() {
    const {data, status} = useSession()
    const [client, setClient] = useState<SpotifyApi>()
    const [userPlaylists, setUserPlaylists] = useState<SimplifiedPlaylist[]>()
    const [loading, setLoading] = useState(false)
    const [spotifyPlaylistId, setSpotifyPlaylistId] = useState<string>()
    const [searchLoading, setSearchLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (!data?.accessToken) return
        setLoading(true)
        const spcl = SpotifyApi.withAccessToken(process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "", data.accessToken)
        setClient(spcl)
        spcl.currentUser.playlists.playlists().then(r => setUserPlaylists(r.items)).finally(() => setLoading(false))
    }, [data?.accessToken]);

    async function searchSpotifyPlaylist(e: FormEvent) {
        e.preventDefault()
        setSearchLoading(true)
        if (!spotifyPlaylistId) return
        const id = extractSpotifyPlaylistId(spotifyPlaylistId)
        if (!id) return false
        try {
            const playlist = await Quiz.getSpPlaylist(id)
            await onPlaylistSelected(playlist)
        } finally {
            setSearchLoading(false)
        }
    }

    async function onPlaylistSelected(playlist: SimplifiedPlaylist | Playlist<Track>) {
        console.log(playlist)
        if (!client) return
        const tracks = await client.playlists.getPlaylistItems(playlist.id, 'IL', undefined, 50)
        const n = await qRepo.insert({
            name: playlist.name,
            byUserName: data?.user.name || "Guest",
            byUserId: data?.user.id,
            image: playlist.images[0].url,
            tracks: tracks.items.map(t => t.track)
        })
        router.push(`/quiz/${n.id}`)
    }

    let content;

    if (status === "loading" || loading) {
        content = <div className={"w-full h-24 flex items-center justify-center"}><Spinner/></div>
    } else if (status === "unauthenticated" || !data?.accessToken) {
        content = <Callout title={"גישה נדחתה!"} className={"my-4"} color={"red"}>
            <Text>
                על מנת שנוכל לגשת לפלייליסטים שלך, עליך להתחבר עם חשבון הספוטיפיי או לאפשר גישה בכפתור.
            </Text>

            <Button
                className={"mt-6 w-full"}
                color={"green"}
                onClick={() => signIn("spotify", {redirect: false})}>
                <div className={"flex justify-center items-center flex-row"}>
                    <Icon color={"black"} icon={RiSpotifyFill}/>
                    {/*// @ts-ignore*/}
                    <Text color={"black"} className={"font-semibold font-sans"}>התחברות עם ספוטיפיי</Text>
                </div>
            </Button>
        </Callout>
    } else {
        content = <List className={"sp-list"}>
            {userPlaylists?.map(p => <SpotifyPlaylistItemPreview playlist={p} onSelect={onPlaylistSelected}
                                                                 key={p.id}/>)}
        </List>
    }

    return <Card
        className={"spotify-selector-card font-sans text-right tracking-wide ring-0 shadow-inner shadow-green-500 rounded-3xl mt-8"}>
        <Title color={"green"}>שחק עם הפלייליסטים מהספוטיפיי שלך!</Title>
        {content}

        <Divider className={"green-divider"}/>

        <Text>או שתף קישור לפלייליסט ואנו ננסה ליצור ממנו חידון:</Text>
        <form onSubmit={searchSpotifyPlaylist} className={"flex gap-2"}>
            <TextInput value={spotifyPlaylistId} onValueChange={setSpotifyPlaylistId}
                       placeholder={"קישור לפלייליסט..."}/>
            <Button disabled={searchLoading} variant={"light"}>
                <Icon icon={searchLoading ? Spinner : RiSearchLine} color={"secondary"}/>
            </Button>
        </form>
    </Card>
}

function SpotifyPlaylistItemPreview({playlist, onSelect}: {
    playlist: SimplifiedPlaylist,
    onSelect: (playlist: SimplifiedPlaylist) => Promise<void>,
}) {

    const [loading, setLoading] = useState(false)

    function decodeHtmlEntities(html: any) {
        const txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    return <ListItem key={playlist.id}
                     className={"text-right gap-2 cursor-pointer relative hover:right-2 transition-all active:bg-green-950"}
                     onClick={() => {
                         setLoading(true)
                         onSelect(playlist).finally(() => setLoading(false))
                     }}>
        <Image src={playlist.images[0].url} alt={playlist.name} width={50} height={50} className={"rounded"}/>
        <div className={"grow"}>
            <Text className={"text-sm font-bold"}>{playlist.name} <span
                className={"font-light opacity-75 text-xs"}>{playlist.owner.display_name}</span></Text>
            {!!playlist.description.length &&
                <Text
                    className={"text-xs opacity-75 font-light line-clamp-2"}>{decodeHtmlEntities(playlist.description)}</Text>}
        </div>
        <Button variant={"light"} disabled={loading}>
            <Icon icon={loading ? Spinner : RiFileCopyLine} color={"green"} size={"xs"}/>
        </Button>
    </ListItem>
}

function CreateQuiz() {
    const [name, setName] = useState<string>()
    const [loading, setLoading] = useState(false)
    const [quiz, setQuiz] = useState<Quiz>()
    const {data: session} = useSession();
    const router = useRouter()

    const create = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const n = await qRepo.insert({
            name,
            byUserName: session?.user?.name || "Guest",
            // @ts-ignore
            byUserId: session?.user?.id
        })
        setQuiz(n)
        setLoading(false)
        router.push(`/quiz/${n.id}/edit`)
    }

    return <Card className={"text-right"}>
        <Title className={"mb-4 text-center"}>👩🏻‍🎨 צור חידון</Title>

        <form onSubmit={create} className={"flex gap-2"}>
            <TextInput
                value={name}
                onValueChange={setName}
                placeholder={"כותרת"}
                required
                className={"grow"}
            />
            <Button loading={loading} disabled={!name || !!quiz}>
                צור
            </Button>
        </form>
    </Card>
}

function extractSpotifyPlaylistId(url: string): string | null {
    const match = url.match(/(?:playlist\/|playlist:)([a-zA-Z0-9]{22})/);
    return match ? match[1] : null;
}

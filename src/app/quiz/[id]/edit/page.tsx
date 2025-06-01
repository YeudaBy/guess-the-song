"use client"

import React, {useEffect, useRef, useState} from "react";
import {Track as SpTrack} from "@spotify/web-api-ts-sdk";
import {repo} from "remult";
import {Quiz} from "@/server/entities/Quiz";
import {Button, Divider, Icon, List, ListItem, Text, TextInput, Title} from "@tremor/react";
import {RiPauseFill, RiPlayFill} from "@remixicon/react";
import Image from "next/image";
import {Track} from "@/server/entities/Track";
import {Spinner} from "@/ui/components";
import {useParams} from "next/navigation";

const qRepo = repo(Quiz)

export default function EditQuiz() {
    const [quiz, setQuiz] = useState<Quiz | null>()
    const {id} = useParams()

    useEffect(() => {
        if (!id) return
        qRepo.findId(id as string).then(setQuiz)
    }, []);

    const addTrack = async (track: SpTrack) => {
        if (!quiz) return
        if (quiz.tracks.map(t => t.id).includes(track.id)) return
        setQuiz(prevState => {
                if (!prevState) return
                return {
                    ...prevState,
                    tracks: [track, ...prevState.tracks],
                }
            }
        )
        await qRepo.update(quiz.id, {tracks: [track, ...quiz.tracks]})
    }

    if (!quiz) {
        return <div className={"w-screen h-screen flex justify-center items-center"}>
            <Spinner/>
        </div>
    }

    return <>
        <Title className={""}>{quiz.name}</Title>

        <div className={"flex gap-2 mt-2"}>
            <Button className={"grow"}
                    onClick={() => navigator.clipboard.writeText(`${location.origin}/quiz/${quiz?.id}`)}>
                העתקת קישור לחידון
            </Button>
            <Button className={"grow"} onClick={() => navigator.share({url: `${location.origin}/quiz/${quiz?.id}`})}>
                שתף חידון
            </Button>
        </div>

        <List>
            {quiz.tracks?.map(t => {
                return <TrackPreview track={t}/>
            })}
        </List>

        <Divider/>
        <SpotifySearch onItemAdded={addTrack}/>
    </>
}

function SpotifySearch({onItemAdded}: {
    onItemAdded: (item: SpTrack) => void
}) {
    const [query, setQuery] = useState<string>()
    const [suggestions, setSuggestions] = useState<SpTrack[]>()
    const [item, setItem] = useState<SpTrack>()
    const [play, setPlay] = useState(false)
    const [canPlay, setCanPlay] = useState(false)

    const searchId = useRef(0)
    const audioRef = useRef<HTMLAudioElement>(null)

    useEffect(() => {
        if (!query || query.length < 3) {
            setSuggestions([])
            return
        }

        const id = ++searchId.current
        Quiz.searchSp(query).then((results) => {
            if (searchId.current === id) {
                setSuggestions(results.tracks?.items)
            }
        }).catch(err => {
            console.error("Search error:", err)
        })
    }, [query])

    useEffect(() => {
        if (!item) return
        if (!audioRef.current) return;

        Track.getMetadata(item?.id).then(r => {
            if (!audioRef.current) return
            audioRef.current.src = r?.audioPreview || ""
            audioRef.current.addEventListener("canplay", () => setCanPlay(true))
        })

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current.removeEventListener("canplay", () => setCanPlay(true))
            }
            setPlay(false);
            setCanPlay(false)
        };
    }, [item]);

    return <>
        <TextInput value={query} onValueChange={setQuery} placeholder={"חפש שם שיר או אמן..."}/>

        <List>
            {suggestions?.map(s => <ListItem onClick={() => {
                setItem(s)
                setSuggestions([])
                setQuery("")
            }} className={"cursor-pointer"}>
                <TrackPreview track={s}/>
            </ListItem>)}
        </List>

        {!!item && <div
            className={"gap-2 flex justify-between items-center border border-tremor-brand p-1 mt-3 rounded-tremor-default"}>
            <TrackPreview track={item}/>
            <Button variant={"light"} disabled={!canPlay} onClick={() => {
                if (audioRef.current) {
                    if (play) {
                        audioRef.current.pause();
                        setPlay(false)
                    } else {
                        audioRef.current.play().then(() => setPlay(true))
                    }
                }
            }}>
                <Icon icon={!canPlay ? Spinner : play ? RiPauseFill : RiPlayFill}/>
            </Button>
            <Button size={"lg"} onClick={() => {
                onItemAdded(item)
                setItem(undefined)
            }} className={"rounded-md"} variant={"secondary"}>
                Add
            </Button>

            <audio hidden ref={audioRef}/>
        </div>}
    </>
}

function TrackPreview({track}: { track: SpTrack }) {
    return <div className={"flex gap-3 text-right grow"}>
        <Image className={"rounded"}
               src={track.album.images[0].url} alt={"Image art"} height={40} width={40}/>
        <div className={"grow"}>
            <Text className={"text-base"}>{track.name} {track.explicit ?
                <span className={"text-xs bg-tremor-brand-muted rounded p-0.5 px-1.5"}>e</span> : ""}</Text>
            <Text className={"font-light"}>{track.artists.map(a => a.name).join(", ")}</Text>
        </div>
    </div>
}


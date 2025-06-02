"use client"

import React, {useEffect, useRef, useState} from "react";
import {Track as SpTrack} from "@spotify/web-api-ts-sdk";
import {repo} from "remult";
import {Quiz} from "@/server/entities/Quiz";
import {Button, Icon, List, ListItem, Text, TextInput, Title} from "@tremor/react";
import {RiPauseFill, RiPlayFill} from "@remixicon/react";
import Image from "next/image";
import {Track} from "@/server/entities/Track";
import {Spinner} from "@/ui/components";
import {useParams} from "next/navigation";
import {useSession} from "next-auth/react";
import Link from "next/link";

const qRepo = repo(Quiz)

export default function ShowQuiz() {
    const [quiz, setQuiz] = useState<Quiz | null>()
    const {id} = useParams()
    const {data: session, status} = useSession();

    useEffect(() => {
        if (!id) return
        qRepo.findId(id as string).then(setQuiz)
    }, []);

    useEffect(() => {
        if (!quiz) return
        qRepo.update(quiz?.id, {visits: quiz.visits + 1})
    }, [quiz]);


    if (!quiz) {
        return <div className={"w-screen h-screen flex justify-center items-center"}>
            <Spinner/>
        </div>
    }

    const play = async () => {

    }

    //
    return <>
        <Link href={`/quiz/${quiz.id}`}><Title className={""}>{quiz.name}</Title></Link>

        <Icon icon={RiPlayFill} size={"xl"} className={"m-auto"} onClick={play}/>

        <div className={"flex gap-2 mt-2"}>
            <Button className={"grow"}
                    onClick={() => navigator.clipboard.writeText(`${location.origin}/quiz/${quiz?.id}`)}>
                העתקת קישור לחידון
            </Button>
            <Button className={"grow"} onClick={() => navigator.share({url: `${location.origin}/quiz/${quiz?.id}`})}>
                שתף חידון
            </Button>
            {
                // @ts-ignore
                session?.user.id === quiz.byUserId && <Link href={`/quiz/${quiz.id}/edit`}>
                    <Button>ערוך</Button>
                </Link>
            }
        </div>

        <List className={"mt-5"}>
            {quiz.tracks?.map(t => {
                return <TrackPreview key={t.id} track={t}/>
            })}
        </List>
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


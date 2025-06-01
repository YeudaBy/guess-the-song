"use client"

import {repo} from "remult";
import {Quiz} from "@/server/entities/Quiz";
import {FormEvent, useEffect, useState} from "react";
import {Button, Card, TextInput, Title} from "@tremor/react";
import {Track} from "@/server/entities/Track";
import {useSession} from "next-auth/react";

const qRepo = repo(Quiz)
const tRepo = repo(Track)

export default function CreateQuiz() {
    const [name, setName] = useState<string>()
    const [loading, setLoading] = useState(false)
    const [quiz, setQuiz] = useState<Quiz>()
    const {data: session, status} = useSession();

    const create = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        // @ts-ignore
        const n = await qRepo.insert({
            name,
            byUser: status === "authenticated" ? session?.user : "Guest"
        })
        setQuiz(n)
        setLoading(false)
    }


    useEffect(() => {
        console.log(quiz)
    }, [quiz]);


    return (
        <Card className={"text-right"}>
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

            {!!quiz && <>


            </>}
        </Card>
    )
}


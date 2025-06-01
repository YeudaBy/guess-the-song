"use client"

import {FormEvent, useEffect, useState} from "react";
import {repo, withRemult} from "remult";
import {Quiz} from "@/server/entities/Quiz";
import {useSession} from "next-auth/react";
import {Button, Card, Grid, Text, TextInput, Title} from "@tremor/react";
import {useRouter} from "next/navigation";
import AuthWrapper from "@/ui/AuthReq";
import Link from "next/link";

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


            <Grid className={"gap-2 my-2"} numItems={2} numItemsSm={3} numItemsMd={4} numItemsLg={5}>
                {topQuizzes?.map(q => <Link href={`/quiz/${q.id}`} key={q.id}>
                    <Card>
                        <Title>{q.name}</Title>
                        <Text>{q.visits} ביקורים, {q.completes} השלמות, {q.tracks.length} רצועות</Text>
                    </Card>
                </Link>)}
            </Grid>
        </AuthWrapper>
    </>
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

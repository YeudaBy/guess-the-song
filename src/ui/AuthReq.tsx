"use client";

import {signIn, signOut, useSession} from "next-auth/react";
import {Button, Card, Text, Title} from "@tremor/react";
import Image from "next/image";
import React from "react";
import Link from "next/link";

export default function AuthWrapper({children}: { children: React.ReactNode }) {
    const {data: session, status} = useSession();

    if (status === "loading") return <div className="flex justify-center items-center h-screen">טוען...</div>;

    if (!session) {
        return (
            <div className="flex justify-center items-center text-center h-screen">
                <Card className="w-96 p-6 bg-white shadow-lg rounded-xl">
                    <Title className="text-xl font-bold mb-4">התחברות</Title>
                    <Text className="mb-4">עליך להתחבר כדי להמשיך</Text>
                    {/*// @ts-ignore todo*/}
                    <Button onClick={() => signIn()} className=" w-full">
                        התחבר עם Google
                    </Button>
                </Card>
            </div>
        );
    }

    console.log(session.user?.image)

    return (
        <div>
            <div className="flex justify-end p-1 px-2 gap-3 relative items-center rounded-full bg-tremor-brand-faint m-2">
                <Link href={"/"} className={"flex gap-1 rounded-full p-1 justify-center items-center px-4 border"}>
                    <Image src={"/images/logo.png"} alt={""} width={38} height={38}/>
                    <Text className={"font-extrabold text-lg"}>
                        מי שישמע!
                    </Text>
                </Link>

                <div className={"grow"}/>

                <Image src={session.user?.image || ""} alt={"User image"}
                       className={"rounded-full"} width={24} height={24}/>
                <Text className={"text-md"}>{session.user?.name}</Text>
                <Button variant={"secondary"} size={"xs"} onClick={() => signOut()}
                        className="rounded-full">התנתק</Button>
            </div>
            {children}
        </div>
    );
}

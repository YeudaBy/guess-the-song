"use client";

import {signIn, signOut, useSession} from "next-auth/react";
import {Text, Title} from "@tremor/react";
import {Button, Card} from "@/ui/components";

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
                    <Button onClick={() => signIn("google")} className=" w-full">
                        התחבר עם Google
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-end p-4 gap-3 relative items-center">
                <img src={session.user?.image || ""} alt={"User image"}
                     className={"h-10 w-10 rounded-full"}/>
                <Text className={"text-lg"}>{session.user?.name}</Text>
                {/*// @ts-ignore todo*/}
                <Button variant={"outline"} onClick={() => signOut()}
                        className="">התנתק</Button>
            </div>
            {children}
        </div>
    );
}

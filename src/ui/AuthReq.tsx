"use client";

import {signIn, signOut, useSession} from "next-auth/react";
import {Button, Card, Text, Title} from "@tremor/react";

export default function AuthWrapper({children}: { children: React.ReactNode }) {
    const {data: session, status} = useSession();

    if (status === "loading") return <div className="flex justify-center items-center h-screen">טוען...</div>;

    if (!session) {
        return (
            <div className="flex justify-center items-center text-center h-screen">
                <Card className="w-96 p-6 bg-white shadow-lg rounded-xl">
                    <Title className="text-xl font-bold mb-4">התחברות</Title>
                    <Text className="mb-4">עליך להתחבר כדי להמשיך</Text>
                    <Button onClick={() => signIn("google")} className=" w-full">
                        התחבר עם Google
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-end p-4">
                <Button onClick={() => signOut()} className="bg-red-500 text-white">התנתק</Button>
            </div>
            {children}
        </div>
    );
}

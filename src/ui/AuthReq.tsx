"use client";

import {ClientSafeProvider, getProviders, signIn, useSession} from "next-auth/react";
import {Button, Card, Text, Title} from "@tremor/react";
import React, {useEffect, useState} from "react";

export default function AuthWrapper({children}: { children: React.ReactNode }) {
    const {data: session, status} = useSession();
    const [providers, setProviders] = useState<ClientSafeProvider[]>()

    useEffect(() => {
        getProviders().then(pros => {
            setProviders(Object.values(pros || {}))
        })
    }, []);

    if (status === "loading") return <div className="flex justify-center items-center h-screen">טוען...</div>;

    if (!session) {
        return (
            <div className="flex justify-center items-center">
                <Card className="w-96 p-6 shadow-lg rounded-xl text-right">
                    <Title className="text-xl font-bold mb-4">התחברות</Title>
                    <Text className="mb-4">עליך להתחבר כדי להמשיך</Text>
                    <div className={"flex flex-col gap-2"}>
                        {providers?.map(p => <Button key={p.id} onClick={() => signIn(p.id)}>
                            התחברות עם {p.name}
                        </Button>)}
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div>
            {children}
        </div>
    );
}

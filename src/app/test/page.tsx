"use client"

import {useEffect} from "react";
import {repo} from "remult";
import {Track} from "@/server/entities/Track";


const trackRepo = repo(Track)

export default function () {

    useEffect(() => {
        trackRepo.find({
            orderBy: {
                randomValue: "asc" // this makes it random!
            },
            limit: 3
        }).then(console.log)
    }, []);

    return (
        <>
            {/*<TextInput onValueChange={sendData}/>*/}
            {/*{data}*/}
        </>
    )
}

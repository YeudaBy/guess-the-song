import {remultNextApp} from "remult/remult-next";
import {User} from "@/server/entities/User";
import {Track} from "@/server/entities/Track";
import {Room, TrackInRoom} from "@/server/entities/Room";
import {Participant} from "@/server/entities/Participant";
import {createPostgresDataProvider} from "remult/postgres";
import {Playlist} from "@/server/entities/Playlist";
import {repo} from "remult";
import {fetchTrackData} from "@/server/sp-fetcher";
import {Quiz} from "@/server/entities/Quiz";

export const dp = createPostgresDataProvider({
    connectionString: process.env.POSTGRES_URL
})

export const api = remultNextApp({
    admin: true,
    entities: [Track, User, Room, Participant, TrackInRoom, Playlist, Quiz],
    dataProvider: dp,
    // initApi: async (remult) => {
    //     const trepo = repo(Track)
    //     for await (const track of trepo.query({
    //         where: {
    //             category: undefined
    //         }
    //     })) {
    //         const spmtd = await fetchTrackData(track.spId)
    //         if (!!spmtd?.lastFmTag) continue
    //         await trepo.update(track.id, {
    //             category: spmtd?.lastFmTag
    //         })
    //         console.log(`${spmtd?.name} - ${spmtd?.subtitle}. updated category: ${spmtd?.lastFmTag}`)
    //     }
    // }
    // getUser: getUserOnServer
});

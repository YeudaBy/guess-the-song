import {remultNextApp} from "remult/remult-next";
import {User} from "@/server/entities/User";
import {Track} from "@/server/entities/Track";
import {Room, TrackInRoom} from "@/server/entities/Room";
import {Participant} from "@/server/entities/Participant";
import {createPostgresDataProvider} from "remult/postgres";

export const api = remultNextApp({
    admin: true,
    entities: [Track, User, Room, Participant, TrackInRoom],
    dataProvider: createPostgresDataProvider({
        connectionString: process.env.POSTGRES_URL
    }),
    // getUser: getUserOnServer
});

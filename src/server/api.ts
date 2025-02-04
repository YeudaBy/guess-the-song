import {remultNextApp} from "remult/remult-next";
import {User} from "@/server/User";
import {Track} from "@/server/Track";
import {Room} from "@/server/Room";
import {Participant} from "@/server/Participant";

export const api = remultNextApp({
    admin: true,
    entities: [Track, User, Room, Participant],
});

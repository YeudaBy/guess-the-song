import {BackendMethod, Entity, Fields} from "remult";
// import {Track} from "@/server/entities/Track";
import {spApi} from "@/server/sp-api";
import {Track as SpTrack} from "@spotify/web-api-ts-sdk";

@Entity("quiz", {
    allowApiCrud: true
})
export class Quiz {
    @Fields.cuid()
    id!: string;

    @Fields.string()
    name = ""

    @Fields.string()
    image?: string | undefined

    @Fields.string()
    byUserName: string = "Guest"

    @Fields.string()
    byUserId?: string

    // @Relations.toMany(() => Track)
    // tracks: Track[] = []

    @Fields.json<SpTrack[]>()
    tracks: SpTrack[] = []

    @Fields.number()
    visits = 0

    @Fields.number()
    completes = 0

    @Fields.number()
    topScore = 0

    @BackendMethod({allowed: true})
    static async searchSp(query: string) {
        return spApi.search(query)
    }
}

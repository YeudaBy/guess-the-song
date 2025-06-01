import {BackendMethod, Entity, Fields, Relations} from "remult";
import {User} from "@/server/entities/User";
import {fetchTrackData} from "@/server/sp-fetcher";
import {Track} from "@/server/entities/Track";

@Entity("playlists", {
    allowApiCrud: true
})
export class Playlist {
    @Fields.autoIncrement()
    id!: number;

    @Fields.string()
    name = '';

    @Fields.string()
    subtitle = "";

    @Fields.string()
    spId = "";

    @Relations.toOne(() => User)
    byUser?: User

    @Relations.toMany<Playlist, Track>(() => Track, {
        findOptions: {}
    })
    tracks: Track[] = []

    @BackendMethod({allowed: true})
    async getMetadata() {
        return fetchTrackData(this.spId)
    }

    @BackendMethod({allowed: true})
    static async getMetadata(spId: string) {
        return fetchTrackData(spId)
    }

    // @BackendMethod({allowed: true})
    // static randomApi = async (count: number) => {
    //     const tracks = await dbNamesOf(Track)
    //     const sql = SqlDatabase.getDb()
    //     const r = await sql.execute(`SELECT id, name
    //                                  FROM ${tracks}
    //                                  ORDER BY RANDOM() LIMIT ${count}`)
    //     return r.rows
    // }
    //
    // static getRandom = async (count: number) => {
    //     return fetch(`/api/random?count=${count}`).then(r => r.json())
    // }
}

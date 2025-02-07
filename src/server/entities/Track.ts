import {BackendMethod, dbNamesOf, Entity, Fields, Relations, SqlDatabase} from "remult";
import {User} from "@/server/entities/User";
import {fetchTrackData} from "@/server/sp-fetcher";

@Entity("tracks", {
    allowApiCrud: true
})
export class Track {
    @Fields.autoIncrement()
    id!: number;

    @Fields.string()
    name = '';

    @Fields.string()
    artist = "";

    @Fields.string()
    spId = "";

    @Fields.string()
    funFact = ""

    @Fields.number()
    guessesCount = 0

    @Relations.toOne(() => User)
    byUser?: User

    @BackendMethod({allowed: true})
    async getMetadata() {
        return fetchTrackData(this.spId)
    }

    @BackendMethod({allowed: true})
    static async getMetadata(spId: string) {
        return fetchTrackData(spId)
    }

    @BackendMethod({allowed: true})
    static randomApi = async (count: number) => {
        const tracks = await dbNamesOf(Track)
        const sql = SqlDatabase.getDb()
        const r = await sql.execute(`SELECT id, name
                                     FROM ${tracks}
                                     ORDER BY RANDOM() LIMIT ${count}`)
        return r.rows
    }

    static getRandom = async (count: number) => {
        return fetch(`/api/random?count=${count}`).then(r => r.json())
    }
}

import {BackendMethod, dbNamesOf, Entity, Fields, Filter, Relations, SqlDatabase} from "remult";
import {User} from "@/server/User";
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

    static randomNames = Filter.createCustom<Track>(async () => {
        const trackDbName = await dbNamesOf(Track)
        return {
            $and: [
                SqlDatabase.rawFilter(() =>
                    `SELECT name FROM ${trackDbName} ORDER BY RANDOM() LIMIT 4`
                ),
            ],
        }
    })
}

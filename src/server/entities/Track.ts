import {BackendMethod, Entity, Fields, Relations} from "remult";
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

    @Fields.string()
    category?: string

    @Fields.number({
        sqlExpression: () => 'random()',
        includeInApi: false
    })
    randomValue!: number

    @BackendMethod({allowed: true})
    async getMetadata() {
        return fetchTrackData(this.spId)
    }

    @BackendMethod({allowed: true})
    static async getMetadata(spId: string) {
        return fetchTrackData(spId)
    }
}


import {Entity, Fields, Relations} from "remult";
import {Room} from "@/server/entities/Room";
import {User} from "@/server/entities/User";

@Entity<Participant>("participants", {
    allowApiCrud: true,
    id: {
        roomId: true,
        userId: true
    }
})
export class Participant {
    @Fields.number()
    score?: number

    @Fields.number()
    roomId!: number

    @Relations.toOne(() => Room, "roomId")
    room?: Room

    @Fields.number()
    userId!: number

    @Relations.toOne<Participant, User>(() => User, "userId")
    user?: User
}

import {Entity, Fields, IdEntity, Relations} from "remult";
import {Room} from "@/server/entities/Room";
import {User} from "@/server/entities/User";

@Entity<Participant>("participants", {
    allowApiCrud: true,
    // id: ['roomId', 'userId']
})
export class Participant extends IdEntity {

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

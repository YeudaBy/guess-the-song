import {Entity, Fields, Relations} from "remult";
import {Room} from "@/server/Room";

@Entity("participants", {allowApiCrud: true})
export class Participant {
    @Fields.cuid()
    id!: string

    @Fields.string()
    nickname: string = ""

    @Fields.number()
    score?: number

    @Fields.number()
    roomId!: number

    @Relations.toOne(() => Room, "roomId")
    room?: Room
}

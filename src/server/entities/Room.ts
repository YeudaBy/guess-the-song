import {Entity, Fields, Relations} from "remult";
import {Participant} from "@/server/Participant";


@Entity<Room>("room", {
    allowApiCrud: true
})
export class Room {
    @Fields.autoIncrement()
    id!: number

    @Relations.toOne(() => Participant)
    hostId!: Participant

    @Fields.number()
    limit = 5

    @Fields.number()
    songDuration = 5

    @Fields.string()
    password?: string

    @Fields.createdAt()
    createdAt = new Date()

    @Fields.string()
    status: 'waiting' | 'in-progress' | 'completed' = 'waiting'

    @Relations.toMany(() => Participant)
    participants?: Participant[]
}

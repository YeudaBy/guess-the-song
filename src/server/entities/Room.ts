import {Entity, Fields, Relations} from "remult";
import {Participant} from "@/server/entities/Participant";
import {Track} from "@/server/entities/Track";
import {TrackMetadata} from "@/server/sp-fetcher";

export enum RoomStatus {
    Initializing,
    Lobby,
    Loading,
    InProgress,
    Completed,
    Error
}


@Entity<Room>("room", {
    allowApiCrud: true
})
export class Room {
    @Fields.autoIncrement()
    id!: number

    @Relations.toOne(() => Participant, {defaultIncluded: true})
    host!: Participant

    @Fields.number()
    limit = 5

    @Fields.number()
    songDuration = 5

    @Fields.string()
    password?: string

    @Fields.createdAt()
    createdAt = new Date()

    @Fields.enum<RoomStatus>(() => RoomStatus)
    status: RoomStatus = RoomStatus.Initializing

    @Relations.toMany<Room, Participant>(() => Participant, "roomId")
    participants?: Participant[]

    @Relations.toMany<Room, TrackInRoom>(() => TrackInRoom, 'roomId')
    tracks?: TrackInRoom[]

    // static byHost = Filter.createCustom<Room, { userId: number }>(
    // async ({userId}) => {
    // console.log(userId)
    // const participants = await repo(Participant).find({
    //     where: {userId: userId},
    // })
    // console.log(participants)
    // return {
    //     hostId: {$in: participants.map((c) => c.id)},
    // }
    // }
    // );

}


@Entity<TrackInRoom>('TrackInRoom', {
    allowApiCrud: true,
    id: ['trackId', 'roomId'],
})
export class TrackInRoom {
    @Fields.integer()
    trackId = 0
    @Fields.integer()
    roomId = 0
    @Relations.toOne<TrackInRoom, Track>(() => Track, 'trackId')
    track?: Track

    @Fields.json<TrackMetadata>()
    metadata!: TrackMetadata
}

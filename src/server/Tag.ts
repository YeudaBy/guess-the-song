import {Entity, Fields} from "remult";

@Entity("tag", {
    allowApiCrud: true
})
export class Tag {
    @Fields.autoIncrement()
    id!: number;

    @Fields.string()
    name = ""

    @Fields.string()
    image?: string | undefined
}

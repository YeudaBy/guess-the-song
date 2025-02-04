import {Entity, Fields} from "remult";

@Entity("users", {
    allowApiCrud: true
})
export class User {
    @Fields.autoIncrement()
    id!: number;

    @Fields.string()
    name = ""

    @Fields.string()
    image?: string | undefined
}

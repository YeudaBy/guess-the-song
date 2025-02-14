import {Entity, Fields} from "remult";

export enum UserRules {
    User = "User",
    Admin = "Admin"
}

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

    @Fields.string()
    email?: string

    @Fields.boolean()
    isGuest = true;

    @Fields.json<UserRules[]>(() => UserRules)
    rules = [UserRules.User]
    //
    // @Fields.string({allowNull: true})
    // passwordHash?: string;
}

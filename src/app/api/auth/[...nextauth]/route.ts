import NextAuth, {getServerSession} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import {api} from "@/server/api";
import {User} from "@/server/entities/User";
import {remult, UserInfo} from "remult";

const SECRET_KEY = process.env.SECRET_KEY || "your-secret-key";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    secret: SECRET_KEY,
    callbacks: {
        async signIn({profile}) {
            // נבדוק שקיים אימייל בפרופיל
            if (profile?.email) {
                const remult = await api.getRemult();
                const userRepo = remult.repo(User);
                let existingUser = await userRepo.findOne({
                    where: {email: profile.email},
                });
                if (!existingUser) {
                    // יצירת משתמש חדש אם לא קיים
                    const newUser = new User();
                    newUser.name = profile.name || "Unknown";
                    newUser.email = profile.email;
                    // @ts-ignore
                    newUser.image = profile.picture || profile.image;
                    newUser.isGuest = false;
                    await userRepo.insert(newUser);
                } else {
                    // עדכון משתמש קיים
                    existingUser.name = profile.name || existingUser.name;
                    // @ts-ignore
                    existingUser.image = profile.picture || profile.image || existingUser.image;
                    existingUser.isGuest = false;
                    await userRepo.save(existingUser);
                }
            }
            return true;
        },
        async jwt({token, user}) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({session, token}) {
            if (token && session.user) {
                // @ts-ignore
                session.user.id = token.id as number;
            }
            return session;
        },
    },
});


export async function getUserOnServer(): Promise<UserInfo | undefined> {
    const session = await getServerSession()
    return await api.withRemult(async () => {
        const user = await remult.repo(User).findOne({
            where: {
                email: session?.user?.email || "--"
            }
        })
        if (!user) return
        return {
            ...user,
            id: user.id as unknown as string
        }
    })
}

// export {handler as GET, handler as POST}

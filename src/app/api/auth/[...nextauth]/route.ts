import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import {api} from "@/server/api";
import {User} from "@/server/entities/User";
import SpotifyProvider from "next-auth/providers/spotify";
import {AccessToken} from "@spotify/web-api-ts-sdk";

const SECRET_KEY = process.env.SECRET_KEY || "your-secret-key";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID || "",
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
            authorization: {
                url: "https://accounts.spotify.com/authorize",
                params: {
                    scope: "user-read-email playlist-read-private playlist-read-collaborative",
                },
            },
        })
    ],
    secret: SECRET_KEY,
    callbacks: {
        async signIn({profile}) {
            if (profile?.email) {
                const remult = await api.getRemult();
                const userRepo = remult.repo(User);
                let existingUser = await userRepo.findOne({
                    where: {email: profile.email},
                });
                if (!existingUser) {
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
        async jwt({token, user, account}) {
            if (user) {
                token.id = user.id;
            }
            if (account?.provider === "spotify") {
                const tokenObj: AccessToken = {
                    access_token: account.access_token!,
                    token_type: account.token_type!,
                    expires_in: account.expires_at!,
                    refresh_token: account.refresh_token!,
                }
                if (Object.values(tokenObj).every(v => !!v)) {
                    token.accessToken = tokenObj
                }
            }
            return token;
        },
        async session({session, token}) {
            if (token && session.user) {
                session.user.id = token.id;
            }
            if (token?.accessToken) {
                session.accessToken = token.accessToken
            }
            return session;
        },
    },
});


// export async function getUserOnServer(): Promise<UserInfo | undefined> {
//     const session = await getServerSession()
//     return await api.withRemult(async () => {
//         const user = await remult.repo(User).findOne({
//             where: {
//                 email: session?.user?.email || "--"
//             }
//         })
//         if (!user) return
//         return {
//             ...user,
//             id: user.id as unknown as string
//         }
//     })
// }

export {handler as GET, handler as POST}

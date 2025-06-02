import {SpotifyApi} from "@spotify/web-api-ts-sdk";

class SpApi {

    client() {
        return SpotifyApi.withClientCredentials(process.env.SPOTIFY_CLIENT_ID!!, process.env.SPOTIFY_CLIENT_SECRET!!);
    }

    async search(query: string) {
        return await this.client().search(query, ["track"], undefined, 10)
    }

    async getPlaylist(id: string) {
        return await this.client().playlists.getPlaylist(id)
    }
}

export const spApi = new SpApi()

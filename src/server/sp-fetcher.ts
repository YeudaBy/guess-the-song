const playlistId = '6SvyiNXrMfoj4QXp3aiCa4';
const trackId = "11Q3W4kReoMTUWuc8BQyLC"

type BaseEntityMetadata = {
    name: string
    id: string,
    subtitle?: string,
    imageUrl?: string
    explicit: boolean,
    baseColor?: string,
    lastFmTag?: string
}

export type TrackMetadata = BaseEntityMetadata & {
    audioPreview?: string
}

export type PlaylistMetadata = BaseEntityMetadata & {
    tracks: TrackMetadata[],
}

// export enum SpotifyEntityType {
//     track = 'track',
//     playlist = 'playlist'
// }

export const fetchTrackData = async (entityId: string): Promise<TrackMetadata | undefined> => {
    console.log({entityId})
    const url = `https://open.spotify.com/embed/track/${entityId}` // todo hardcoded type
    console.log(url)
    try {
        const htmlContent = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(res => res.text());

        const jsonDataRegex = /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/;
        const jsonDataMatch = htmlContent.match(jsonDataRegex);

        if (!jsonDataMatch || !jsonDataMatch[1]) {
            return undefined
        }

        const jsonData = JSON.parse(jsonDataMatch[1]);
        console.log(jsonData)

        const entity = jsonData.props.pageProps.state.data.entity
        if (!entity) return

        console.log(entity)
        console.log(entity.visualIdentity)

        let obj: PlaylistMetadata | TrackMetadata;

        switch (true) {
            // todo
            default: {
                obj = spotifyTrackToTrackMetadata(entity)
                break
            }
            // case SpotifyEntityType.playlist: {
            //     obj = {
            //         id: entity.id,
            //         name: entity.name,
            //         subtitle: entity.subtitle,
            //         explicit: entity.isExplicit,
            //         imageUrl: entity.visualIdentity?.image?.pop()?.url,
            //         tracks: entity.trackList
            //             ?.filter((t: any) => !!t.audioPreview)
            //             ?.map(spotifyTrackToTrackMetadata)
            //     }
            //     break
            // }
        }
        obj.baseColor = rgbaToHex(entity?.visualIdentity?.backgroundBase)
        obj.lastFmTag = await fetchLstFmTags(obj.name, obj.subtitle || "")

        console.log(obj)
        return obj

    } catch (error) {
        console.error("Error fetching playlist data:", error);
        return undefined;
    }
}

function spotifyTrackToTrackMetadata(entity: any): TrackMetadata {
    return {
        id: entity.id || entity.uid,
        name: entity.name || entity.title,
        subtitle: entity.artists?.map((a: any) => a.name)?.join(" ,") || entity.subtitle,
        audioPreview: entity.audioPreview.url,
        imageUrl: entity.visualIdentity?.image[0]?.url,
        explicit: entity.isExplicit
    }
}

type RGBA = {
    red: number;
    green: number;
    blue: number;
    alpha?: number;
};

function rgbaToHexWithAlpha({red, green, blue, alpha = 255}: RGBA): string {
    const toHex = (value: number) => value.toString(16).padStart(2, '0');
    return `#${toHex(red)}${toHex(green)}${toHex(blue)}${toHex(alpha)}`;
}

function rgbaToHex({red, green, blue}: RGBA): string {
    const toHex = (value: number) => value.toString(16).padStart(2, '0');
    return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}


// fetchTrackData(trackId, SpotifyEntityType.track).then(console.log)
// fetchTrackData(playlistId, SpotifyEntityType.playlist).then(console.log)

async function fetchLstFmTags(track: string, artist: string): Promise<string | undefined> {

    const url = `https://ws.audioscrobbler.com/2.0/?method=track.gettoptags&api_key=c3c5c93d9f8a055ded7294e69ca869e8&artist=${artist}&track=${track}&user=RJ&format=json`

    const res = await fetch(url)
    const json: { toptags: { tag: { name: string }[] } } = await res.json()
    console.log(json)

    return json.toptags?.tag?.map(t => t.name)?.at(0)
}

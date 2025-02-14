const playlistId = '6SvyiNXrMfoj4QXp3aiCa4';
const trackId = "11Q3W4kReoMTUWuc8BQyLC"

export type TrackMetadata = {
    name: string
    id: string,
    artist: string,
    audioPreview: string
    imageUrl?: string
    explicit: boolean
}

export const fetchTrackData = async (playlistId: string): Promise<TrackMetadata | undefined> => {
    console.log(playlistId)
    try {
        const htmlContent = await fetch(`https://open.spotify.com/embed/track/${playlistId}`, {
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


        const obj: TrackMetadata = {
            id: entity.id,
            name: entity.name,
            artist: entity.artists?.map((a: any) => a.name).join(" ,"),
            audioPreview: entity.audioPreview.url,
            imageUrl: entity.visualIdentity.image[0].url,
            explicit: entity.isExplicit
        }
        console.log(obj)
        return obj
    } catch (error) {
        console.error("Error fetching playlist data:", error);
        return undefined;
    }
}


const fetchMetadata = (trackId: string) => {
}

// fetchTrackData(trackId).then(tracks => {
//     console.log('Tracks with audio previews:', tracks);
// });


const fetchPlaylistData = async (playlistId: string) => {
    try {
        // Fetch the playlist embed page HTML content
        const htmlContent = await fetch(`https://open.spotify.com/embed/playlist/${playlistId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(res => res.text());

        // Regex to extract the JSON data from the <script> tag with id "__NEXT_DATA__"
        const regex = /<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/;
        const match = htmlContent.match(regex);

        if (match) {
            // Parse the JSON data from the matched content
            const jsonData = JSON.parse(match[1]);

            // Check if the track list exists and contains items with audio previews
            if (jsonData?.props?.pageProps?.state?.data?.entity?.trackList) {
                // Filter tracks that have an audio preview
                return jsonData.props.pageProps.state.data.entity.trackList.filter((item: any) => item.audioPreview != null);
            } else {
                console.log("No track list found or no audio preview available.");
                return [];
            }
        } else {
            console.log("No JSON data found in the page.");
            return [];
        }
    } catch (error) {
        console.error("Error fetching playlist data:", error);
        return [];
    }
}

// fetchPlaylistData(playlistId).then(tracks => {
//     console.log('Tracks with audio previews:', tracks);
// });


//
// // פונקציה לקבלת אסימון גישה
// async function getAccessToken() {
//     const response = await fetch('https://accounts.spotify.com/api/token', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/x-www-form-urlencoded',
//             'Authorization': 'Basic ' + btoa(process.env.SP_CLIENT_ID + ':' + process.env.SP_CLIENT_SECRET)
//         },
//         body: 'grant_type=client_credentials'
//     });
//     const data = await response.json();
//     return data.access_token;
// }
//
// // פונקציה לקבלת כל השירים מהפלייליסט
// async function getAllTracks(accessToken, playlistId) {
//     let tracks = [];
//     let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
//     while (url) {
//         const response = await fetch(url, {
//             headers: {
//                 'Authorization': 'Bearer ' + accessToken
//             }
//         });
//         console.log(response.ok)
//         if (!response.ok) {
//             console.log(response.statusText)
//         }
//         const data = await response.json();
//         tracks = tracks.concat(data.items);
//         url = data.next;
//     }
//     return tracks;
// }
//
// // פונקציה לספירת השירים עם preview_url
// function countTracksWithPreview(tracks) {
//     return tracks.filter(item => item.track && item.track.preview_url).length;
// }
//
// // הפונקציה הראשית
// async function main() {
//     try {
//         const accessToken = await getAccessToken();
//         const tracks = await getAllTracks(accessToken, playlistId);
//         const previewCount = countTracksWithPreview(tracks);
//         console.log(`מתוך ${tracks.length} שירים בפלייליסט, ${previewCount} מהם כוללים preview_url.`);
//     } catch (error) {
//         console.error('שגיאה:', error);
//     }
// }
//
// // main();

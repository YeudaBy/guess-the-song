import type {NextRequest} from "next/server";
import {fetchTrackData} from "@/server/sp-fetcher";

export const dynamic = 'force-static'

export async function GET(request: NextRequest,
                          {params}: { params: Promise<{ id: string }> }
) {
    const id = (await params).id
    if (!id) return Response.error()
    const results = await fetchTrackData(id)
    return Response.json(results || null)
}

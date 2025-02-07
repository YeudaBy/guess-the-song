import {NextRequest, NextResponse} from "next/server";
import {Track} from "@/server/entities/Track";
import {api} from "@/server/api";

export async function GET(request: NextRequest) {
    return api.withRemult(async () => {
        const searchParams = request.nextUrl.searchParams
        const l = await Track.randomApi(Number(searchParams.get('count') || 4))
        return NextResponse.json(l)
    })
}

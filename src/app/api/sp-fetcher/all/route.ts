import type {NextRequest} from "next/server";

export async function GET(request: NextRequest,
                          {params}: { params: Promise<{ id: string }> }
) {
    return Response.json(null)
}

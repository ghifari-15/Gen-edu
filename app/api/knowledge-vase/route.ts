import { NextRequest, NextResponse } from "next/server";
import { AuthUtils } from "@/lib/auth/utils"
import { KnowledgeBaseManager } from "@/lib/utils/knowledge-base";
import { count, error } from "console";


export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get("auth-token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const payload = AuthUtils.verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 })
        }
        const { searchParams } = new URL(request.url);
        const source = searchParams.get("source") ?? undefined ;
        const subject = searchParams.get("subject")?? undefined ;
        const tags = searchParams.get("tags")?.split(",").filter(Boolean);

        const knowledgeBase = await KnowledgeBaseManager.getKnowledgeBaseForUser(
            payload.userId,
            { source, subject, tags }
        );
        return NextResponse.json({
            success: true,
            data: knowledgeBase,
            count: knowledgeBase.length
        });



    } catch (error) {
        console.error('Error fetching knowledge base:', error);
        return NextResponse.json(
            { error: 'Failed to fetch knowledge base' },
            { status: 500 }
        );

    }
} 
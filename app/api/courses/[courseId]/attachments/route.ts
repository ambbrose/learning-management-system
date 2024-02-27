import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function POST(
    request: Request,
    { params }: { params: { courseId: string } }
) {
    try {
        const { userId } = auth();

        const { url } = await request.json();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        };

        const courseOwner = await db.course.findUnique({
            where: {
                id: params.courseId,
                userId: userId
            }
        });

        if (!courseOwner) {
            return new NextResponse("Unauthorized", { status: 401 });
        };

        const attachment = await db.attachment.create({
            data: {
                url,
                name: url.split("/").pop(),
                courseId: params.courseId
            }
        });

        return NextResponse.json(attachment);
    } catch (error) {
        console.log('[COURSE-ATTACHMENT-POST]:- ', error);
        return new NextResponse("Internal Server Error");
    };
};
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function DELETE(
    request:Request,
    { params }: { params: { courseId: string, attachmentId: string } }
) {
    try {

        const { userId } = auth();

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

        const attachment = await db.attachment.delete({
            where: {
                id: params.attachmentId,
                courseId: params.courseId,
            }
        });

        return NextResponse.json(attachment);

    } catch (error) {
        console.log('[ATTACHMENT-DELETE-ERROR]:- ', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    };
};
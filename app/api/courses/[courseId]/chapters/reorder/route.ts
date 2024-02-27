import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PUT(
    request: Request,
    { params }: { params: { courseId: string } }
) {
    try {
        const { userId } = auth();

        const { list } = await request.json();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const courseOwner = await db.course.findUnique({
            where: {
                id: params.courseId,
                userId: userId,
            }
        });

        if (!courseOwner) {
            return new NextResponse("Unauthorized", { status: 401 });
        };

        for (let item of list) {
            await db.chapter.update({
                where: {
                    id: item.id,
                    courseId: params.courseId
                },
                data: {
                    position: item.position
                }
            })
        };

        return new NextResponse("Chapters Reordered Successfully", { status: 200 });
    } catch (error) {
        console.log("[CHAPTERS-REORDER]:- ", error);
        return new NextResponse("Internal Server Error");
    }
}
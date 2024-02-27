import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { Chapter } from "@prisma/client";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params }: { params: { courseId: string} }
) {
    try {

        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        };

        const course = await db.course.findUnique({
            where: {
                id: params.courseId,
                userId: userId,
            },
            include: {
                chapters: {
                    include: {
                        muxData: true
                    }
                }
            }
        });

        if (!course) {
            return new NextResponse("Unauthorized", { status: 401 });
        };

        const hasPublishedChapter = course.chapters.some((chapter: Chapter) => chapter.isPublished);

        if (!course.title || !course.description || !course.imageUrl || !course.categoryId || !hasPublishedChapter) {
            return new NextResponse("Missing required fields", { status: 401 });
        };

        const publishedCourse = await db.course.update({
            where: {
                id: params.courseId,
                userId: userId
            },
            data: {
                isPublished: true
            }
        });

        return NextResponse.json(publishedCourse);

    } catch (error) {
        console.log('[COURSE-PUBLISH-ERROR]:- ', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
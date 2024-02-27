import Mux from "@mux/mux-node";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";

const { video } = new Mux({
    tokenId: process.env.MUX_TOKEN_ID!,
    tokenSecret: process.env.MUX_TOKEN_SECRET!
});

export async function DELETE(
    request: Request,
    { params }: { params: { courseId: string } }
) {
    try {
        const { userId } = auth();

        if (!userId || !isTeacher(userId)) {
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
            return new NextResponse("Course Not Found", { status: 404 });
        };

        for (const chapter of course.chapters) {
            if (chapter.muxData?.assetId) {
                await video.assets.delete(chapter.muxData.assetId);
            };
        };

        const deletedCourse = await db.course.delete({
            where: {
                id: params.courseId
            }
        });

        return NextResponse.json(deletedCourse);

    } catch (error) {
        console.log('[COURSE-DELETE-ERROR]:- ', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

export async function PATCH(
    request: Request,
    { params }: { params: { courseId: string } }
) {
    try {
        const { userId } = auth();

        const values = await request.json();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        };

        if (!params.courseId) {
            return new NextResponse("Course ID is required", { status: 400 });
        };

        if (!values) {
            return new NextResponse("Values are required", { status: 400 });
        };

        const course = await db.course.update({
            where: {
                id: params.courseId,
                userId
            },
            data: {
                ...values
            }
        });

        return NextResponse.json(course);

    } catch (error) {
        console.log('[COURSE-UPDATE-ERROR]:- ', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
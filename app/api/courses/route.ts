import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";

export async function POST(request: Request) {
    try {
        const { userId } = auth();

        const { title } = await request.json();

        if (!userId || !isTeacher(userId)) {
            return new NextResponse("Unauthorized", { status: 401 });
        };

        if (!title) {
            return new NextResponse("Title is required", { status: 400 });
        };

        const course = await db.course.create({
            data: {
                userId,
                title
            }
        });

        return NextResponse.json(course);

    } catch (error) {
        console.log("[COURSE-POST-ERROR]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    };
};
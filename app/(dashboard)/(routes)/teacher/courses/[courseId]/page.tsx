import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Category, Chapter, Course } from "@prisma/client";
import { CircleDollarSign, File, LayoutDashboard, ListChecks } from "lucide-react";

import { db } from "@/lib/db";
import { IconBadge } from "@/components/icon-badge";
import TitleForm from "./_components/title-form";
import DescriptionForm from "./_components/description-form";
import ImageForm from "./_components/image-form";
import CategoryForm from "./_components/category-form";
import PriceForm from "./_components/price-form";
import AttachmentForm from "./_components/attachment-form";
import ChaptersForm from "./_components/chapters-form";
import { Banner } from "@/components/banner";
import CourseActions from "./_components/course-actions";

const CoursePage = async ({ params }: { params: { courseId: string } }) => {

    const { userId } = auth();

    if (!userId) {
        redirect('/');
    };

    const course = await db.course.findUnique({
        where: {
            id: params.courseId,
            userId
        },
        include: {
            attachments: {
                orderBy: {
                    createdAt: 'desc'
                }
            },
            chapters: {
                orderBy: {
                    position: 'asc'
                }
            }
        }
    });

    const categories = await db.category.findMany({
        orderBy: {
            name: 'asc'
        }
    });

    if (!course) {
        redirect('/');
    };

    const requiredFields = [
        course.title,
        course.description,
        course.imageUrl,
        course.price,
        course.categoryId,
        course.chapters.some((chapter: Chapter) => chapter.isPublished)
    ];

    const totalFields = requiredFields.length;
    const completedFields = requiredFields.filter(Boolean).length;

    const complettionText = `(${completedFields}/${totalFields})`;

    const isComplete = requiredFields.every(Boolean);

    return (
        <>
            {!course.isPublished && (
                <Banner
                    variant='warning'
                    label="This course is not yet published. It will not be visible to the students."
                />
            )}

            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-y-2">
                        <h1 className="text-2xl font-medium">
                            Course setup
                        </h1>

                        <span className="text-sm text-slate-700">
                            Complete all fields {complettionText}
                        </span>
                    </div>

                    <CourseActions
                        disabled={!isComplete}
                        courseId={params.courseId}
                        isPublished={course.isPublished}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
                    <div>
                        <div className="flex items-center gap-x-2">
                            <IconBadge icon={LayoutDashboard} />
                            <h2 className="text-xl font-medium">
                                Customize your course
                            </h2>
                        </div>

                        <TitleForm
                            initialData={course}
                            courseId={course.id}
                        />

                        <DescriptionForm
                            initialData={course}
                            courseId={course.id}
                        />

                        <ImageForm
                            initialData={course}
                            courseId={course.id}
                        />

                        <CategoryForm
                            initialData={course}
                            courseId={course.id}
                            options={categories.map((category: Category) => ({
                                label: category.name,
                                value: category.id
                            }))}
                        />
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center gap-x-2">
                                <IconBadge icon={ListChecks} />
                                <h2 className="text-xl font-medium">
                                    Course chapters
                                </h2>
                            </div>

                            <ChaptersForm
                                initialData={course}
                                courseId={course.id}
                            />
                        </div>

                        <div>
                            <div className="flex items-center gap-x-2">
                                <IconBadge icon={CircleDollarSign} />
                                <h2 className="text-xl font-medium">
                                    Sell your course
                                </h2>
                            </div>

                            <PriceForm
                                initialData={course}
                                courseId={course.id}
                            />
                        </div>

                        <div>
                            <div className="flex items-center gap-x-2">
                                <IconBadge icon={File} />
                                <h2 className="text-xl font-medium">
                                    Resources $ Attachments
                                </h2>
                            </div>

                            <AttachmentForm
                                initialData={course}
                                courseId={course.id}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CoursePage;

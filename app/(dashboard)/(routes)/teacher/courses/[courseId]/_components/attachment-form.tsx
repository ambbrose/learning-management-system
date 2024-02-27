"use client";

import * as z from "zod";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { File, Loader, PlusCircle, X } from "lucide-react";
import { Attachment, Course } from "@prisma/client";
import { useState } from "react";


import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";

interface AttachmentFormProps {
    initialData: Course & { attachments: Attachment[] };
    courseId: string;
};

const formSchema = z.object({
    url: z.string().min(1)
});

const AttachmentForm = ({ initialData, courseId }: AttachmentFormProps) => {

    const router = useRouter();

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const toggleEdit = () => setIsEditing((current) => !current);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.post(`/api/courses/${courseId}/attachments`, values);
            toast.success("Course updated");
            toggleEdit();
            router.refresh();
        } catch {
            toast.error("Something went wrong");
        };
    };

    const onDelete = async (id: string) => {
        try {
            setDeletingId(id);

            await axios.delete(`/api/courses/${courseId}/attachments/${id}`);
            toast.success("Attachment deleted");
            router.refresh();
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setDeletingId(null);
        };
    };

    return (
        <div className="mt-6 border bg-slate-100 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                Course attachments
                <Button variant='ghost' onClick={toggleEdit}>
                    {isEditing && (
                        <>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </>
                    )}

                    {!isEditing && (
                        <>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add a file
                        </>
                    )}
                </Button>
            </div>

            {!isEditing ? (
                <>
                    {initialData.attachments.length < 1 ? (
                        <p className="text-sm mt-2 text-slate-500 italic">
                            No attachments yet
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {initialData.attachments.map((attchment: Attachment) => (
                                <div
                                    key={attchment.id}
                                    className="flex items-center p-3 w-full bg-sky-100 border-sky-200 border text-sky-700 rounded-md"
                                >
                                    <File className="flex-shrink-0 h-4 w-4 mr-2" />
                                    <p className="text-xs line-clamp-1">
                                        {attchment.name}
                                    </p>

                                    {deletingId === attchment.id && (
                                        <div className="ml-auto">
                                            <Loader className="h-4 w-4 animate-spin" />
                                        </div>
                                    )}

                                    {deletingId !== attchment.id && (
                                        <button
                                            onClick={() => onDelete(attchment.id)}
                                            className="ml-auto hover:opacity-75 transition"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div>
                    <FileUpload
                        endpoint="courseAttachment"
                        onChange={(url) => {
                            if (url) {
                                onSubmit({ url: url })
                            }
                        }}
                    />

                    <div className="text-xs text-muted-foreground mt-4">
                        Add anything your students might need to complete the course (e.g pdf&apos;s, images(4MB), audios, videos)
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttachmentForm;
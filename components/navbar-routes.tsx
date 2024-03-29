"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchInput } from "./search-input";
import { isTeacher } from "@/lib/teacher";

export const NavbarRoutes = () => {

    const { userId } = useAuth();

    const pathname = usePathname();

    const isSearchPage = pathname === "/search";
    const isCoursePage = pathname?.includes("/courses");
    const isTeacherPage = pathname?.startsWith("/teacher");

    return (
        <>
            {isSearchPage && (
                <div className="hidden md:block">
                    <SearchInput />
                </div>
            )}

            <div className="flex gap-x-2 ml-auto items-center">
                {isTeacherPage || isCoursePage ? (
                    <Link href={'/'}>
                        <Button size={'sm'} variant={'ghost'}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Exit
                        </Button>
                    </Link>
                ) : isTeacher(userId) ? (
                    <Link href={'/teacher/courses'}>
                        <Button size={'sm'} variant={'ghost'}>
                            Teacher Mode
                        </Button>
                    </Link>
                ) : null}

                <UserButton afterSignOutUrl="/" />
            </div>
        </>
    )
}
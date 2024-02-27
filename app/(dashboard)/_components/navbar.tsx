import { NavbarRoutes } from "@/components/navbar-routes";
import { MobileSidebar } from "./mobile-sidebar";

export const Navbar = () => {
    return (
        <div className="shadow-sm p-4 border-b h-full flex items-center bg-white">
            <MobileSidebar />

            <NavbarRoutes />
        </div>
    );
};
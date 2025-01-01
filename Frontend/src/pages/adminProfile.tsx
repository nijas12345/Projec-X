import LeftNavBar from "../components/user-left-nav";
import ProfileSidebar from "../components/profile-mid-nav";
import RightProfileComponent from "../components/right-profile.nav";
import ProfileDetails from "../components/profileDetails";
import { useSelector } from "react-redux";
import { RootState } from "../redux/RootState/RootState";
import { AdminData } from "../apiTypes/apiTypes";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import AdminProfileDetails from "../components/adminProfileDetails";
import AdminLeftNavBar from "../components/admin-left-nav";
import AdminProfileSidebar from "../components/admin-profile-mid-nav";

export default function AdminProfile() {
  const navigate = useNavigate();
  const adminInfo = useSelector(
    (state: RootState): AdminData | null => state.adminAuth.adminInfo
  );
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    if (adminInfo) {
      navigate("/admin/profile");
    } else {
      navigate("/admin/login");
    }
  }, [adminInfo, navigate]);

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        {/* Hamburger menu for smaller screens */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="absolute top-8 left-1 rounded-md focus:outline-none hover:bg-gray-200"
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6 text-gray-700" />
            ) : (
              <Bars3Icon className="h-6 w-6 text-gray-700" />
            )}
          </button>

          {/* LeftNavBar appearing when menu is open */}
          {isMenuOpen && (
            <div
              className="absolute top-14  bg-white shadow-lg w-40 z-10"
              onClick={() => setIsMenuOpen(false)} // Close the menu when clicking anywhere
            >
              <AdminLeftNavBar />
            </div>
          )}
        </div>

        {/* Desktop LeftNavBar */}
        <div className="hidden md:block w-[4.5%]">
          <AdminLeftNavBar />
        </div>

        {/* ProfileSidebar */}
        <div className="w-[22%] bg-[#EDEDFF]">
          <AdminProfileSidebar />
        </div>

        {/* RightComponent */}
        <div className="flex-1 bg-[#EDEDFF]">
          <RightProfileComponent />
          <AdminProfileDetails adminInfo={adminInfo} />
        </div>
      </div>
    </>
  );
}

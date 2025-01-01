import LeftNavBar from "../components/user-left-nav";
import ProfileSidebar from "../components/profile-mid-nav";
import RightProfileComponent from "../components/right-profile.nav";
import ProfileDetails from "../components/profileDetails";
import { useSelector } from "react-redux";
import { RootState } from "../redux/RootState/RootState";
import { UserData } from "../apiTypes/apiTypes";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";

export default function Profile() {
  const navigate = useNavigate();
  const userInfo = useSelector(
    (state: RootState): UserData | null => state.userAuth.userInfo
  );
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    if (userInfo) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
  }, [userInfo, navigate]);

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
              <LeftNavBar />
            </div>
          )}
        </div>

        {/* Desktop LeftNavBar */}
        <div className="hidden md:block w-[4.5%]">
          <LeftNavBar />
        </div>

        {/* ProfileSidebar */}
        <div className="w-[22%] bg-[#EDEDFF]">
          <ProfileSidebar />
        </div>

        {/* RightComponent */}
        <div className="flex-1 bg-[#EDEDFF]">
          <RightProfileComponent />
          <ProfileDetails userInfo={userInfo} />
        </div>
      </div>
    </>
  );
}

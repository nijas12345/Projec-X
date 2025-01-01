import React, { useState } from "react";
import { Camera, X } from "lucide-react";
import api from "../utils/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/RootState/RootState";
import { AdminData } from "../apiTypes/apiTypes";
import { updateAdminProfileImage } from "../redux/Slices/AdminAuth";

const AdminProfileSidebar: React.FC = () => {
  const dispatch = useDispatch();
  const adminInfo = useSelector(
    (state: RootState): AdminData | null => state.adminAuth.adminInfo
  );
  const [profileImage, setProfileImage] = useState<string | null>(
    adminInfo?.profileImage || null
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));

      const formData = new FormData();
      formData.append("profileImage", file);

      try {
        const response = await api.post(
          "/admin/upload-profile-image",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        if (response.status === 200) {
          const image = response.data;
          console.log(image);

          dispatch(updateAdminProfileImage(image));
          setProfileImage(image);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col items-center p-4 lg:h-[99vh] lg:w-64">
      <div className="bg-[#EDEDFF] rounded-sm p-3 w-full mb-4 lg:w-full text-center">
        <h1 className="text-black text-lg font-semibold">Profile</h1>
      </div>

      <div className="flex flex-col items-center w-full lg:w-auto">
        <div className="relative w-20 h-20 lg:w-28 lg:h-28 mb-4 rounded-full border-4 border-blue-900">
          <img
            src={profileImage || "/images/placeholder.jpg"}
            alt="Profile"
            className="w-full h-full rounded-full object-cover cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          />
          <label
            htmlFor="imageUpload"
            className="absolute bottom-0 right-0 bg-white rounded-full p-1 border cursor-pointer"
          >
            <Camera className="w-4 h-4 text-gray-600" />
          </label>
        </div>

        <div className="text-center">
          <h1 className="text-lg font-semibold">
            {adminInfo?.firstName?.toUpperCase()}{" "}
            {adminInfo?.lastName?.toUpperCase()}
          </h1>
          <h2 className="text-sm text-gray-500">
            {adminInfo?.position?.toUpperCase()}
          </h2>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 p-4">
          <div className="bg-white p-6 rounded-lg relative w-full max-w-md overflow-hidden max-h-[80vh]">
            <button
              className="absolute top-2 right-2 text-gray-600"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex justify-center items-center h-[60vh] overflow-hidden">
              <img
                src={profileImage || "/images/placeholder.jpg"}
                alt="Profile Large"
                className="object-contain max-w-full max-h-full"
              />
            </div>
            <label
              htmlFor="imageUploadModal"
              className="block px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer text-center mt-4"
            >
              Change Image
            </label>
            <input
              id="imageUploadModal"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfileSidebar;

import React from "react";
import { Bell } from "lucide-react";
const RightProfileComponent: React.FC = () => {
  return (
    <div className="bg-[#EDEDFF] rounded-sm p-4 mb-4 flex items-center">
      {/* Notification Icon at the Right End */}
      <button className="ml-auto text-black-600">
        <Bell className="h-6 w-6" />
      </button>
    </div>
  );
};

export default RightProfileComponent;

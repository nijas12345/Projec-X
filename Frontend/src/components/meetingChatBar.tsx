import React, { useState } from "react";
import { MeetingBarProps, Project } from "../apiTypes/apiTypes";
import "../css/tailwind.css";

const MeetingChatbar: React.FC<MeetingBarProps> = ({
  projects,
  setSelectedProject,
  onProjectSelect,
}) => {
  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    onProjectSelect(project);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Sidebar - Scrollable */}
      <div className="bg-white shadow rounded-sm p-4 mb-4">
        <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center justify-center">
          Group Video Call
        </button>
      </div>
      <div className="flex-1 bg-white rounded-lg p-4  overflow-y-auto reduce-scrollbar ">
        <h2 className="text-lg font-semibold mb-4">All Projects</h2>
        <ul className="space-y-4">
          {projects.map((project, index) => (
            <li
              key={index}
              className="p-4 shadow rounded-lg hover:shadow-lg transition-shadow duration-300 flex items-center cursor-pointer"
              onClick={(e) => {
                e.preventDefault(); // optional: prevent default behavior
                handleProjectClick(project);
              }}
            >
              <div>
                <h3 className="font-medium">{project.name}</h3>
                <p className="text-sm text-gray-500">{project.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MeetingChatbar;

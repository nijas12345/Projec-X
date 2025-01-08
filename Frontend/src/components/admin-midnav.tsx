import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import api from "../utils/axiosInstance";
import { toast } from "react-toastify";
import {
  Project,
  ProjectSidebarProps,
  AdminData,
} from "../apiTypes/apiTypes";
import { useSelector } from "react-redux";
import { RootState } from "../redux/RootState/RootState";
import { TrashIcon } from "lucide-react";
import { showProjectDeleteConfirmation } from "../utils/swalUtils";

const AdminProjectSidebar: React.FC<ProjectSidebarProps> = ({
  initialProjects = [], 
}) => {
  const adminInfo = useSelector(
    (state: RootState): AdminData | null => state.adminAuth.adminInfo
  );
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<
    "create" | "view" | "createCompany"
  >("create");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState<string>("");
  const [newProjectDescription, setNewProjectDescription] =
    useState<string>("");
  const [newProjectMembers, setNewProjectMembers] = useState<string>("");
  const [nameError, setNameError] = useState<string>("");
  const [descriptionError, setDescriptionError] = useState<string>("");
  const [membersError, setMembersError] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get("/admin/get-projects");
        if (response.data !== null) {
          setProjects(response.data);
        }
      } catch (error) {
        console.log(error, "failed to load projects");
      }
    };
    fetchProjects();
  }, []);
  const handleDeleteProject = async (projectId: string) => {
    try {
      const isConfirm = await showProjectDeleteConfirmation();
      if (isConfirm) {
        const response = await api.put("/admin/delete-project", {
          projectId: projectId,
        });
        if (response.status == 200) {
          toast.success("Project deleted successfully!");
          setProjects(response.data);
          setIsModalOpen(!isModalOpen);
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const toggleModal = (mode: "create" | "view", project?: Project) => {
    setIsModalOpen(true);
    setModalMode(mode);

    if (mode === "view" && project) {
      // Set project details for viewing/editing
      setSelectedProject(project);
      setSelectedId(project._id);
      setNewProjectName(project.name);
      setNewProjectDescription(project.description);
      setNewProjectMembers(
        project.members
          .filter((member) => member.role === "Member")
          .map((member) => member.email)
          .join(", ")
      );
      setNameError("");
      setDescriptionError("");
      setMembersError("");
    } else {
      // Reset fields for creating a project
      setNewProjectName("");
      setNewProjectDescription("");
      setNewProjectMembers("");
      setNameError("");
      setDescriptionError("");
      setMembersError("");
    }
  };

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleCreateOrUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[\w\s]+$/.test(newProjectName) || /^\s/.test(newProjectName)) {
      toast.error(
        "Project name must contain only letters, numbers, and spaces, and cannot start with a space."
      );
      return;
    }
    
    if (!/[a-zA-Z]/.test(newProjectDescription) || /^\s/.test(newProjectDescription)) {
      toast.error(
        "Project description must contain at least one alphabet character and cannot start with a space."
      );
      return;
    }
    
    
    const membersArray = newProjectMembers.split(",").map((member) => member.trim());
    for (let member of membersArray) {
      if (!validateEmail(member)) {
        toast.error(`Invalid email format: ${member}`);
        return;
      }
    }
    const projectData: Project = {
      _id: selectedProject ? selectedProject._id : "",
      name: newProjectName,
      description: newProjectDescription,
      members: membersArray.map((email) => ({ email, role: "Member" })),
    };

    try {
      if (modalMode === "create") {
        const response = await api.post("/admin/create-project", projectData, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.status === 200) {
          const createdProject = response.data;
          setProjects((prev) => [createdProject, ...prev]);
          toast.success("Project created successfully!");
        }
      } else if (modalMode === "view" && selectedProject) {
        const response = await api.put(`admin/update-project`, projectData, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.status === 200) {
          console.log(response);
          const updatedProject = response.data;
          console.log("akdsjf", updatedProject);
          setProjects(updatedProject);
          toast.success("Project updated successfully!");
        }
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.log(error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header Section */}
      <div className="bg-white shadow rounded-sm p-4 mb-4">
        <button
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center justify-center"
          onClick={() => toggleModal("create")}
        >
          <Plus className="mr-2 h-5 w-5" />
          Create a Project
        </button>
      </div>

      {/* Project List Section */}
      <div className="flex-1 bg-white rounded-lg p-4 overflow-y-auto reduce-scrollbar">
        <h2 className="text-lg font-semibold mb-4">All Projects</h2>
        {projects && projects.length > 0 ? (
          projects
            .filter((project) => project && project._id) // Ensure only valid projects are rendered
            .map((project) => (
              <div
                key={project._id}
                className="p-4 shadow rounded-md hover:shadow-lg  cursor-pointer"
                onClick={() => toggleModal("view", project)}
              >
                <h4 className="text-lg font-semibold">
                  {project?.name || "Unnamed Project"}
                </h4>
                <p className="text-sm text-gray-500 italic">
                  {project?.description || "No description available"}
                </p>
              </div>
            ))
        ) : (
          <p className="text-gray-500 text-center mt-4">
            No projects available
          </p>
        )}
      </div>
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-4 sm:p-4 w-full max-w-lg sm:max-w-md mb-20 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold mb-4">
                {modalMode === "create"
                  ? "Create New Project"
                  : "Edit Project Details"}
              </h3>

              {modalMode === "view" && (
                <button
                  onClick={() => handleDeleteProject(selectedId)}
                  className="text-sm text-red-600 hover:underline mb-3"
                >
                  <TrashIcon className="text-color-red" />
                </button>
              )}
            </div>

            <form onSubmit={handleCreateOrUpdateProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Project Name
                </label>
                {nameError && <p className="text-red-500 mb-1">{nameError}</p>}
                <input
                  type="text"
                  className={`border rounded-md w-full px-2 py-1 ${
                    nameError ? "border-red-500" : ""
                  }`}
                  value={newProjectName}
                  onChange={(e) => {
                    setNewProjectName(e.target.value);
                    setNameError("");
                  }}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                {descriptionError && (
                  <p className="text-red-500 mb-1">{descriptionError}</p>
                )}
                <textarea
                  className={`border rounded-md w-full px-2 py-1 ${
                    descriptionError ? "border-red-500" : ""
                  }`}
                  rows={3}
                  value={newProjectDescription}
                  onChange={(e) => {
                    setNewProjectDescription(e.target.value);
                    setDescriptionError("");
                  }}
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Members (comma-separated)
                </label>
                {membersError && (
                  <p className="text-red-500 mb-1">{membersError}</p>
                )}
                <input
                  type="text"
                  className={`border rounded-md w-full px-2 py-1 ${
                    membersError ? "border-red-500" : ""
                  }`}
                  value={newProjectMembers}
                  onChange={(e) => {
                    setNewProjectMembers(e.target.value);
                    setMembersError("");
                  }}
                  placeholder="e.g., john@example.com, jane@example.com"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-2 px-4 py-2 bg-gray-300 rounded-md"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                >
                  {modalMode === "create" ? "Create" : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProjectSidebar;

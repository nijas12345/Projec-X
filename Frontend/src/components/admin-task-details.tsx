import React, { ChangeEvent, useState, useRef, useEffect } from "react";
import {
  ChevronRight,
  Plus,
  Search,
  CloudIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  TrashIcon,
} from "lucide-react";
import api from "../utils/axiosInstance";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../redux/RootState/RootState";
import {
  Project,
  Task,
  Member,
  AdminData,
  Comments,
} from "../apiTypes/apiTypes";
import { DashBoardProps } from "../apiTypes/apiTypes";
import { showDeleteConfirmation } from "../utils/swalUtils";

const AdminTaskDetails: React.FC<DashBoardProps> = ({ socket }) => {
  const [file, setFile] = useState<File | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [taskName, setTaskName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [assignees, setAssignees] = useState<Member[]>([]);
  const [assigny, setAssigny] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Reference to the file input
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [inProgressTasks, setInProgressTasks] = useState<Task[]>([]);
  const [doneTasks, setDoneTasks] = useState<Task[]>([]);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [task, setTask] = useState<Task | null>(null);
  const [id, setId] = useState<string>("");
  const adminInfo = useSelector(
    (state: RootState): AdminData | null => state.adminAuth.adminInfo
  );
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [comments, setComments] = useState<Comments[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleTaskDeleteComment = async (id: string | undefined) => {
    const isConfirmed = await showDeleteConfirmation();

    if (isConfirmed && id) {
      const response = await api.patch("/admin/delete-comment", {
        id,
      });
      if (response.status == 200) {
        setTask(response.data);
      }
    }
    try {
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    const projectId = selectedProject;
    const response = await api.get(
      `/admin/search?query=${value}&projectId=${projectId}`
    );
    if (response.status == 200) {
      let allTasks = response.data;
      console.log("all", allTasks);
      const pending: Task[] = allTasks.filter(
        (task: Task) => task.status === "pending"
      );
      const inProgress: Task[] = allTasks.filter(
        (task: Task) => task.status === "inProgress"
      );
      const done: Task[] = allTasks.filter(
        (task: Task) => task.status === "completed"
      );
      setPendingTasks(pending);
      setInProgressTasks(inProgress);
      setDoneTasks(done);
    }
  };
  const handleAddComment = () => {
    if (newComment.trim() && adminInfo) {
      setComments((prevComments) => [
        ...prevComments,
        {
          user: adminInfo?.firstName,
          text: newComment,
          createdAt: new Date(),
        },
      ]);
      setNewComment("");
    }
  };
  const handleAddEditComment = async (taskId: string | undefined) => {
    if (newComment.trim() && adminInfo && taskId) {
      const commentData: Comments = {
        user: adminInfo.firstName,
        text: newComment,
        createdAt: new Date(),
      };
      const response = await api.post("/admin/add-comment", {
        taskId,
        commentData,
      });
      try {
        if (response.status == 200) {
          setTask(response.data);
          setNewComment("");
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleDeleteComment = async (index: number) => {
    const isConfirmed = await showDeleteConfirmation();
    if (isConfirmed) {
      setComments((prevComments) => prevComments.filter((_, i) => i !== index));
    }
  };
  const fetchTasksForProject = async (projectId: string | null) => {
    try {
      const requestBody = projectId ? { projectId } : {};
      const response = await api.put(`/admin/tasks`, requestBody);
      let allTasks = response.data;
      const pending: Task[] = allTasks.filter(
        (task: Task) => task.status === "pending"
      );
      const inProgress: Task[] = allTasks.filter(
        (task: Task) => task.status === "inProgress"
      );
      const done: Task[] = allTasks.filter(
        (task: Task) => task.status === "completed"
      );
      setPendingTasks(pending);
      setInProgressTasks(inProgress);
      setDoneTasks(done);
    } catch (error) {
      console.error("Error fetching tasks", error);
      setPendingTasks([]);
      setInProgressTasks([]);
      setDoneTasks([]);
    }
  };
  useEffect(() => {
    fetchTasksForProject(selectedProject);
    fetchProjects();
  }, [selectedProject]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
    }
  };

  const toggleModal = () => {
    setModalOpen((prev) => !prev);
    setFile(null);
    setDescription("");
    setTaskName("");
    setAssigny("");
    setSelectedProject(null);
    setDeadline(null);
  };

  useEffect(() => {
    if (isModalOpen) {
      fetchProjects();
    }
  }, [isModalOpen]);
  useEffect(() => {
    if (isTaskModalOpen) {
      if (task) {
        fetchProjects();
        fetchProjectMembers(task.projectId);
      }
    }
  }, [isTaskModalOpen]);
  const fetchProjects = async () => {
    try {
      const projectRes = await api.get("/admin/get-projects", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setProjects(projectRes.data);
    } catch (error) {
      console.error("Error fetching Projects", error);
    }
  };

  const fetchProjectMembers = async (projectId: string) => {
    try {
      if (projectId == "unassigned" || projectId == "reassigned") return;
      const res = await api.get("/admin/project-members", {
        params: { projectId },
      });
      const data: Member[] = await res.data;
      setAssignees(data);
    } catch (error) {
      console.error("Error fetching project members:", error);
    }
  };
  const handleProjectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const projectId = event.target.value;
    console.log("projectId", projectId);

    setSelectedProject(projectId);
    fetchProjectMembers(projectId);
  };
  const handleMembersChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const email = event.target.value;
    setAssigny(email);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default form submission behavior
    if (!taskName || /^\s/.test(taskName) || !description || /^\s/.test(description)) {
      toast.error("Please fill in all required fields and ensure task name and description do not start with a space.");
      return;
    }
    if(!selectedProject || !assigny){
      toast.error("Please fill all required fields")
      return;
    }
    
    const currentDate = new Date();
    if (deadline) {
      if (deadline <= currentDate) {
        toast.error("The deadline must be a future date.");
        return;
      }
    }
    const taskDetails = {
      taskName,
      description,
      deadline,
      assigny,
      selectedProject,
      file,
      comments,
    };

    try {
      const response = await api.post("/admin/create-task", taskDetails, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const task: Task = response.data; // Assuming the response structure has 'task' in data
      setPendingTasks((prevTasks) => [...prevTasks, task]);

      if (response.status == 200) {
        setTaskName("");
        setDescription("");
        setDeadline(null);
        setFile(null);
        setNewComment("");
        setCommentsVisible(false);
        setComments([]);
        setModalOpen(false);
        if (socket) {
          const notificationDetails = {
            taskId: task._id,
            admin_id: adminInfo?.admin_id,
          };
          console.log("notification", notificationDetails);
          socket.emit("sendNotification", notificationDetails);
          setSelectedProject("unassigned");
        }
      }
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };
  const deleteTask = async (event: any, taskId: string) => {
    event.preventDefault();
    try {
      const confirmed = await showDeleteConfirmation();
      if (confirmed) {
        const response = await api.patch("/admin/delete-task", { taskId });
        const updateTasks = (taskId: string) => (prevTasks: Task[]) =>
          prevTasks.filter((task) => task._id !== taskId);

        setPendingTasks(updateTasks(taskId));
        setInProgressTasks(updateTasks(taskId));
        setDoneTasks(updateTasks(taskId));
        toast.success("Task Deleted Successfully");
        setIsTaskModalOpen(false);
      }
    } catch (error) {
      const confirmed = await showDeleteConfirmation();
      console.error("Error deleting task:", error);
      toast.error("Error!, There was an error deleting the task.");
    }
  };
  const editSubmit = async (event: any) => {
    event.preventDefault();
    if (
      !taskName ||
      !description ||
      !selectedProject ||
      !assigny ||
      !deadline
    ) {
      alert("Please fill in all required fields.");
      return;
    }
    const taskDetails = {
      taskName,
      description,
      deadline,
      assigny,
      selectedProject,
      file,
      id,
    };
    const response = await api.patch("/admin/edit-task", taskDetails, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    if (response.status == 200) {
      try {
        const updatedTaskFromResponse: Task = response.data;
        console.log("updatedTaskFromResponse", updatedTaskFromResponse);

        setPendingTasks((prevTasks) =>
          prevTasks.filter((task) => task._id !== updatedTaskFromResponse._id)
        );
        setInProgressTasks((prevTasks) =>
          prevTasks.filter((task) => task._id !== updatedTaskFromResponse._id)
        );
        setDoneTasks((prevTasks) =>
          prevTasks.filter((task) => task._id !== updatedTaskFromResponse._id)
        );

        if (updatedTaskFromResponse.status === "pending") {
          setPendingTasks((prevTasks) => [
            ...prevTasks,
            updatedTaskFromResponse,
          ]);
        } else if (updatedTaskFromResponse.status === "inProgress") {
          setInProgressTasks((prevTasks) => [
            ...prevTasks,
            updatedTaskFromResponse,
          ]);
        } else if (updatedTaskFromResponse.status === "completed") {
          setDoneTasks((prevTasks) => [...prevTasks, updatedTaskFromResponse]);
        }
        setIsTaskModalOpen(false);
        setAssigny("");
        setDeadline(null);
        setDescription("");
        setTaskName("");
        setSelectedProject(null);
      } catch (error) {
        console.log(error);
      }
    }
  };
  const handleTask = (task: any) => {
    setTaskName(task.taskName || "");
    setDescription(task.description || "");
    setDeadline(task.deadline ? new Date(task.deadline) : null); // Initialize deadline as a Date object
    setSelectedProject(task.projectId || "");
    setAssigny(task.member || "");
    setFile(task.taskImage);
    setTask(task);
    setIsTaskModalOpen(true);
    setId(task._id);
  };

  return (
    <div className="flex flex-col w-full min-h-screen p-4 space-y-4 bg-white rounded-xl lg:ml-0 ml-10">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <span className="text-lg text-color font-medium">All Projects</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-lg font-medium">Tasks</span>
          <select
            className="w-full rounded-lg border-gray-300 shadow-sm"
            value={selectedProject || ""}
            onChange={handleProjectChange}
          >
            <option value="">Active</option>
            <option value="unassigned">Un-Assigned</option>
            <option value="reassigned">Re-Assigned</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              className="pl-10 w-[300px] rounded-full"
              placeholder="Search"
              type="search"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <button
            className="rounded-full bg-primary p-2 flex items-center"
            onClick={toggleModal}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </button>
        </div>
      </header>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={toggleModal}
        >
          <div
            className="bg-white h-[90%] w-[90%] max-w-3xl p-6 rounded shadow-lg relative overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2 className="text-xl font-medium mb-6">Create New Task</h2>
            </div>
            <div className="p-3 space-y-6 overflow-y-auto flex-1">
              <form className="space-y-6">
                {/* Task Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="taskName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Task Name
                    </label>
                    <input
                      id="taskName"
                      value={taskName}
                      onChange={(e) => setTaskName(e.target.value)}
                      placeholder="Enter task name"
                      className="w-full rounded-lg border-gray-300 shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Description
                    </label>
                    <input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter description"
                      className="w-full rounded-lg border-gray-300 shadow-sm"
                    />
                  </div>
                </div>

                {/* Deadline, Project, Members */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2 relative">
                    <label className="block text-sm font-medium text-gray-700">
                      Deadline
                    </label>
                    <DatePicker
                      selected={deadline}
                      onChange={(date) => setDeadline(date)}
                      dateFormat="yyyy/MM/dd"
                      className="w-full rounded-lg border-gray-300 shadow-sm"
                      placeholderText="Select a deadline"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Project
                    </label>
                    <select
                      className="w-full rounded-lg border-gray-300 shadow-sm"
                      value={selectedProject || ""}
                      onChange={handleProjectChange}
                    >
                      <option value="">Select a project</option>
                      {projects.map((project) => (
                        <option key={project._id} value={project._id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Members
                    </label>
                    <select
                      className="w-full rounded-lg border-gray-300 shadow-sm"
                      value={assigny || ""}
                      onChange={handleMembersChange}
                    >
                      <option value="" disabled>
                        Select a Member
                      </option>
                      {assignees.map((assignee) => (
                        <option key={assignee.email || assignee._id}>
                          {assignee.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Upload Attachments */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Upload Attachments
                  </label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      {!file ? (
                        <>
                          <CloudIcon className="h-12 w-12 text-gray-400" />
                          <p className="text-sm text-gray-500">
                            Media or PDF file max 25 mb.
                          </p>
                          <button
                            type="button"
                            onClick={handleFileSelect}
                            className="mt-2 text-primary hover:text-primary hover:bg-primary/5 border border-primary rounded-full py-2 px-4"
                          >
                            Choose
                          </button>
                        </>
                      ) : (
                        <div className="mt-4">
                          {file.type.startsWith("image/") && (
                            <img
                              src={URL.createObjectURL(file)}
                              alt="Preview"
                              className="mt-2 w-32 h-32 object-cover rounded"
                            />
                          )}
                          <button
                            type="button"
                            onClick={handleFileSelect}
                            className="mt-2 text-primary hover:text-primary hover:bg-primary/5 border border-primary rounded-full py-2 px-4"
                          >
                            Choose
                          </button>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf, .jpg, .jpeg, .png, .gif, .bmp"
                      />
                    </div>
                  </div>
                </div>

                {/* Comment Section */}
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setCommentsVisible(!commentsVisible)}
                    className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-lg shadow-md flex justify-between items-center"
                  >
                    <span>Comments</span>
                    {commentsVisible ? (
                      <ChevronUpIcon className="h-5 w-5" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5" />
                    )}
                  </button>

                  {commentsVisible && (
                    <div className="mt-4 space-y-4">
                      {comments.map((comment, index) => (
                        <div
                          key={index}
                          className="border rounded-lg p-4 bg-gray-50 shadow-sm relative"
                        >
                          <p className="text-sm text-gray-600 mt-1">
                            {comment.text}
                          </p>
                          <p className="text-xs text-gray-400 mt-1 text-right">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                          {/* Delete icon */}
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(index)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                          >
                            <TrashIcon className="h-5 w-5 text-red-500" />
                          </button>
                        </div>
                      ))}

                      {/* Add Comment Input */}
                      <div className="relative">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Write a comment..."
                          className="w-full rounded-lg border border-gray-300 shadow-sm p-2 pr-16"
                        />

                        <button
                          type="button"
                          onClick={handleAddComment}
                          className="absolute top-1/2 right-2 -translate-y-1/2 bg-[#5453AB] text-white px-4 py-1 rounded-md shadow hover:bg-primary/90"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    className="w-24 py-2 px-4 border rounded-md text-gray-700 hover:bg-gray-100"
                    onClick={toggleModal}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    type="submit"
                    className="w-40 bg-primary text-white border bg-[#5453AB] hover:bg-primary/90 py-2 px-4 rounded-md"
                  >
                    Create New Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isTaskModalOpen && task && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="bg-white h-[90%] w-[90%] max-w-3xl p-6 rounded shadow-lg relative overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2 className="text-xl font-medium mb-6">Update Task</h2>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="taskName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Task Name
                    </label>
                    <input
                      id="taskName"
                      value={taskName}
                      onChange={(e) => setTaskName(e.target.value)}
                      placeholder="Enter task name"
                      className="w-full rounded-lg border-gray-300 shadow-sm"
                    />
                  </div>
                  <input
                    hidden
                    id="description"
                    value={task._id} // Task ID (hidden)
                  />
                  <div className="space-y-2">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Description
                    </label>
                    <input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter description"
                      className="w-full rounded-lg border-gray-300 shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2 relative">
                    <label className="block text-sm font-medium text-gray-700">
                      Deadline
                    </label>
                    <DatePicker
                      selected={deadline}
                      onChange={(date) => setDeadline(date)}
                      dateFormat="yyyy/MM/dd"
                      className="w-full rounded-lg border-gray-300 shadow-sm"
                      placeholderText="Select a deadline"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Project
                    </label>
                    <select
                      className="w-full rounded-lg border-gray-300 shadow-sm"
                      value={selectedProject || ""}
                      onChange={handleProjectChange}
                    >
                      <option value="" disabled>
                        Select a Project
                      </option>
                      {projects.map((project) => (
                        <option key={project._id} value={project._id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Members
                    </label>
                    <select
                      className="w-full rounded-lg border-gray-300 shadow-sm"
                      value={assigny || ""}
                      onChange={handleMembersChange}
                    >
                      <option value="" disabled>
                        Select a member
                      </option>
                      {assignees.map((assignee) => (
                        <option key={assignee.email || assignee.email}>
                          {assignee.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Upload Attachments
                  </label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <div className="mt-4 flex flex-col items-center gap-4">
                      {file && file.type ? (
                        file.type.startsWith("image/") ? (
                          <img
                            src={URL.createObjectURL(file)} // Preview the newly selected file
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded"
                          />
                        ) : (
                          <p className="text-sm text-gray-500">
                            Unsupported file type. Please select an image.
                          </p>
                        )
                      ) : task?.taskImage ? (
                        <img
                          src={task.taskImage} // Default to the existing task image
                          alt="Task Preview"
                          className="w-32 h-32 object-cover rounded"
                        />
                      ) : (
                        <p className="text-sm text-gray-500">
                          No image available
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={handleFileSelect}
                        className="py-2 px-4 border rounded-md text-primary hover:bg-primary/5 hover:text-primary"
                      >
                        {file ? "Change Image" : "Choose Image"}
                      </button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".jpg, .jpeg, .png, .gif, .bmp"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setCommentsVisible(!commentsVisible)}
                      className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-lg shadow-md flex justify-between items-center"
                    >
                      <span>Comments</span>
                      {commentsVisible ? (
                        <ChevronUpIcon className="h-5 w-5" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5" />
                      )}
                    </button>

                    {commentsVisible && (
                      <div className="mt-4 space-y-4">
                        {task.comments &&
                          task.comments.map((comment, index) => (
                            <div
                              key={comment._id}
                              className="border rounded-lg p-4 bg-gray-50 shadow-sm relative"
                            >
                              <p className="text-sm text-gray-600 mt-1">
                                {comment.text}
                              </p>
                              <p className="text-xs text-gray-400 mt-1 text-right">
                                {new Date(comment.createdAt).toLocaleString()}
                              </p>
                              {/* Delete icon */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleTaskDeleteComment(comment._id)
                                }
                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                              >
                                <TrashIcon className="h-5 w-5 text-red-500" />
                              </button>
                            </div>
                          ))}

                        {/* Add Comment Input */}
                        <div className="relative">
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="w-full rounded-lg border border-gray-300 shadow-sm p-2 pr-16"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              handleAddEditComment(task._id);
                            }}
                            className="absolute top-1/2 right-2 -translate-y-1/2 bg-[#5453AB] text-white px-4 py-1 rounded-md shadow hover:bg-primary/90"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    className="w-24 py-2 px-4 border rounded-md text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setSelectedProject(null)
                      setIsTaskModalOpen(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="w-24 py-2 px-4 border rounded-md bg-red-500 text-white hover:bg-red-700"
                    onClick={(e) => task._id && deleteTask(e, task._id)}
                  >
                    Delete
                  </button>
                  <button
                    onClick={editSubmit}
                    type="submit"
                    className="w-40 bg-primary text-white border bg-[#5453AB] hover:bg-primary/90 py-2 px-4 rounded-md"
                  >
                    Update Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="h-screen overflow-hidden lg:p-2 p-12">
        <div className="h-full overflow-y-auto p-4">
          <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* TO DO Section */}

            <div className=" bg-[#EDEDFF] space-y-4 rounded-lg">
              <h2 className="text-lg font-medium text-gray-800 px-2 py-2 ">
                TO DO
              </h2>

              {pendingTasks.length > 0 ? (
                <div className="space-y-2 ">
                  {pendingTasks.map(
                    (task, index) =>
                      task && (
                        <div
                          key={task._id}
                          className="p-4 shadow hover:shadow-lg transition-shadow duration-300 border mx-2 my-2 bg-white rounded-md cursor-pointer"
                          onClick={() => {
                            handleTask(task);
                          }}
                        >
                          <div className="p-0 space-y-3">
                            {/* Task Description */}
                            <p className="text-base font-normal">
                              {task.description}
                            </p>

                            {/* Task Name and Date in a Row */}
                            <div className="flex items-center justify-between">
                              {/* Task Name */}
                              <div className="inline-block px-3 py-1 text-sm font-semibold text-white bg-[#5453AB] rounded-full">
                                {task.taskName || ""}
                              </div>

                              {/* Month and Date */}
                              <p className="text-sm text-gray-500">
                                {new Date(task.deadline).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex justify-center items-center p-4 text-gray-500">
                    <p>No pending tasks available</p>
                  </div>
                </div>
              )}
            </div>

            {selectedProject !== "unassigned" &&
              selectedProject !== "reassigned" && (
                <div className="bg-[#EDEDFF] space-y-4 rounded-lg">
                  <h2 className="text-lg font-medium text-gray-800 px-2 py-2">
                    IN PROGRESS
                  </h2>

                  {inProgressTasks.length > 0 ? (
                    <div className="space-y-2">
                      {inProgressTasks.map(
                        (task) =>
                          task && (
                            <div
                              key={task._id}
                              className="p-4 shadow hover:shadow-lg transition-shadow duration-300 border mx-2 my-2 bg-white rounded-md cursor-pointer"
                              onClick={() => {
                                handleTask(task);
                              }}
                            >
                              <div className="p-0 space-y-3">
                                {/* Task Description */}
                                <p className="text-base font-normal">
                                  {task.description}
                                </p>

                                {/* Task Name and Date in a Row */}
                                <div className="flex items-center justify-between">
                                  {/* Task Name */}
                                  <div className="inline-block px-3 py-1 text-sm font-semibold text-white bg-[#5453AB] rounded-full">
                                    {task.taskName || ""}
                                  </div>

                                  {/* Month and Date */}
                                  <p className="text-sm text-gray-500">
                                    {new Date(task.deadline).toLocaleDateString(
                                      "en-US",
                                      {
                                        month: "long",
                                        day: "numeric",
                                      }
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                      )}
                    </div>
                  ) : (
                    <div className="flex justify-center items-center p-4 text-gray-500">
                      <p>No pending tasks available</p>
                    </div>
                  )}
                </div>
              )}

            {selectedProject !== "unassigned" &&
              selectedProject !== "reassigned" && (
                <div className="bg-[#EDEDFF] space-y-4 rounded-lg">
                  <h2 className="text-lg font-medium text-gray-800 px-2 py-2">
                    DONE
                  </h2>

                  {doneTasks.length > 0 ? (
                    <div className="space-y-2">
                      {doneTasks.map(
                        (task) =>
                          task && (
                            <div
                              key={task._id}
                              className="p-4 shadow hover:shadow-lg transition-shadow duration-300 border mx-2 my-2 bg-white rounded-md cursor-pointer"
                              onClick={() => {
                                handleTask(task);
                              }}
                            >
                              <div className="p-0 space-y-3">
                                {/* Task Description */}
                                <p className="text-base font-normal">
                                  {task.description}
                                </p>

                                {/* Task Name and Date in a Row */}
                                <div className="flex items-center justify-between">
                                  {/* Task Name */}
                                  <div className="inline-block px-3 py-1 text-sm font-semibold text-white bg-[#5453AB] rounded-full">
                                    {task.taskName || ""}
                                  </div>

                                  {/* Month and Date */}
                                  <p className="text-sm text-gray-500">
                                    {new Date(task.deadline).toLocaleDateString(
                                      "en-US",
                                      {
                                        month: "long",
                                        day: "numeric",
                                      }
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                      )}
                    </div>
                  ) : (
                    <div className="flex justify-center items-center p-4 text-gray-500">
                      <p>No pending tasks available</p>
                    </div>
                  )}
                </div>
              )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminTaskDetails;

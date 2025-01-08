import React, { ChangeEvent, useState, useRef, useEffect, act } from "react";
import {
  ChevronRight,
  ChevronUpIcon,
  ChevronDownIcon,
  TrashIcon,
} from "lucide-react";
import api from "../utils/axiosInstance";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/RootState/RootState";
import { UserData, Project, Task, Comments } from "../apiTypes/apiTypes";
import { DashBoardProps } from "../apiTypes/apiTypes";
import { useNavigate } from "react-router-dom";
import { userLogout } from "../redux/Slices/UserAuth";
import {
  showDeleteConfirmation,
  showProjectConfirmation,
  AssignByMeConfirmation,
} from "../utils/swalUtils";
import { DraggableTask } from "./draggable-task";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  MouseSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { DragEndEvent } from "@dnd-kit/core";
import useIsSmallScreen from "./taskDetailsCustomhook";
import { DroppableColumn } from "./droppable-column";

const Tasks: React.FC<DashBoardProps> = ({ socket }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isSmallScreen = useIsSmallScreen();
  const [file, setFile] = useState<File | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [inProgressTasks, setInProgressTasks] = useState<Task[]>([]);
  const [doneTasks, setDoneTasks] = useState<Task[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [task, setTask] = useState<Task | null>(null);
  const [status, setStatus] = useState<string>("");
  const userInfo = useSelector(
    (state: RootState): UserData | null => state.userAuth.userInfo
  );
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [newComment, setNewComment] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);

  const handleMouseEnter = () => {
    setHoveredTask("nijas");
  };

  const handleMouseLeave = () => {
    setHoveredTask(null);
  };
  const sensor = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(MouseSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    console.log("dragEnd", event);
    if (selectedProject == "unassigned") return;
    const { active, over } = event;
    console.log("selected", selectedProject);

    if (!over) return;

    const activeTaskId = active.id;
    const overColumnId = over.id;
    const taskName = active.data.current?.taskName as string;
    let newStatus = "";
    if (overColumnId === "pending-column") {
      newStatus = "pending";
    } else if (overColumnId === "in-progress-column") {
      newStatus = "inProgress";
    } else if (overColumnId === "done-column") {
      newStatus = "completed";
    }

    if (newStatus !== "") {
      const updatedTask = { ...active.data.current, status: newStatus };
      setPendingTasks((prevTasks) =>
        prevTasks.filter((task) => task._id !== activeTaskId)
      );
      setInProgressTasks((prevTasks) =>
        prevTasks.filter((task) => task._id !== activeTaskId)
      );
      setDoneTasks((prevTasks) =>
        prevTasks.filter((task) => task._id !== activeTaskId)
      );
      try {
        const response = await api.patch("/update-task-status", {
          taskId: activeTaskId,
          projectId: selectedProject,
          status: newStatus,
        });
        if (response.status == 200) {
          const allTasks = response.data;
          console.log("alltasks", allTasks);

          const pending: Task[] = allTasks.filter(
            (task: any) => task.status === "pending"
          );
          const inProgress: Task[] = allTasks.filter(
            (task: any) => task.status === "inProgress"
          );
          const done: Task[] = allTasks.filter(
            (task: any) => task.status === "completed"
          );
          setPendingTasks(pending);
          setInProgressTasks(inProgress);
          setDoneTasks(done);
          if (socket) {
            const notificationDetails = {
              taskId: activeTaskId,
              assignedUserId: userInfo?.user_id,
              message: `${userInfo?.email} has updated the status of the task "${taskName}" to "${newStatus}`,
            };
            console.log("notification", notificationDetails);
            socket.emit("userSendNotification", notificationDetails);
          }
        }
      } catch (error: any) {
        console.log(error);
        if (error.response.data.message == "Access denied. User is blocked.") {
          toast.error(error.response.data.message);
          setTimeout(() => {
            navigate("/login");
            dispatch(userLogout());
          }, 3000);
        }
      }
    }
  };

  const handleTaskStatusChange = async (
    taskId: string,
    taskName: string,
    newStatus: string
  ) => {
    try {
      if (selectedProject === "unassigned") return;

      const updatedTask = { taskId, taskName, status: newStatus };

      setPendingTasks((prevTasks) =>
        prevTasks.filter((task) => task._id !== taskId)
      );
      setInProgressTasks((prevTasks) =>
        prevTasks.filter((task) => task._id !== taskId)
      );
      setDoneTasks((prevTasks) =>
        prevTasks.filter((task) => task._id !== taskId)
      );

      // Make the API call to update the task status on the backend
      const response = await api.patch("/update-task-status", {
        taskId: taskId,
        projectId: selectedProject,
        status: newStatus,
      });

      if (response.status === 200) {
        const allTasks = response.data;
        console.log("allTasks", allTasks);

        const pending: Task[] = allTasks.filter(
          (task: any) => task.status === "pending"
        );
        const inProgress: Task[] = allTasks.filter(
          (task: any) => task.status === "inProgress"
        );
        const done: Task[] = allTasks.filter(
          (task: any) => task.status === "completed"
        );

        setPendingTasks(pending);
        setInProgressTasks(inProgress);
        setDoneTasks(done);

        if (socket) {
          const taskName = updatedTask.taskName; // Assuming taskName is part of the task object
          const notificationDetails = {
            taskId: taskId,
            assignedUserId: userInfo?.user_id,
            message: `${userInfo?.email} has updated the status of the task "${taskName}" to "${newStatus}"`,
          };
          console.log("notification", notificationDetails);
          socket.emit("userSendNotification", notificationDetails);
        }
      }
    } catch (error: any) {
      console.log(error);

      // Handle specific error for blocked user
      if (error.response?.data?.message === "Access denied. User is blocked.") {
        toast.error(error.response.data.message);
        setTimeout(() => {
          navigate("/login");
          dispatch(userLogout());
        }, 3000);
      }
    }
  };

  const handleAcceptanceStatus = async (acceptanceStatus: string) => {
    if (acceptanceStatus == "projectManager") {
      const isConfirm = await showProjectConfirmation();
      if (isConfirm) {
        const taskId = task?._id;
        const response = await api.put("/acceptance-status", {
          taskId,
          acceptanceStatus: "reAssigned",
        });
        try {
          if (response.status == 200) {
            if (socket) {
              const notificationDetails = {
                taskId: task?._id,
                assignedUserId: userInfo?.user_id,
                message: `${userInfo?.email}  re-assigned the "${task?.taskName} to you.`,
              };
              console.log("notification", notificationDetails);
              socket.emit("userSendNotification", notificationDetails);
            }
            toast.success(
              "You are successfully re-assigned to the Project Manager"
            );
            fetchTasks("unAssigned");
            setTimeout(() => {}, 2000);
            setIsTaskModalOpen(false);
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
    if (acceptanceStatus == "me") {
      const isConfirm = await AssignByMeConfirmation();
      if (isConfirm) {
        const taskId = task?._id;
        const response = await api.put("/acceptance-status", {
          taskId,
          acceptanceStatus: "active",
        });
        try {
          if (response.status == 200) {
            toast.success("You are successfully assigned to yourself");
            if (socket) {
              const notificationDetails = {
                taskId: task?._id,
                assignedUserId: userInfo?.user_id,
                message: `${userInfo?.email}  assigned the ${task?.taskName}`,
              };
              console.log("notification", notificationDetails);
              socket.emit("userSendNotification", notificationDetails);
            }
            fetchTasks(selectedProject);
            setTimeout(() => {}, 2000);
            setIsTaskModalOpen(false);
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  };
  const handleTask = (task: Task) => {
    console.log(task);
    setTask(task);
    setStatus(task.status);
    setIsTaskModalOpen(true);
  };
  const handleTaskDeleteComment = async (id: string | undefined) => {
    const isConfirmed = await showDeleteConfirmation();
    if (isConfirmed && id) {
      const response = await api.patch("/delete-comment", {
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
  const handleAddEditComment = async (taskId: string | undefined) => {
    if (newComment.trim() && userInfo && taskId) {
      const commentData: Comments = {
        user: userInfo.firstName,
        text: newComment,
        createdAt: new Date(),
      };
      const response = await api.post("/add-comment", {
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
  const fetchTasks = async (projectId: string | null) => {
    try {
      const requestBody = projectId ? { projectId } : {};
      const response = await api.put(`/tasks`, requestBody);
      console.log("response", response.data);

      let allTasks = response.data;
      const pending: Task[] = allTasks.filter(
        (task: any) => task.status === "pending"
      );
      const inProgress: Task[] = allTasks.filter(
        (task: any) => task.status === "inProgress"
      );
      const done: Task[] = allTasks.filter(
        (task: any) => task.status === "completed"
      );
      setPendingTasks(pending);
      setInProgressTasks(inProgress);
      setDoneTasks(done);
    } catch (error) {
      setPendingTasks([]);
      setInProgressTasks([]);
      setDoneTasks([]);
    }
  };
  useEffect(() => {
    fetchTasks(selectedProject);
    fetchProjects();
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const projectRes = await api.get("/get-projects", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setProjects(projectRes.data);
    } catch (error: any) {
      console.log(error);
      if (error.response.data.message == "Access denied. User is blocked.") {
        toast.error(error.response.data.message);
        setTimeout(() => {
          navigate("/login");
          dispatch(userLogout());
        }, 3000);
      }
    }
  };

  const handleProjectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;

    if (selectedValue === "unassigned") {
      setSelectedProject("unassigned");
    } else {
      setSelectedProject(selectedValue);
    }
  };
  const downloadTaskDetails = async () => {
    if (task?.taskImage) {
      try {
        // Fetch the image data from the URL
        const response = await fetch(task.taskImage);
        if (!response.ok) {
          throw new Error("Image fetch failed");
        }

        const imageBlob = await response.blob();
        console.log(imageBlob);
        const imageLink = document.createElement("a");
        imageLink.href = URL.createObjectURL(imageBlob);
        imageLink.download = `${task?.taskImage.substring(22, 26)}_Image.jpg`;

        document.body.appendChild(imageLink);
        imageLink.click();

        document.body.removeChild(imageLink);
      } catch (error: any) {
        if (error.response.data.message == "Access denied. User is blocked.") {
          toast.error(error.response.data.message);
          setTimeout(() => {
            navigate("/login");
            dispatch(userLogout());
          }, 3000);
        }
      }
    }
  };
  useEffect(() => {
    // Check if taskImage exists, and if it's a valid URL
    if (task?.taskImage && !file) {
      fetch(task.taskImage)
        .then((response) => response.blob())
        .then((blob) => {
          const fileObject = new File([blob], "taskImage.jpg", {
            type: blob.type,
          });
          setFile(fileObject); // Store the fetched file as a File object
        });
    }
  }, [task?.taskImage, file]);

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
            <option value="unassigned">Unassigned</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4"></div>
      </header>

      <div className="h-screen overflow-hidden lg:p-2 p-12">
        {/* Scrollable Content Wrapper */}
        <div className="h-full overflow-y-auto p-4 ">
          <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Conditional rendering for smaller screens */}
            {isSmallScreen ? (
              <>
                {/* TO DO Section */}
                <div className="bg-[#EDEDFF] space-y-4 rounded-lg">
                  <h2 className="text-lg font-medium text-gray-800 px-2 py-2">
                    TO DO
                  </h2>
                  {pendingTasks.length > 0 ? (
                    <div className="space-y-2">
                      {pendingTasks.map((task) => (
                        <div
                          key={task._id}
                          className="bg-white p-2 rounded shadow cursor-pointer"
                          onClick={() => handleTask(task)}
                        >
                          <div className="p-0 space-y-3">
                            <p className="text-base font-normal">
                              {task.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="inline-block px-3 py-1 text-sm font-semibold text-white bg-[#5453AB] rounded-full">
                                {task.taskName || ""}
                              </div>
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
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-center items-center p-4 text-gray-500">
                      <p>No pending tasks available</p>
                    </div>
                  )}
                </div>

                {/* IN PROGRESS Section */}
                <div className="bg-[#EDEDFF] space-y-4 rounded-lg">
                  <h2 className="text-lg font-medium text-gray-800 px-2 py-2">
                    IN PROGRESS
                  </h2>
                  {inProgressTasks.length > 0 ? (
                    <div className="space-y-2">
                      {inProgressTasks.map((task) => (
                        <div
                          key={task._id}
                          className="bg-white p-2 rounded shadow cursor-pointer"
                          onClick={() => handleTask(task)}
                        >
                          <div className="p-0 space-y-3">
                            <p className="text-base font-normal">
                              {task.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="inline-block px-3 py-1 text-sm font-semibold text-white bg-[#5453AB] rounded-full">
                                {task.taskName || ""}
                              </div>
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
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-center items-center p-4 text-gray-500">
                      <p>No in-progress tasks available</p>
                    </div>
                  )}
                </div>

                {/* DONE Section */}
                <div className="bg-[#EDEDFF] space-y-4 rounded-lg">
                  <h2 className="text-lg font-medium text-gray-800 px-2 py-2">
                    DONE
                  </h2>
                  {doneTasks.length > 0 ? (
                    <div className="space-y-2">
                      {doneTasks.map((task) => (
                        <div
                          key={task._id}
                          className="bg-white p-2 rounded shadow cursor-pointer"
                          onClick={() => handleTask(task)}
                        >
                          <div className="p-0 space-y-3">
                            <p className="text-base font-normal">
                              {task.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="inline-block px-3 py-1 text-sm font-semibold text-white bg-[#5453AB] rounded-full">
                                {task.taskName || ""}
                              </div>
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
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-center items-center p-4 text-gray-500">
                      <p>No done tasks available</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Drag-and-Drop context for larger screens
              <DndContext
                sensors={sensor}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                onDragStart={() => setHoveredTask(null)}
              >
                <div className="bg-[#EDEDFF] space-y-4 rounded-lg">
                  <h2 className="text-lg font-medium text-gray-800 px-2 py-2">
                    TO DO
                  </h2>
                  <DroppableColumn columnId="pending-column">
                    {pendingTasks.length > 0 ? (
                      <div className="space-y-2 relative" id="pending-column">
                        {pendingTasks.map((task) => (
                          <DraggableTask
                            key={task._id}
                            onMouseEnter={() => handleMouseEnter()}
                            onMouseLeave={handleMouseLeave}
                            task={task}
                            onClick={() => !isDragging && handleTask(task)}
                          />
                        ))}
                        {hoveredTask !== null && (
                          <div
                            className="absolute bottom-24 left-40  transform -translate-x-1/2 bg-white text-black text-xs p-2 rounded-lg border border-gray-300 shadow-lg z-50"
                            style={{ maxWidth: "200px", fontSize: "0.75rem" }}
                          >
                            Right-click for task details
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex justify-center items-center p-4 text-gray-500">
                        <p>No pending tasks available</p>
                      </div>
                    )}
                  </DroppableColumn>
                </div>

                <DroppableColumn columnId="in-progress-column">
                  {selectedProject !== "unassigned" && (
                    <div className="bg-[#EDEDFF] space-y-4 rounded-lg">
                      <h2 className="text-lg font-medium text-gray-800 px-2 py-2">
                        IN PROGRESS
                      </h2>
                      {inProgressTasks.length > 0 ? (
                        <div
                          className="space-y-2 relative"
                          id="in-progress-column"
                        >
                          {inProgressTasks.map((task) => (
                            <DraggableTask
                              key={task._id}
                              task={task}
                              onClick={() => !isDragging && handleTask(task)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex justify-center items-center p-4 text-gray-500">
                          <p>No in-progress tasks available</p>
                        </div>
                      )}
                    </div>
                  )}
                </DroppableColumn>

                <DroppableColumn columnId="done-column">
                  {selectedProject !== "unassigned" && (
                    <div className="bg-[#EDEDFF] space-y-4 rounded-lg">
                      <h2 className="text-lg font-medium text-gray-800 px-2 py-2">
                        DONE
                      </h2>
                      {doneTasks.length > 0 ? (
                        <div className="space-y-2" id="done-column">
                          {doneTasks.map((task) => (
                            <DraggableTask
                              key={task._id}
                              task={task}
                              onClick={() => !isDragging && handleTask(task)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex justify-center items-center p-4 text-gray-500">
                          <p>No done tasks available</p>
                        </div>
                      )}
                    </div>
                  )}
                </DroppableColumn>
              </DndContext>
            )}
          </main>
        </div>
      </div>

      {isTaskModalOpen && task && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="bg-white h-[90%] w-[90%] max-w-3xl p-6 rounded shadow-lg relative flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-blue-600">
                {task.taskName}
              </h2>
            </div>

            {/* Scrollable Content */}
            <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
              {/* Display Task Image */}
              {task.taskImage && (
                <div className="mb-4">
                  <img
                    src={task.taskImage}
                    alt={`${task.taskName} Image`}
                    className="w-full h-48 object-cover rounded-md"
                  />
                </div>
              )}

              <div className="mb-4">
                <div className="flex flex-wrap justify-between items-start">
                  {task.description && (
                    <div className="flex-1 mr-4">
                      <h3 className="text-lg font-medium text-gray-800">
                        Description:
                      </h3>
                      <p className="text-gray-600 mt-1">{task.description}</p>
                    </div>
                  )}

                  {task.deadline && (
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-800">
                        Deadline:
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {new Date(task.deadline).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label
                  htmlFor="assignedStatus"
                  className="block text-gray-700 font-medium"
                >
                  Assignment Status
                </label>
                {task.acceptanceStatus === "unAssigned" ? (
                  <select
                    id="assignedStatus"
                    className="mt-2 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => handleAcceptanceStatus(e.target.value)}
                  >
                    <option value="unassigned">Unassigned</option>
                    <option value="me">Assigned by Me</option>
                    <option value="projectManager">
                      Reassign to Project Manager
                    </option>
                  </select>
                ) : (
                  <select
                    id="assignedStatus"
                    className="mt-2 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => handleAcceptanceStatus(e.target.value)}
                  >
                    <option value="me">Assigned by Me</option>
                    <option value="projectManager">
                      Reassign to Project Manager
                    </option>
                  </select>
                )}
              </div>
              {isSmallScreen && (
  <select
    id="taskStatus"
    className="mt-2 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    onChange={(e) => handleTaskStatusChange(task._id, task.taskName, e.target.value)}
  >
    <option value="pending">Pending</option>
    <option value="inProgress">In Progress</option>
    <option value="completed">Completed</option>
  </select>
)}

              {/* Comments Section */}
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
                          {/* User Information */}
                          <p className="text-sm text-gray-600 mb-2">
                            {comment.user}
                          </p>
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-600">
                              {comment.text}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(comment.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleTaskDeleteComment(comment._id)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                          >
                            {comment.user == userInfo?.firstName ? (
                              <TrashIcon className="h-5 w-5 text-red-500" />
                            ) : null}
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
                        onClick={() => handleAddEditComment(task._id)}
                        className="absolute top-1/2 right-2 -translate-y-1/2 bg-[#5453AB] text-white px-4 py-1 rounded-md shadow hover:bg-primary/90"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-[#F0F5F8]"
                onClick={() => setIsTaskModalOpen(false)}
              >
                Close
              </button>

              {task.taskImage && (
                <button
                  onClick={downloadTaskDetails}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Download Image
                </button>
              )}

              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;

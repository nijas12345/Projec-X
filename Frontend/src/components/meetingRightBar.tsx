import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Video } from "lucide-react";
import { IMeeting, MeetingProps, Member } from "../apiTypes/apiTypes";
import api from "../utils/axiosInstance";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import moment from "moment";

const MeetingPageRight: React.FC<MeetingProps> = ({ selectedProject }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meetingTime, setMeetingTime] = useState<string>("");
  const [assignees, setAssignees] = useState<Member[]>([]);
  const [roomId] = useState<string>(uuidv4()); // Generate a unique roomId
  const [meetings, setMeetings] = useState<IMeeting[]>([]);

  useEffect(() => {
    if (selectedProject) {
      fetchMeetings();
    }
  }, [selectedProject]);

  const handleJoinMeeting = (roomId: string) => {
    navigate("/videoCall", { state: { roomId } });
  };

  const fetchMeetings = async () => {
    if (!selectedProject) return;
    const response = await api.patch("/fetchMeetings", {
      projectId: selectedProject._id,
    });
    if (response.status === 200) {
      setMeetings(response.data);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleMeeting = async () => {
    try {
      if (selectedProject && meetingTime) {
        // Send project ID and meeting time to the server
        const response = await api.post("/schedule-meeting", {
          projectId: selectedProject._id,
          meetingTime,
          roomId,
        });
        console.log(response);

        if (response.status === 200) {
          console.log("Meeting scheduled successfully:", response.data);
          const meetingTime = response.data.MeetingTime;
          const formattedTime = moment(meetingTime)
            .local()
            .format("MMMM Do YYYY, h:mm A"); // Example: December 13th 2024, 1:20 PM
          console.log(formattedTime);
          toast.success(
            `The ${selectedProject.name} project meeting is scheduled at ${formattedTime}`
          );
          handleCloseModal(); // Close modal after successful submission
        }
      }
    } catch (error) {
      console.error("Error scheduling meeting:", error);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMeetingTime(e.target.value);
  };

  return (
    <div className="flex flex-col h-screen bg-[#EDEDFF]">
      {/* Header Section */}
      {selectedProject && (
        <header className="flex items-center justify-between lg:p-4 p-1 bg-white border-b shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">
                {selectedProject?.name?.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="font-semibold text-gray-800">
                {selectedProject?.name || "All Meetings"}
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Video Call Button */}
            <button
              disabled
              className="p-2 rounded-full "
              aria-label="Video Call"
            >
              <Video className="w-5 h-5" />
            </button>
            {/* Create Video Call Option */}
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center justify-center"
              disabled
            >
              Video Call
            </button>
          </div>
        </header>
      )}
      {/* Meeting List Section */}
      <div className="flex-1 overflow-y-auto p-4">
        {meetings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {meetings
              .slice() // Create a shallow copy to avoid mutating the original array
              .reverse() // Reverse the order
              .map((meeting) => (
                <div
                  key={meeting._id}
                  className={`p-4 rounded-md shadow-lg ${
                    meeting.status === "completed" ? "bg-white" : "bg-blue-50"
                  }`}
                >
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm text-gray-700">
                      <strong>Status:</strong> {meeting.status}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Meeting Time:</strong>{" "}
                      {new Date(meeting.MeetingTime).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Participants:</strong>
                    </p>
                    <ul className="list-disc pl-4 text-sm text-gray-600">
                      {meeting.members.map((member) => (
                        <li key={member._id}>
                          {member.email} ({member.role})
                        </li>
                      ))}
                    </ul>
                    {/* Conditionally render the Join Meeting button */}
                    {meeting.status !== "completed" &&
                      meeting.status !== "cancelled" && (
                        <button
                          onClick={() => handleJoinMeeting(meeting.roomId)}
                          className="mt-2 inline-block px-3 py-1 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                        >
                          Join Meeting
                        </button>
                      )}
                    {/* Optional message if the meeting is completed */}
                    {meeting.status === "completed" && (
                      <p className="text-sm text-green-600 mt-2">
                        Meeting Completed
                      </p>
                    )}
                    {meeting.status === "cancelled" && (
                      <p className="text-sm text-red-600 mt-2">
                        Meeting Cancelled
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center bg-[#EDEDFF] h-screen space-y-6">
            <h1 className="text-4xl font-extrabold ml-10 text-indigo-600">
              Welcome to
              <span className="block lg:text-center text-center">Projec-X</span>
            </h1>

            {!selectedProject && (
              <p className="text-lg text-gray-500">
                No project selected. Please select a project to create meetings.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Modal for Scheduling a Meeting */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Schedule a Meeting</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Time
              </label>
              <input
                type="datetime-local"
                value={meetingTime}
                onChange={handleTimeChange}
                className="w-full p-2 border rounded-md mb-4"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Participants
              </label>
              <ul className="space-y-2">
                {assignees.map((assignee) => (
                  <li key={assignee._id} className="text-sm text-gray-700">
                    {assignee.email} ({assignee.role})
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-between">
              <button
                onClick={handleCloseModal}
                className="bg-gray-300 text-black px-4 py-2 rounded-md"
              >
                Close
              </button>
              <button
                onClick={handleMeeting}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md"
              >
                Schedule Meeting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingPageRight;
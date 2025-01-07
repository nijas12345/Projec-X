import { Divide, MailIcon } from "lucide-react";
import {
  AdminData,
  CompanyMember,
  UserData,
  UserManagementRightProps,
} from "../apiTypes/apiTypes";
import api from "../utils/axiosInstance";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { log } from "node:console";
import { RootState } from "../redux/RootState/RootState";
import { useSelector } from "react-redux";

const UserManagementRight: React.FC<UserManagementRightProps> = ({
  selectedProject,
  setSelectedProject,
}) => {
  const adminInfo = useSelector(
    (state: RootState): AdminData | null => state.adminAuth.adminInfo
  );
  const [users, setUsers] = useState<UserData[]>([]);
  const [companyMembers, setCompanyMembers] = useState<CompanyMember[]>([]);
  const [companyName, setCompanyName] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 1;
  const totalEntries = users.length; // Total number of users
  const totalPages = Math.ceil(totalEntries / entriesPerPage); // Total pages
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [invitationModal, setInvitationModal] = useState<boolean>(false);
  const [invitedMembers, setInvitedMembers] = useState<string[]>([]);
  const [memberEmail, setMemberEmail] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isInviting,setIsInviting] = useState<boolean>(false)
  const [reInviteStatus, setReInviteStatus] = useState<{
    [email: string]: string;
  }>({});
  const handleCompany = () => {
    fetchCompanyMembers();
    setUsers([]);
    setSelectedProject(null);
  };
  const handleSearch = async(e: React.ChangeEvent<HTMLInputElement>) =>{
      const searchUser = e.target.value
      const response = await api.put('/admin/search-users', {
        searchQuery: searchUser,
        selectedProject
      });
      try {
      selectedProject?setUsers(response.data):setCompanyMembers(response.data)

     } catch (error) {
      console.log(error);
      
     }
  }
  const handleReInvite = async (email: string) => {
    const response = await api.patch("/admin/inviteUser", {
      email: email,
    });
    if (response.status == 200) {
      setReInviteStatus((prevState) => ({
        ...prevState,
        [email]: "Invited", // Set the status to 'Invited' for the specific email
      }));
    }
  };
  useEffect(() => {
    const sendApiRequest = async () => {
      if (selectedProject) {
        console.log(selectedProject);

        try {
          const response = await api.patch(`/admin/get-selected-projects`, {
            project: selectedProject,
          });
          if (response.status == 200) {
            setUsers(response.data);
          }
        } catch (error) {
          console.error("Error sending API request:", error);
        }
      }
    };

    sendApiRequest(); // Call the function whenever selectedProject changes
  }, [selectedProject]);
  const handleAddMember = () => {
    if(adminInfo){
      if(memberEmail == adminInfo.email){
        toast.error("Inviting yourself is not permitted")
        return
      }
      }
    if (invitedMembers.length >= 5) {
      toast.error("Only 5 members can add at a time");
      return; // Prevent adding more members
    }
    if (memberEmail.trim() && !invitedMembers.includes(memberEmail)) {
      setIsSending(true);
      // Simulate adding the member (you can integrate actual API call here)
      setTimeout(() => {
        setInvitedMembers([...invitedMembers,memberEmail]);
        setMemberEmail("");
        setIsSending(false);
      }, 500);
    }
  };

  const handleRemoveMember = (index: number) => {
    const updatedMembers = [...invitedMembers];
    updatedMembers.splice(index, 1);
    setInvitedMembers(updatedMembers);
  };

  const handleInvite = async () => {
    setIsInviting(true)
    if (invitedMembers.length === 0) {
      toast.error("Please invite at least one member.");
      return false;
    }

    const membersWithRole: CompanyMember[] = invitedMembers.map((email) => ({
      email,
      role: "Member",
      status: "pending",
      invitedAt: new Date(),
    }));
    try {
      const response = await api.put("/admin/invitation", {
        members: membersWithRole,
      });
      closeModal();
      setInvitationModal(true);
      if (response.status == 200) {
        setMemberEmail("");
        setIsInviting(false)
        setInvitedMembers([]);
        setInvitationModal(false);
        setCompanyMembers(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const fetchCompanyDetails = async () => {
    try {
      const response = await api.get("/admin/company-data");
      if (response.status == 200) {
        setCompanyName(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchCompanyMembers = async () => {
    try {
      const response = await api.get(`/admin/company-members`);
      if (response.status === 200) {
        setCompanyMembers(response.data);
      }
    } catch (error) {
      console.error("Error fetching company members:", error);
    }
  };

  const handleBlock = async (user_id: string) => {
    try {
      const response = await api.put("/admin/user-block", {
        user_id: user_id,
      });
      if (response.status === 200) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.user_id === user_id ? { ...user, isBlocked: true } : user
          )
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleUnblock = async (user_id: string) => {
    try {
      const response = await api.put("/admin/user-unblock", {
        user_id: user_id,
      });

      if (response.status === 200) {
        // Update the local state to reflect the unblock status
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.user_id === user_id ? { ...user, isBlocked: false } : user
          )
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCompanyMembers();
    fetchCompanyDetails();
  }, []);
  return selectedProject ? (
    <div className="bg-gray-300">
      {/* Conditional header for selected project */}
      <div className="flex flex-col h-screen max-w-6xl mx-auto bg-gray-100">
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-white border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">
                {selectedProject?.name.split(" ")[0]}
              </span>
            </div>
            <div>
              <h1 className="font-semibold">{selectedProject.name}</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
          <input
              type="text"
              placeholder="Search Users"
              onChange={handleSearch}
              className="border border-gray-300 rounded-lg px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              className="bg-indigo-700 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-600 transition duration-200"
              onClick={handleCompany}
            >
              Company Details
            </button>
          </div>
        </header>

        <div className="w-full max-h-[400px] overflow-y-auto bg-white shadow rounded">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="border-b bg-gray-100 text-left text-sm font-medium text-gray-700 sticky top-0 z-10">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Joined Date</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr
                  key={user.user_id}
                  className={`${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } border-b hover:bg-gray-100`}
                >
                  {/* Row Index */}
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {index + 1}
                  </td>

                  {/* Name and Avatar */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.profileImage || "/default-avatar.png"}
                        alt={user.firstName || "User"}
                        className="h-8 w-8 rounded-full"
                      />
                      <span className="text-sm text-gray-800">
                        {user.email || "N/A"}
                      </span>
                    </div>
                  </td>

                  {/* Date Created */}
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "Not Available"}
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3 text-sm text-gray-600">{user.position||"Position not updated"}</td>

                  {/* Status */}
                  <td className=" py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full`}
                      ></div>
                      <span className="text-sm text-gray-800">{user.phone}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {user.isBlocked ? (
                        <button
                          className="h-8 w-16 flex items-center justify-center bg-green-500 text-white hover:bg-green-700 border border-green-500 rounded"
                          aria-label="Unblock"
                          onClick={() => handleUnblock(user.user_id)}
                        >
                          UnBlock
                        </button>
                      ) : (
                        <button
                          className="h-8 w-12 flex items-center justify-center bg-red-500 text-white hover:bg-red-700 border border-red-500 rounded"
                          aria-label="Block"
                          onClick={() => handleBlock(user.user_id)}
                        >
                          Block
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

     
      </div>
    </div>
  ) : (
    <div className=" bg-gray-300">
      {/* Conditional header for selected project */}
      <div className="flex flex-col h-screen max-w-6xl mx-auto bg-gray-100">
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-white border-b shadow-md">
  <div className="flex items-center space-x-3">
    <div className="w-10 h-10 flex items-center justify-center bg-indigo-500 text-white rounded-full text-lg font-bold">
      {companyName.charAt(0).toUpperCase()}{" "}
      {/* Show the first letter of the company name */}
    </div>
    <div>
      <h1 className="font-semibold text-lg text-gray-800">{companyName}</h1>
    </div>
  </div>
  <div className="flex items-center space-x-4">
    {/* Search Bar */}
    <input
      type="text"
      onChange={handleSearch}
      placeholder="Search Users"
      className="border border-gray-300 rounded-lg px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
    <button
      className="bg-indigo-700 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-600 transition duration-200"
      onClick={openModal}
    >
      + Invite Members
    </button>
  </div>
</header>


        <div className="overflow-x-auto">
          <table className="w-full table-auto mt-4 border-collapse bg-white shadow">
            <thead>
              <tr className="border-b bg-gray-100 text-left text-sm font-medium text-gray-700">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Invited Date</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-10 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="h-20 overflow-y-scroll">
              {" "}
              {/* Set a fixed height and scroll for the tbody */}
              {companyMembers.map((user, index) => (
                <tr
                  key={user.email}
                  className={`${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } border-b hover:bg-gray-100`}
                >
                  {/* Row Index */}
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {index + 1}
                  </td>

                  {/* Name and Avatar */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* <img
                src={user. || "/default-avatar.png"}
                alt={user.firstName || "User"}
                className="h-8 w-8 rounded-full"
              /> */}
                      <span className="text-sm text-gray-800">
                        {user.email || "N/A"}
                      </span>
                    </div>
                  </td>

                  {/* Date Created */}
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user.invitedAt
                      ? new Date(user.invitedAt).toLocaleDateString()
                      : "Not Available"}
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3 text-sm text-gray-600">Member</td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          user.status === "pending"
                            ? "bg-red-500"
                            : "bg-green-300"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-800">
                        {user.status === "pending" ? "Pending" : "Joined"}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {user.status === "pending" ? (
                        // Re-invite button for users not joined
                        <button
                          className={`h-8 w-20 flex items-center justify-center text-white border rounded 
                    ${
                      reInviteStatus[user.email] === "Invited"
                        ? "bg-green-500 hover:bg-green-200 border-green-500"
                        : "bg-indigo-500 hover:bg-indigo-600 border-indigo-500"
                    }`}
                          onClick={() => {
                            handleReInvite(user.email);
                          }}
                        >
                          {reInviteStatus[user.email] || "Re-invite"}
                        </button>
                      ) : (
                        // Joined state: Show status or relevant action
                        <button disabled
                          className="h-8 w-20 flex items-center justify-center bg-blue-500 text-white border border-blue-500 rounded"
                          aria-label="Joined"
                        >
                          Member
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-semibold mb-4">Invite Members</h2>
            <div className="mb-4">
              {/* Display invited members */}
              {invitedMembers.map((email, index) => (
                <div
                  key={index}
                  className="flex items-center bg-gray-200 text-gray-700 rounded-full px-3 py-1 mr-2 mb-2"
                >
                  <span>{email}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(index)}
                    className="text-red-500 ml-2 font-bold focus:outline-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Input Field for entering a new email */}
            <input
              type="email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              placeholder="Enter email"
              className="w-full p-2 border border-gray-300 rounded-lg mb-4"
            />

            {/* Add Button */}
            <button
              type="button"
              onClick={handleAddMember}
              disabled={isSending || !memberEmail.trim()}
              className="ml-2 bg-indigo-700 text-white px-4 py-2 rounded-lg mb-4 w-full"
            >
              {isSending ? "Adding..." : "+"}
            </button>

            <div className="flex justify-end space-x-4">
              <button
                onClick={closeModal}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                className="bg-indigo-700 text-white px-4 py-2 rounded-lg"
                onClick={handleInvite}
                disabled = {isInviting}
              >     
                {isInviting ? "Inviting...":"Send Invite"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementRight;

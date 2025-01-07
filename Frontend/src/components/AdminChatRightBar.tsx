import React, { useEffect, useRef, useState } from "react";
import { Check, Mic, Paperclip, Smile } from "lucide-react";
import { ArrowUp } from "lucide-react";
import { AdminData, ChatRightbarProps, Message } from "../apiTypes/apiTypes";
import io, { Socket } from "socket.io-client";
import { useSelector } from "react-redux";
import { RootState } from "../redux/RootState/RootState";
import api from "../utils/axiosInstance";
import { read } from "node:fs";

const backendURL = import.meta.env.VITE_BACKEND_API_URL;
let socket: Socket | null = null;

const AdminChatPageRight: React.FC<ChatRightbarProps> = ({
  selectedProject,
  fetchProjects,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState<string>("");
  const adminInfo = useSelector(
    (state: RootState): AdminData | null => state.adminAuth.adminInfo
  );
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isNewMessage, setIsNewMessage] = useState(false); // Added to track initial load
  const [page, setPage] = useState<number>(1);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );
  const temporaryMessageId = new Date().getTime().toString();

  const openModal = (messageId: string) => {
    setSelectedMessageId(messageId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMessageId(null);
  };

  useEffect(() => {
    console.log("hasMoreMessages updated:", hasMoreMessages);
  }, [hasMoreMessages]); // This will log whenever `hasMoreMessages` changes

  useEffect(() => {
    if (!selectedProject || !adminInfo) return;
    const newPage = 1;
    if (!socket) {
      socket = io(backendURL);
    }
    socket.on("userTyping", (data) => {
      if (data.projectId === selectedProject?._id) {
        setTypingUsers((prev) => [...new Set([...prev, data.senderName])]);
      }
    });
    socket.on("userStopTyping", (data) => {
      if (data.projectId === selectedProject._id) {
        setTypingUsers((prev) =>
          prev.filter((name) => name !== data.senderName)
        ); // Remove user from typingUsers
      }
    });
    console.log("moreMessage", hasMoreMessages);
    setHasMoreMessages(false);
    console.log("moreMessage", hasMoreMessages);

    const { admin_id: userID } = adminInfo;
    const { _id: projectId } = selectedProject;

    socket.emit("joinRoom", { userID, projectId });

    socket.on("receiveGroupMessage", (message: Message) => {
      if (message.projectId === projectId) {
        setIsNewMessage(true);
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });
    socket.on("receiveImageFile", (messageWithFile: Message) => {
      console.log(messageWithFile.imageFile?.data);
      setIsNewMessage(true);
      if (messageWithFile.projectId === selectedProject._id) {
        setMessages((prevMessages) => [...prevMessages, messageWithFile]);
      }
    });

    fetchOldMessages(projectId, newPage); // Fetch initial messages
    return () => {
      socket?.emit("leaveRoom", {
        userID: adminInfo.admin_id,
        projectId: selectedProject._id,
      });
      socket?.off("receiveGroupMessage");
      socket?.off("receiveImageFile");
      socket?.off("userTyping");
      socket?.off("userStopTyping");
      socket?.disconnect();
      socket = null;
    };
  }, [selectedProject, adminInfo]);

  const fetchOldMessages = async (projectId: string, newPage: number) => {
    if (!setHasMoreMessages) return;
    setLoadingOlderMessages(true);

    try {
      let currentPage;
      if (newPage == 1) {
        currentPage = 1;
        setPage(1);
      } else {
        currentPage = page + 1;
        setPage(currentPage);
      }
      console.log("current", currentPage);

      const response = await api.get(
        `/admin/messages/${projectId}?page=${currentPage}&limit=10`
      );
      const fetchedMessages = response.data;
      setHasMoreMessages(fetchedMessages.length === 10);

      if (newPage === 1) {
        setTimeout(() => {
          scrollToBottom();
        }, 100); // Small delay to ensure DOM updates
      }

      setMessages((prevMessages) => [...fetchedMessages, ...prevMessages]);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoadingOlderMessages(false);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  const handleScroll = () => {
    if (
      messagesContainerRef.current?.scrollTop === 0 &&
      hasMoreMessages &&
      selectedProject
    ) {
      let newPage = 2;
      fetchOldMessages(selectedProject._id, newPage);
      console.log("page", page);
    }
  };

  useEffect(() => {
    if (isNewMessage) {
      scrollToBottom();
      setIsNewMessage(false);
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (selectedProject && adminInfo) {
      if (selectedFile) {
        console.log("selected",selectedFile); 
        const reader = new FileReader();
        console.log("reader",reader);
        
        reader.onload = () => {
          const fileData = reader.result as string;
          const messageWithFile: Message = {
            _id: temporaryMessageId,
            text: messageText || "",
            senderId: adminInfo.admin_id,
            senderRole: "Admin",
            senderName: adminInfo.firstName,
            projectId: selectedProject._id,
            read: false,
            time: new Date().toLocaleTimeString(),
            date: new Date().toLocaleDateString(),
            sent: true,
            sentAt: new Date(),
            imageFile: {
              name: selectedFile.name,
              type: selectedFile.type,
              data: fileData,
            },
          };
          console.log("messageWithfile",messageWithFile);
          
          setIsNewMessage(true);
          setMessages((prevMessages) => [...prevMessages, messageWithFile]);
          if (socket && socket.connected) {
            socket?.emit("sendGroupMessageWithFile", messageWithFile);
          } else {
            console.error("Socket is not connected.");
          }
          setSelectedFile(null);
          setMessageText("");
          setImagePreviewUrl(null);
        };
        reader.readAsDataURL(selectedFile);
        return;
      }

      const newMessage: Message = {
        text: messageText,
        sentAt: new Date(),
        senderId: adminInfo.admin_id,
        senderRole: "Admin",
        senderName: adminInfo.firstName,
        projectId: selectedProject._id,
        read: false,
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        sent: true,
      };

      socket?.emit("sendGroupMessage", newMessage);
      setMessageText("");
      fetchProjects();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
    if (socket && selectedProject && adminInfo) {
      socket.emit("typing", {
        projectId: selectedProject?._id,
        senderName: adminInfo.firstName,
      });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit("stopTyping", {
        projectId: selectedProject?._id,
        senderName: adminInfo?.firstName,
      });
    }, 5000);
  };
  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger the hidden file input
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      console.log("file", file);

      if (file.type.startsWith("image/")) {
        const previewUrl = URL.createObjectURL(file);
        setImagePreviewUrl(previewUrl);
      }
    }
  };

  return selectedProject ? (
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
          {/* <button className="p-2 rounded-full hover:bg-gray-200" aria-label="Video Call">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-200" aria-label="Phone Call">
              <Phone className="w-5 h-5" />
            </button> */}
          {/* <button className="p-2 rounded-full hover:bg-gray-200" aria-label="Search">
              <Search className="w-5 h-5" />
            </button> */}
        </div>
      </header>

      {/* Messages */}
      <main
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 p-4 overflow-y-auto bg-[url('/placeholder.svg?height=400&width=400')] bg-repeat"
      >
        {loadingOlderMessages && (
          <div className="text-center text-sm text-gray-500">
            Loading messages...
          </div>
        )}
        {messages
          .filter((message) => message.projectId === selectedProject?._id) // Filter messages by projectId
          .map((message, index) => {
            const showDate =
              index === 0 || messages[index - 1].date !== message.date;
            const isSentByCurrentUser =
              adminInfo?.firstName === message.senderName;

            return (
              <div key={message._id || index}>
                {showDate && (
                  <div className="flex justify-center my-4">
                    <span className="px-4 py-2 text-xs bg-white rounded-lg shadow-sm">
                      {message.date}
                    </span>
                  </div>
                )}
                <div
                  className={`flex ${
                    isSentByCurrentUser ? "justify-end" : "justify-start"
                  } mb-2`}
                >
                  <div className="max-w-[70%]">
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        isSentByCurrentUser ? "bg-[#dcf8c6]" : "bg-white"
                      }`}
                    >
                      {!isSentByCurrentUser && (
                        <p className="text-md text-gray-600 mb-1">
                          {message.senderName}
                        </p>
                      )}
                      <p className="text-sm">{message.text}</p>
                      {message.imageFile && message?._id && (
                        <img
                          src={message.imageFile.url || message.imageFile.data}
                          alt={message.imageFile.name || "Uploaded File"}
                          style={{
                            width: "300px",
                            height: "auto",
                            marginTop: "5px",
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                          }}
                          onClick={() => {
                            openModal(message._id!);
                          }}
                        />
                      )}
                      {isModalOpen && (
                        <div
                          style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 1000,
                          }}
                          onClick={closeModal}
                        >
                          {messages
                            .filter(
                              (message) =>
                                message.projectId === selectedProject?._id
                            ) // Filter messages by projectId
                            .map((message) =>
                              message._id === selectedMessageId &&
                              message.imageFile ? ( // Only show the image of the selected message
                                <img
                                  key={message._id}
                                  src={
                                    message.imageFile.url ||
                                    message.imageFile.data
                                  }
                                  alt={
                                    message.imageFile.name || "Uploaded File"
                                  }
                                  style={{
                                    maxWidth: "90%",
                                    maxHeight: "90%",
                                    borderRadius: "5px",
                                  }}
                                />
                              ) : null
                            )}
                        </div>
                      )}

                      <div className="flex items-center justify-end space-x-1">
                        <span className="text-xs text-gray-500">
                          {message.time}
                        </span>
                        {isSentByCurrentUser && (
                          <div className="flex -space-x-1">
                            {/* Show single tick if the message is sent but not read yet */}
                            {message.read ? (
                              <>
                                <Check className="w-3 h-3 text-blue-500" />
                                <Check className="w-3 h-3 text-blue-500" />
                              </>
                            ) : (
                              <Check className="w-3 h-3 text-blue-500" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        {typingUsers.length > 0 && (
          <div className="flex justify-start mb-2">
            <p className="text-xs text-gray-500">
              {typingUsers.join(", ")} {typingUsers.length > 1 ? "are" : "is"}{" "}
              typing...
            </p>
          </div>
        )}
        <div ref={messagesEndRef} /> {/* Scroll to bottom */}
      </main>

      {/* Footer */}
      <footer className="p-4 bg-gray-50 border-t">
        <div className="relative flex items-center space-x-2">
          {/* Modal for Image Preview */}
          {imagePreviewUrl && (
            <div className="absolute z-10 bg-white border p-2 rounded-md shadow-md bottom-14 left-0">
              <img
                src={imagePreviewUrl}
                alt="Selected File Preview"
                className="w-24 h-24 object-cover"
              />
            </div>
          )}

          {/* Paperclip Button */}
          <button
            className="p-2 rounded-full hover:bg-gray-200"
            aria-label="Attach File"
            onClick={handleFileClick}
          >
            <Paperclip className="w-6 h-6 text-gray-500" />
          </button>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          {/* Message Input */}
          <input
            type="text"
            value={messageText}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && messageText.trim()) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type a message"
            className="w-full p-2 border rounded-lg focus:outline-none"
          />

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            className="p-2 rounded-full hover:bg-gray-200"
            aria-label="Send Message"
          >
            <ArrowUp className="w-6 h-6 text-gray-500" />
          </button>
        </div>
      </footer>
    </div>
  ) : (
    <div className="flex flex-col justify-center items-center bg-[#EDEDFF] h-screen space-y-6">
      <h1 className="text-4xl font-extrabold text-indigo-600">
        Welcome to
        <span className="block lg:text-center text-center">Projec-X</span>
      </h1>
      <p className="text-lg text-gray-500 lg:ml-0 ml-5">
        No project selected. Please select a project to start chatting.
      </p>
    </div>
  );
};

export default AdminChatPageRight;

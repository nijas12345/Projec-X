import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useSelector } from "react-redux";
import { RootState } from "../redux/RootState/RootState";
import { UserData, AdminData } from "../apiTypes/apiTypes";

const VideoCallPage = () => {
  const userInfo = useSelector(
    (state: RootState): UserData | null => state.userAuth.userInfo
  );
  const adminInfo = useSelector(
    (state: RootState): AdminData | null => state.adminAuth.adminInfo
  );
  const meetingRef = useRef<HTMLDivElement>(null);
  const zpInstanceRef = useRef<any>(null); // Ref for Zego instance
  const location = useLocation();
  const navigate = useNavigate();

  const roomId = location.state?.roomId;
  const appID = Number(import.meta.env.VITE_REACT_APP_ZEGO_APP_ID);
  const serverSecret = import.meta.env.VITE_REACT_APP_ZEGO_SERVER_SECRET;

  useEffect(() => {
    if (!roomId) {
      console.error("Room ID is missing. Redirecting to home...");
      navigate("/");
      return;
    }

    if (zpInstanceRef.current) {
      console.warn("Already in a room. Skipping joinRoom.");
      return; // Prevent multiple joinRoom calls
    }

    const meeting = async () => {
      if (meetingRef.current && (userInfo || adminInfo)) {
        const userName = userInfo
          ? userInfo.firstName
          : adminInfo
          ? adminInfo.firstName
          : "Unknown User";

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          roomId,
          Date.now().toString(),
          userName
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zpInstanceRef.current = zp; // Store Zego instance

        const isAdmin = !!adminInfo;

        zp.joinRoom({
          container: meetingRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.VideoConference,
          },
          turnOnMicrophoneWhenJoining: isAdmin,
          showRoomTimer: false,
          sharedLinks: [
            {
              name: "Invite Link",
              url: `${window.location.origin}/room/${roomId}`,
            },
          ],
          onLeaveRoom: () => {
            const path =
              userName === adminInfo?.firstName
                ? `/admin/meetingexit/${roomId}`
                : `/meetingexit/${roomId}`;
            console.log("Navigating to:", path);
            navigate(path);
          },
        });
      }
    };

    meeting();

    return () => {
      if (zpInstanceRef.current) {
        console.log("Cleaning up Zego instance...");
        zpInstanceRef.current.destroy(); // Properly destroy the Zego instance
        zpInstanceRef.current = null; // Reset the ref
      }
      if (meetingRef.current) {
        meetingRef.current.innerHTML = ""; // Clean up the DOM container
      }
    };
  }, [roomId, userInfo, adminInfo, appID, serverSecret]);

  return (
    <div>
      <div ref={meetingRef} style={{ width: "100%", height: "100%" }}></div>
    </div>
  );
};

export default VideoCallPage;

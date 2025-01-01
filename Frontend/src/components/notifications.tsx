import { NotificationsProps } from "../apiTypes/apiTypes";

const Notifications: React.FC<NotificationsProps> = ({ notifications }) => {
  return (
    <div className="max-w-4xl lg:ml-0 ml-10 mx-auto p-0 space-y-4">
      {notifications.map((notification) => (
        <div
          key={notification._id}
          className={`p-4 rounded-md shadow ${
            notification.isRead ? "bg-white" : "bg-blue-50"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">{notification.message}</p>
              <span className="text-xs text-gray-500">
                {new Date(notification.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notifications;

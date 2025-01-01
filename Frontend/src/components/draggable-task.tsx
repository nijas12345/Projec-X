import { useDraggable } from "@dnd-kit/core";
import { DraggableTaskProps } from "../apiTypes/apiTypes";

export const DraggableTask: React.FC<DraggableTaskProps> = ({ task, onClick }) => {
  const { attributes, listeners, setNodeRef, isDragging, transform } =
    useDraggable    ({
      id: task._id,
      data: { taskName: task.taskName },
    });

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    onClick(task);
  };

  // Style for dragging (make item semi-transparent and apply shadow)
  const style = {
    opacity: isDragging ? 0.5 : 1,
    boxShadow: isDragging ? "0px 4px 8px rgba(0, 0, 0, 0.1)" : "none",
    transform: isDragging
      ? `translate3d(${transform?.x ?? 0}px, ${transform?.y ?? 0}px, 0)`
      : undefined,
    transition: isDragging ? "none" : "transform 0.2s ease",
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style} // Set isDraggingTask to true when drag starts
      onContextMenu={handleContextMenu} // Set isDraggingTask to true when drag starts
      className="p-4 shadow hover:shadow-lg transition-shadow duration-300 border mx-2 my-2 bg-white rounded-md cursor-pointer"
    >
      <div className="p-0 space-y-3">
        <p className="text-base font-normal">{task.description}</p>
        <div className="flex items-center justify-between">
          <div className="inline-block px-3 py-1 text-sm font-semibold text-white bg-[#5453AB] rounded-full">
            {task.taskName || ""}
          </div>
          <p className="text-sm text-gray-500">
            {new Date(task.deadline).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

import { useDroppable } from "@dnd-kit/core";

export const DroppableColumn = ({
    columnId,
    children,
  }: {
    columnId: string;
    children: React.ReactNode;
  }) => {
    const { setNodeRef } = useDroppable({ id: columnId }); // Set droppable ID for the column
    return (
      <div
        ref={setNodeRef} 
        className="bg-[#EDEDFF] space-y-4 rounded-lg"
      >
        {children} {/* Render the children, which can be the task items */}
      </div>
    );
  };
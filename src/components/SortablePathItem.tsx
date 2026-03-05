import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PathItem } from "./PathItem";
import { FilterPath } from "../types";

interface SortablePathItemProps {
    path: FilterPath;
    onUpdate: (updatedPath: FilterPath) => void;
    onRemove: (id: string) => void;
    onBrowse: (id: string) => void;
}

export const SortablePathItem: React.FC<SortablePathItemProps> = (props) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: props.path.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : "auto",
        position: "relative" as "relative",
    };

    return (
        <div ref={setNodeRef} style={style}>
            <PathItem
                {...props}
                dragHandleProps={{ ...attributes, ...listeners }}
            />
        </div>
    );
};

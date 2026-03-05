import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Folder, Trash, DotsSixVertical } from "@phosphor-icons/react";
import { FilterPath } from "../types";
import { IconPicker } from "./EmojiPicker";
import { ICON_MAP } from "../utils/icons";

interface PathItemProps {
    path: FilterPath;
    onUpdate: (updatedPath: FilterPath) => void;
    onRemove: (id: string) => void;
    onBrowse: (id: string) => void;
    dragHandleProps?: any;
}

export const PathItem: React.FC<PathItemProps> = ({
    path,
    onUpdate,
    onRemove,
    onBrowse,
    dragHandleProps,
}) => {
    const [isEditingIcon, setIsEditingIcon] = useState(false);
    const { t } = useTranslation();
    const IconComponent = ICON_MAP[path.icon] || ICON_MAP["Folder"];

    return (
        <div className="group bg-[#252525] p-5 rounded-[20px] transition-colors hover:bg-[#2a2a2a] relative flex items-center gap-4">
            {/* Drag Handle */}
            <div
                {...dragHandleProps}
                className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing p-1"
            >
                <DotsSixVertical size={24} weight="bold" />
            </div>

            <div className="relative">
                <button
                    onClick={() => setIsEditingIcon(true)}
                    className="w-12 h-12 flex items-center justify-center bg-[#333] rounded-2xl text-2xl shadow-inner hover:bg-[#444] transition-colors text-blue-400 focus:outline-none"
                >
                    <IconComponent size={24} weight="fill" />
                </button>

                {isEditingIcon && (
                    <IconPicker
                        onSelect={(iconName) => {
                            onUpdate({ ...path, icon: iconName });
                            setIsEditingIcon(false);
                        }}
                        onClose={() => setIsEditingIcon(false)}
                    />
                )}
            </div>

            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <input
                    value={path.name}
                    onChange={(e) =>
                        onUpdate({ ...path, name: e.target.value })
                    }
                    placeholder={t("settings.folderNamePlaceholder")}
                    className="bg-transparent text-lg font-bold placeholder-gray-600 focus:outline-none w-full"
                />

                <div className="flex items-center gap-2">
                    <div
                        onClick={() => onBrowse(path.id)}
                        className="flex-1 flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 cursor-pointer transition-colors"
                    >
                        <Folder size={16} weight="duotone" />
                        <span className="truncate max-w-[400px]">
                            {path.path || t("settings.selectFolderPlaceholder")}
                        </span>
                    </div>
                </div>
            </div>

            <button
                onClick={() => onRemove(path.id)}
                className="p-3 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100 focus:outline-none"
            >
                <Trash size={20} />
            </button>
        </div>
    );
};

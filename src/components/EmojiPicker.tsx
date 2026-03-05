import React, { useRef, useEffect } from "react";
import { X } from "@phosphor-icons/react";
import { ICON_KEYS, ICON_MAP } from "../utils/icons";

interface IconPickerProps {
    onSelect: (iconName: string) => void;
    onClose: () => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({
    onSelect,
    onClose,
}) => {
    const pickerRef = useRef<HTMLDivElement>(null);

    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                pickerRef.current &&
                !pickerRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <div
            ref={pickerRef}
            className="absolute top-14 left-0 z-50 bg-[#333] border border-gray-700 p-3 rounded-2xl shadow-2xl grid grid-cols-5 gap-2 w-[240px] animate-in fade-in zoom-in-95 duration-200"
        >
            {ICON_KEYS.map((name) => {
                const IconComponent = ICON_MAP[name];
                if (!IconComponent) return null;
                return (
                    <button
                        key={name}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(name);
                        }}
                        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#444] text-gray-300 hover:text-white transition-all cursor-pointer"
                        title={name}
                    >
                        <IconComponent size={24} weight="fill" />
                    </button>
                );
            })}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                className="col-span-5 mt-2 py-1 flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
            >
                <X size={12} /> 닫기
            </button>
        </div>
    );
};

import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";

interface Option {
    label: string;
    value: string;
}

interface BottomMenuProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    options: Option[];
    selectedValue: string;
    onSelect: (value: string) => void;
}

export const BottomMenu: React.FC<BottomMenuProps> = ({
    isOpen,
    onClose,
    title,
    options,
    selectedValue,
    onSelect,
}) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setVisible(true);
        } else {
            const timer = setTimeout(() => setVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen && !visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
                    isOpen ? "opacity-100" : "opacity-0"
                }`}
                onClick={onClose}
            />

            {/* Menu Content */}
            <div
                className={`relative w-full max-w-lg bg-[#252525] rounded-t-[24px] p-6 pb-8 transform transition-transform duration-300 ease-out ${
                    isOpen ? "translate-y-0" : "translate-y-full"
                }`}
            >
                {/* Handle Bar */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/10 rounded-full" />

                <h3 className="text-white font-bold text-[18px] mb-6 mt-2">
                    {title}
                </h3>

                <div className="space-y-2">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => {
                                onSelect(option.value);
                                onClose();
                            }}
                            className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                                selectedValue === option.value
                                    ? "bg-blue-600 text-white"
                                    : "bg-[#333] text-gray-300 hover:bg-[#3e3e3e]"
                            }`}
                        >
                            <span className="font-semibold text-[15px]">
                                {option.label}
                            </span>
                            {selectedValue === option.value && (
                                <Check size={20} />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

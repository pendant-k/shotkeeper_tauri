import React, { useEffect, useState } from "react";
import { Warning, CheckCircle, Info } from "@phosphor-icons/react";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
    onCancel: () => void;
    currentAlert?: { type: "success" | "error" | "info" };
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    currentAlert,
}) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setVisible(true);
        } else {
            const timer = setTimeout(() => setVisible(false), 200);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!visible) return null;

    const isAlert = !onConfirm;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onCancel}
            />
            <div
                className={`bg-[#252525] rounded-[24px] p-6 w-[320px] shadow-2xl relative transform transition-all duration-200 ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
            >
                <div className="flex flex-col items-center text-center">
                    <div className="mb-4 text-blue-500">
                        {currentAlert?.type === "success" && (
                            <CheckCircle
                                size={48}
                                weight="fill"
                                className="text-blue-500"
                            />
                        )}
                        {currentAlert?.type === "error" && (
                            <Warning
                                size={48}
                                weight="fill"
                                className="text-red-500"
                            />
                        )}
                        {(currentAlert?.type === "info" || !currentAlert) && (
                            <Info
                                size={48}
                                weight="fill"
                                className="text-gray-400"
                            />
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">
                        {title}
                    </h3>
                    <p className="text-gray-400 text-[15px] leading-relaxed mb-6 whitespace-pre-wrap">
                        {message}
                    </p>

                    <div className="flex gap-3 w-full">
                        {onConfirm && (
                            <button
                                onClick={onCancel}
                                className="flex-1 h-12 rounded-[16px] bg-[#333] text-gray-300 font-bold hover:bg-[#444] transition-colors"
                            >
                                취소
                            </button>
                        )}
                        <button
                            onClick={onConfirm || onCancel}
                            className={`flex-1 h-12 rounded-[16px] font-bold text-white transition-colors ${
                                currentAlert?.type === "error"
                                    ? "bg-red-500 hover:bg-red-600"
                                    : "bg-blue-600 hover:bg-blue-500"
                            }`}
                        >
                            {isAlert ? "확인" : "실행"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

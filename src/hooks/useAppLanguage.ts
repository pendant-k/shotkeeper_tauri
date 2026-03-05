import { useContext } from "react";
import { LanguageContext } from "../contexts/LanguageContext";

export const useAppLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error(
            "useAppLanguage must be used within a LanguageProvider"
        );
    }
    return context;
};

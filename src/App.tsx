import { useEffect, useState } from "react";
import { SettingsView } from "./views/SettingsView";
import { PopupView } from "./views/PopupView";

const App = () => {
    const [view, setView] = useState<"settings" | "popup">("settings");

    useEffect(() => {
        const hash = window.location.hash;
        if (hash === "#popup") {
            setView("popup");
        } else {
            setView("settings");
        }

        const handleHashChange = () => {
            if (window.location.hash === "#popup") {
                setView("popup");
            } else {
                setView("settings");
            }
        };

        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, []);

    return (
        <div className="h-full w-full text-white overflow-hidden">
            {view === "settings" ? <SettingsView /> : <PopupView />}
        </div>
    );
};

export default App;

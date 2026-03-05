import {
    Folder,
    House,
    Briefcase,
    PaintBrush,
    Note,
    Camera,
    MusicNote,
    FloppyDisk,
    Star,
    Heart,
    Ghost,
    GameController,
    Coffee,
    Code,
    TerminalWindow,
    Globe,
    Cloud,
    Lightning,
    Lightbulb,
    Clipboard,
} from "@phosphor-icons/react";
import React from "react";

// Map of icon names to components for easy lookup/rendering
export const ICON_MAP: Record<string, React.ElementType> = {
    Folder: Folder,
    House: House,
    Briefcase: Briefcase,
    PaintBrush: PaintBrush,
    Note: Note,
    Camera: Camera,
    MusicNote: MusicNote,
    FloppyDisk: FloppyDisk,
    Star: Star,
    Heart: Heart,
    Ghost: Ghost,
    GameController: GameController,
    Coffee: Coffee,
    Code: Code,
    TerminalWindow: TerminalWindow,
    Globe: Globe,
    Cloud: Cloud,
    Lightning: Lightning,
    Lightbulb: Lightbulb,
    Clipboard: Clipboard,
};

export type IconName = keyof typeof ICON_MAP;

export const ICON_KEYS = Object.keys(ICON_MAP) as IconName[];

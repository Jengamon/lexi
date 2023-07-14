import { create } from "zustand";
import { LanguageGroup } from "~/src/data";
import { produce } from "immer";

export interface Project {
    name: string;
    group: LanguageGroup;
    setName: (name: string) => void;
    updateGroup: (delta: (draft: LanguageGroup) => LanguageGroup) => void;
}

export const useProjectStore = create<Project>()((set) => ({
    name: "",
    group: {
        version: "alpha",
        protolangs: [],
    },
    setName: (name: string) => set((proj) => ({ name, group: proj.group })),
    updateGroup: (delta: (draft: LanguageGroup) => LanguageGroup) =>
        set((proj) => ({
            name: proj.name,
            group: produce(proj.group, delta),
        })),
}));

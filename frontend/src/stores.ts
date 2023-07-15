import { create } from "zustand";
import { LanguageGroup } from "~/src/data";
import { produce } from "immer";
import { mountStoreDevtool } from "simple-zustand-devtools";

export interface Project {
    name: string;
    group: LanguageGroup;
    setName: (name: string) => void;
    updateGroup: (delta: (draft: LanguageGroup) => LanguageGroup) => void;
}

export const EMPTY_PROJECT: LanguageGroup = {
    version: "alpha",
    protolangs: [],
    langs: [],
};

export const useProjectStore = create<Project>()((set) => ({
    name: "",
    group: EMPTY_PROJECT,
    setName: (name: string) => set((proj) => ({ name, group: proj.group })),
    updateGroup: (delta: (draft: LanguageGroup) => LanguageGroup) =>
        set((proj) => ({
            name: proj.name,
            group: produce(proj.group, delta),
        })),
}));

if (process.env.NODE_ENV === "development") {
    mountStoreDevtool("Project", useProjectStore);
}

import { invoke } from "@tauri-apps/api";
import { Runtype, Static } from "runtypes";
import type { SWRSubscription } from "swr/subscription";
import { listen } from "@tauri-apps/api/event";
import useSWR, { SWRResponse } from "swr";

export function useCheckedInvokeSWR<R extends Runtype<T>, T>(
    expected: R,
    id: string,
    args: any
): SWRResponse<Static<R>> {
    return useSWR<T>([id, args], async ([id, args]: [string, any]) => {
        let data = await invoke(id, args);
        return expected.check(data);
    });
}

export function subscribeGenerator<R extends Runtype<T>, T>(
    expected: R,
): SWRSubscription<string, T, unknown> {
    return (id, { next }) => {
        return () =>
            (async () =>
                await listen(id, (event) => {
                    try {
                        let data = expected.check(event.payload);
                        next(null, data);
                    } catch (e) {
                        next(e);
                    }
                }))();
    };
}

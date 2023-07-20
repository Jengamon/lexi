import { invoke } from "@tauri-apps/api";
import { Runtype, Static } from "runtypes";
import useSWR, { SWRConfiguration, SWRResponse } from "swr";
import type { SWRSubscription } from "swr/subscription";
import { listen } from "@tauri-apps/api/event";

export function useCheckedInvokeSWR<R extends Runtype<T>, T>(
    expected: R,
    id: string,
    args: any,
    config?: SWRConfiguration<Static<R>>,
): SWRResponse<Static<R>> {
    return useSWR<T>(
        [id, args],
        async ([id, args]: [string, any]) => {
            return await useCheckedInvoke(expected, id, args);
        },
        config,
    );
}

export async function useCheckedInvoke<R extends Runtype<T>, T>(
    expected: R,
    id: string,
    args: any,
): Promise<Static<R>> {
    let data = await invoke(id, args);
    return expected.check(data);
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

import { invoke } from "@tauri-apps/api";
import { Runtype } from "runtypes";
import type { SWRSubscription } from 'swr/subscription'
import { listen } from "@tauri-apps/api/event"

export async function fetcher<R extends Runtype<T>, T>(
    [id,
        expected,
        payload]: readonly [string, R, any]
) {
    return invoke(id, payload).then((data) => expected.check(data));
}

export function subscribeGenerator<R extends Runtype<T>, T>(
    expected: R
): SWRSubscription<string, T, unknown> {
    return (id, { next }) => {
        return () => (async () => await listen(id, (event) => {
            try {
                let data = expected.check(event.payload);
                next(null, data);
            } catch (e) {
                next(e)
            }
        }))();
    }
}

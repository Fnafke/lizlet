async function parseErrorMessage(response: Response): Promise<string> {
    if (response.status === 404) {
        return "We couldn't find that study set.";
    }
    try {
        const body = await response.json();
        return body.message ?? body.detail ?? response.statusText ?? "Something went wrong";
    } catch {
        return response.statusText || "Something went wrong";
    }
}

/** Throws an Error with a readable message when the response is not 2xx. */
export async function assertOk(response: Response): Promise<Response> {
    if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
    }
    return response;
}

/** assertOk + parse the JSON body. */
export async function readJson<T>(response: Response): Promise<T> {
    await assertOk(response);
    return response.json() as Promise<T>;
}

export function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Something went wrong";
}
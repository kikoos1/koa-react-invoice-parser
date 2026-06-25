export const uploadToApi = async <T>(
    url: string,
    file: File,
): Promise<T> => {
    const formData = new FormData();
    formData.append('file', file);

    let response: Response;
    try {
        response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${url}`, {
            method: 'POST',
            body: formData,
        });
    } catch {
        throw new Error('No response from API Service');
    }

    if (!response.ok) {
        const errorData = await response.json() as { error: string }
        throw new Error(errorData.error);
    }

    const data = await response.json();
    return data as T;
}
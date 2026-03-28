const timestamp = () => new Date().toISOString();

export const logInfo = (message: string, payload?: unknown) => {
    if (payload === undefined) {
        console.log(`[${timestamp()}] INFO ${message}`);
        return;
    }

    console.log(`[${timestamp()}] INFO ${message}`, payload);
};

export const logWarn = (message: string, payload?: unknown) => {
    if (payload === undefined) {
        console.warn(`[${timestamp()}] WARN ${message}`);
        return;
    }

    console.warn(`[${timestamp()}] WARN ${message}`, payload);
};

export const logError = (message: string, payload?: unknown) => {
    if (payload === undefined) {
        console.error(`[${timestamp()}] ERROR ${message}`);
        return;
    }

    console.error(`[${timestamp()}] ERROR ${message}`, payload);
};

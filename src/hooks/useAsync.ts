import { useState, useCallback } from 'react';

interface UseAsyncState<T> {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
}

export const useAsync = <T, args extends any[] = any[]>(
    asyncFunction: (...args: args) => Promise<T>,
    immediate = true
) => {
    const [state, setState] = useState<UseAsyncState<T>>({
        data: null,
        isLoading: immediate,
        error: null,
    });

    const execute = useCallback(
        async (...args: args) => {
            setState((prevState) => ({ ...prevState, isLoading: true, error: null }));
            try {
                const response = await asyncFunction(...args);
                setState({ data: response, isLoading: false, error: null });
                return response;
            } catch (error: any) {
                setState({ data: null, isLoading: false, error: error });
                throw error;
            }
        },
        [asyncFunction]
    );

    return {
        ...state,
        execute,
    };
};

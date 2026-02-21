import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPostById, updatePost } from '../services/post.service';

export const usePostById = (postId: string) => {
    const queryClient = useQueryClient();

    const {
        data: post,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ['post', postId],
        queryFn: () => getPostById(postId),
        enabled: !!postId,
    });

    const updateMutation = useMutation({
        mutationFn: (data: { message: string; image?: string | null }) =>
            updatePost(postId, data),
        onSuccess: (updated) => {
            queryClient.setQueryData(['post', postId], updated);
            queryClient.invalidateQueries({ queryKey: ['posts', 'infinite'] });
        },
    });

    return {
        post,
        isLoading,
        isError,
        error,
        updatePost: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
        updateError: updateMutation.error,
    };
};

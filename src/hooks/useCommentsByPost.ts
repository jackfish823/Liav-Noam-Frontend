import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCommentsByPostId, createComment, updateComment } from '../services/comment.service';

interface UseCommentsByPostProps {
  postId: string;
  limit?: number;
}

export const useCommentsByPost = ({ postId, limit = 5 }: UseCommentsByPostProps) => {
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['comments', postId],
    queryFn: ({ pageParam }) => getCommentsByPostId(postId, pageParam, limit),
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
    enabled: !!postId,
    initialPageParam: null as string | null,
  });

  const comments = data?.pages.flatMap(page => page.comments) ?? [];

  const createCommentMutation = useMutation({
    mutationFn: (newComment: { body: string; postId: string; author: string }) =>
      createComment(newComment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, body }: { commentId: string; body: string }) =>
      updateComment(commentId, { body }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });

  return {
    comments,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    createComment: createCommentMutation.mutate,
    isCreatingComment: createCommentMutation.isPending,
    createCommentError: createCommentMutation.error,
    updateComment: updateCommentMutation.mutate,
    isUpdatingComment: updateCommentMutation.isPending,
  };
};

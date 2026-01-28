import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPostsPaginated, createPost } from '../services/post.service';

interface UsePostsProps {
  limit?: number;
}

export const usePosts = ({ limit = 10 }: UsePostsProps = {}) => {
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['posts', 'infinite'],
    queryFn: ({ pageParam }) => getPostsPaginated(pageParam, limit),
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
    initialPageParam: null as string | null,
  });

  const posts = data?.pages.flatMap(page => page.posts) ?? [];

  const createPostMutation = useMutation({
    mutationFn: (postData: { message: string; author: string }) => createPost(postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'infinite'] });
    },
  });

  return {
    posts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    createPost: createPostMutation.mutate,
    isCreatingPost: createPostMutation.isPending,
    createPostError: createPostMutation.error,
  };
};

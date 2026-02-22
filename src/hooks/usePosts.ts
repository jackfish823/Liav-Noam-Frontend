import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPostsPaginated, createPost } from '../services/post.service';

interface UsePostsProps {
  limit?: number;
  author?: string;
}

export const usePosts = ({ limit = 10, author }: UsePostsProps = {}) => {
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['posts', 'infinite', author],
    queryFn: ({ pageParam }) => getPostsPaginated(pageParam, limit, author),
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
    initialPageParam: null as string | null,
  });

  const posts = data?.pages.flatMap(page => page.posts) ?? [];

  const createPostMutation = useMutation({
    mutationFn: (postData: { message: string; author: string; image?: string }) => createPost(postData),
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

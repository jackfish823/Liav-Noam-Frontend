import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { getPostsPaginated, createPost, searchPosts } from '../services/post.service';

interface UsePostsProps {
  limit?: number;
  author?: string;
  searchQuery?: string;
}

export const usePosts = ({ limit = 10, author, searchQuery }: UsePostsProps = {}) => {
  const queryClient = useQueryClient();

  const feedQuery = useInfiniteQuery({
    queryKey: ['posts', 'infinite', author],
    queryFn: ({ pageParam }) => getPostsPaginated(pageParam, limit, author),
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
    initialPageParam: null as string | null,
    enabled: !searchQuery,
  });

  const searchResultsQuery = useQuery({
    queryKey: ['posts', 'search', searchQuery],
    queryFn: () => searchPosts(searchQuery!),
    enabled: !!searchQuery,
  });

  const posts = searchQuery 
    ? (searchResultsQuery.data ?? []) 
    : (feedQuery.data?.pages.flatMap(page => page.posts) ?? []);

  const isLoading = searchQuery ? searchResultsQuery.isLoading : feedQuery.isLoading;
  const isError = searchQuery ? searchResultsQuery.isError : feedQuery.isError;
  const fetchNextPage = feedQuery.fetchNextPage;
  const hasNextPage = searchQuery ? false : feedQuery.hasNextPage;
  const isFetchingNextPage = feedQuery.isFetchingNextPage;

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

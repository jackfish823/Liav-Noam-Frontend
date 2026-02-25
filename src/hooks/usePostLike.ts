import { useRef, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData, QueryKey } from '@tanstack/react-query';
import { likePost, unlikePost } from '../services/post.service';
import type { PostsResponse } from '../services/post.service';
import type { IPost } from '../types';

const DEBOUNCE_MS = 300;

type Snapshot = {
    previousPost: IPost | undefined;
    previousInfinite: Array<[QueryKey, InfiniteData<PostsResponse> | undefined]>;
};

export const usePostLike = (postId: string) => {
    const queryClient = useQueryClient();
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const snapshotRef = useRef<Snapshot | null>(null);

    const mutation = useMutation({
        mutationFn: (isCurrentlyLiked: boolean) =>
            isCurrentlyLiked ? unlikePost(postId) : likePost(postId),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['post', postId] });
            await queryClient.cancelQueries({ queryKey: ['posts', 'infinite'] });
            return snapshotRef.current ?? undefined;
        },
        onError: (_err, _isCurrentlyLiked, context) => {
            const snap = context as Snapshot | undefined;
            if (!snap) return;
            if (snap.previousPost !== undefined) {
                queryClient.setQueryData(['post', postId], snap.previousPost);
            }
            snap.previousInfinite?.forEach(([key, data]) => {
                queryClient.setQueryData(key, data);
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['post', postId] });
            queryClient.invalidateQueries({ queryKey: ['posts', 'infinite'] });
        },
    });

    const toggle = useCallback(
        (isCurrentlyLiked: boolean) => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            const applyOptimistic = () => {
                const previousPost = queryClient.getQueryData<IPost>(['post', postId]);
                const previousInfinite = queryClient.getQueriesData<InfiniteData<PostsResponse>>({
                    queryKey: ['posts', 'infinite'],
                });
                snapshotRef.current = { previousPost, previousInfinite };

                queryClient.setQueryData<IPost>(['post', postId], (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        isLiked: !isCurrentlyLiked,
                        likeCount: isCurrentlyLiked
                            ? Math.max(0, (old.likeCount ?? 1) - 1)
                            : (old.likeCount ?? 0) + 1,
                    };
                });

                queryClient.setQueriesData<InfiniteData<PostsResponse>>(
                    { queryKey: ['posts', 'infinite'] },
                    (old) => {
                        if (!old?.pages) return old;
                        return {
                            ...old,
                            pages: old.pages.map((page) => ({
                                ...page,
                                posts: page.posts.map((p) =>
                                    p._id === postId
                                        ? {
                                              ...p,
                                              isLiked: !isCurrentlyLiked,
                                              likeCount: isCurrentlyLiked
                                                  ? Math.max(0, (p.likeCount ?? 1) - 1)
                                                  : (p.likeCount ?? 0) + 1,
                                          }
                                        : p
                                ),
                            })),
                        };
                    }
                );
            };

            applyOptimistic();

            debounceTimerRef.current = setTimeout(() => {
                debounceTimerRef.current = null;
                mutation.mutate(isCurrentlyLiked);
            }, DEBOUNCE_MS);
        },
        [postId, queryClient, mutation]
    );

    return {
        toggle,
        isPending: mutation.isPending,
        error: mutation.error,
    };
};

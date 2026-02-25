import { useRef, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData, QueryKey } from '@tanstack/react-query';
import { upvoteComment, downvoteComment, removeCommentVote } from '../services/comment.service';
import type { CommentsResponse } from '../services/comment.service';
import type { IComment, CommentVoteDirection } from '../types';

const DEBOUNCE_MS = 300;

type Snapshot = {
    previousComments: Array<[QueryKey, InfiniteData<CommentsResponse> | undefined]>;
};

function voteDeltas(oldDir: CommentVoteDirection, newDir: CommentVoteDirection): { deltaUp: number; deltaDown: number } {
    const deltaUp = (newDir === 1 ? 1 : 0) - (oldDir === 1 ? 1 : 0);
    const deltaDown = (newDir === -1 ? 1 : 0) - (oldDir === -1 ? 1 : 0);

    return { deltaUp, deltaDown };
}

export const useCommentVote = (commentId: string, postId: string) => {
    const queryClient = useQueryClient();
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const snapshotRef = useRef<Snapshot | null>(null);

    const mutation = useMutation({
        mutationFn: (direction: CommentVoteDirection) =>
            direction === 0
                ? removeCommentVote(commentId)
                : direction === 1
                  ? upvoteComment(commentId)
                  : downvoteComment(commentId),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['comments', postId] });
            return snapshotRef.current ?? undefined;
        },
        onError: (_err, _direction, context) => {
            const snap = context as Snapshot | undefined;
            if (!snap?.previousComments) return;
            snap.previousComments.forEach(([key, data]) => {
                queryClient.setQueryData(key, data);
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', postId] });
        },
    });

    const vote = useCallback(
        (newDirection: CommentVoteDirection) => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            const applyOptimistic = () => {
                const previousComments = queryClient.getQueriesData<InfiniteData<CommentsResponse>>({
                    queryKey: ['comments', postId],
                });
                snapshotRef.current = { previousComments };

                queryClient.setQueriesData<InfiniteData<CommentsResponse>>(
                    { queryKey: ['comments', postId] },
                    (old) => {
                        if (!old?.pages) return old;
                        return {
                            ...old,
                            pages: old.pages.map((page) => ({
                                ...page,
                                comments: page.comments.map((c) => {
                                    if (c._id !== commentId) return c;
                                    const oldDir: CommentVoteDirection = c.userVote === 1 || c.userVote === -1 ? c.userVote : 0;
                                    const { deltaUp, deltaDown } = voteDeltas(oldDir, newDirection);
                                    return {
                                        ...c,
                                        userVote: (newDirection === 0 ? null : newDirection) as IComment['userVote'],
                                        upCount: (c.upCount ?? 0) + deltaUp,
                                        downCount: (c.downCount ?? 0) + deltaDown,
                                    };
                                }),
                            })),
                        };
                    }
                );
            };

            applyOptimistic();

            debounceTimerRef.current = setTimeout(() => {
                debounceTimerRef.current = null;
                mutation.mutate(newDirection);
            }, DEBOUNCE_MS);
        },
        [commentId, postId, queryClient, mutation]
    );

    return {
        vote,
        isPending: mutation.isPending,
        error: mutation.error,
    };
};

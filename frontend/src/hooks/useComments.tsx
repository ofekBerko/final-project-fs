import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { Comment, Post } from "@/types";
import api from "@/axios/axios";
import { API_ROUTES } from "@/axios/apiRoutes";

const COMMENTS_PER_LOAD = 5;

export const useComments = (postId: Post["id"]) => {

  const retrieveComments = async ({
    pageParam,
  }: {
    pageParam: number;
  }): Promise<Comment[] | undefined> => {
    try {
      const { data } = await api.get(`${API_ROUTES.comments}/${postId}`, {
        params: { page: pageParam, limit: COMMENTS_PER_LOAD },
      });
      return data;
    } catch (error) {
      console.log(error);
    }
  };

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["comments", postId],
    queryFn: ({ pageParam }) => retrieveComments({ pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage && lastPage.length < COMMENTS_PER_LOAD
        ? undefined
        : allPages.length + 1,
  });

  const createComment = async (
    content: Comment["content"]
  ): Promise<Comment | undefined> => {
    try {
      const { data } = await api.post<Comment>(API_ROUTES.comments, {
        postId,
        content,
      });
      return data;
    } catch (error) {
      console.error(error);
    }
  };

  const createCommentMutation = useMutation({
    mutationFn: (content: Comment["content"]) => createComment(content),
    onSuccess: () => {
      refetch();
    },
  });

  return {
    comments: data?.pages.flat() || [],
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    addComment: createCommentMutation.mutate,
    isAdding: createCommentMutation.isPending,
    addingError: createCommentMutation.error
      ? createCommentMutation.error.message
      : null,
  };
};

import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { Post, User } from "@/types";
import api from "@/axios/axios";
import { API_ROUTES } from "@/axios/apiRoutes";
import { useNavigate } from "@tanstack/react-router";

const ITEMS_PER_PAGE = 40;

export const usePosts = (userId?: User["id"]) => {
  const navigate = useNavigate();

  const retrievePosts = async ({ pageParam }: { pageParam: number }) => {
    try {
      const apiUrl = userId
        ? `${API_ROUTES.posts}/${userId}`
        : API_ROUTES.posts;
      const { data } = await api.get<Post[]>(apiUrl, {
        params: { page: pageParam, limit: ITEMS_PER_PAGE },
      });

      return data;
    } catch (error) {
      console.error(error);
      throw new Error("An unexpected error occurred");
    }
  };

  const addPost = async (content: string, image: File | null) => {
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (image) {
        formData.append("image", image);
      }

      const { data } = await api.post<Post>(API_ROUTES.posts, formData);
      return data;
    } catch (error) {
      console.error(error);
      throw new Error("An unexpected error occurred");
    }
  };

  const modifyPost = async (
    postId: string,
    content: string,
    image: File | null
  ) => {
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (image) {
        formData.append("image", image);
      }

      const { data } = await api.put<Post>(
        `${API_ROUTES.posts}/${postId}`,
        formData
      );
      return data;
    } catch (error) {
      console.error(error);
      throw new Error("An unexpected error occurred");
    }
  };

  const removePost = async (postId: string) => {
    try {
      const { data } = await api.delete<boolean>(`${API_ROUTES.posts}/${postId}`);
      return data;
    } catch (error) {
      console.error(error);
      throw new Error("An unexpected error occurred");
    }
  };

  const addPostMutation = useMutation({
    mutationFn: ({ content, image }: { content: string; image: File | null }) =>
      addPost(content, image),
    onSuccess: () => {
      navigate({
        to: "/",
      });
    },
  });

  const modifyPostMutation = useMutation({
    mutationFn: ({
      postId,
      content,
      image,
    }: {
      postId: string;
      content: string;
      image: File | null;
    }) => modifyPost(postId, content, image),
    onSuccess: () => {
      navigate({
        to: "/",
      });
    },
  });

  const removePostMutation = useMutation({
    mutationFn: ({ postId }: { postId: string }) => removePost(postId),
    onSuccess: () => {
      navigate({
        to: "/",
      });
    },
  });

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["posts", userId],
      queryFn: ({ pageParam }) => retrievePosts({ pageParam }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length < ITEMS_PER_PAGE ? undefined : allPages.length + 1,
    });

  return {
    createPostMutation: addPostMutation,
    updatePostMutation: modifyPostMutation,
    deletePostMutation: removePostMutation,
    posts: data?.pages.flat() || [],
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};

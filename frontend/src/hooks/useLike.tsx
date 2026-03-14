import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Post } from "@/types";
import { usePosts } from "../hooks/usePosts";
import { useState } from "react";
import api from "@/axios/axios";
import { API_ROUTES } from "@/axios/apiRoutes";

export const useLike = (postId: Post["id"]) => {
  const { posts } = usePosts();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(
    posts.find((post) => post.id === postId)?.isUserLiked
  );
  const [likedCount, setLikedCount] = useState(
    posts.find((post) => post.id === postId)?.likes
  );

  const toggleLiked = async (): Promise<boolean | undefined> => {
    try {
      const { data } = await api.post<{ isUserLiked: boolean }>(
        `${API_ROUTES.posts}/like/${postId}`
      );
      return data.isUserLiked;
    } catch (error) {
      console.error(error);
    }
  };

  const updateLikedMutation = useMutation({
    mutationFn: () => toggleLiked(),
    onSuccess: (newLikedStatus) => {
      if (newLikedStatus !== null) {
        setLikedCount((likedCount ?? 0) + (newLikedStatus ? 1 : -1));
        setIsLiked(newLikedStatus);
        queryClient.invalidateQueries({ queryKey: ["posts"] });
      }
    },
  });

  return {
    isLiked,
    toggleLiked: updateLikedMutation.mutate,
    isUpdating: updateLikedMutation.isPending,
    updateError: updateLikedMutation.error
      ? updateLikedMutation.error.message
      : null,
    likedCount,
  };
};

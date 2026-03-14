import { useMutation, useQuery } from "@tanstack/react-query";
import { User } from "@/types";
import { useRecoilState } from "recoil";
import { userAtom } from "@/atoms";
import api from "@/axios/axios";
import { API_ROUTES } from "@/axios/apiRoutes";
import { AxiosError } from "axios";

export const useProfile = (id: User["id"]) => {
  const [user, setUser] = useRecoilState(userAtom);

  const fetchUserProfile = async (id: User["id"]): Promise<User | null> => {
    try {
      if (id === user?.id) return user;
      const fetchedUser = await api.get<User>(`${API_ROUTES.users}/${id}`);

      return fetchedUser.data;
    } catch (error) {
      console.error("Error fetching user ", error);
      throw error;
    }
  };

  const {
    data: profile,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["profile", id],
    queryFn: () => fetchUserProfile(id),
  });

  const updateUserProfile = async (
    id: User["id"],
    username: User["username"] | null,
    image: File | null
  ): Promise<User | null> => {
    try {
      if (!user || user.id !== id) {
        throw new Error("You can only update your own profile.");
      }
      const formData = new FormData();

      formData.append("username", username || user.username);

      if (user?.image) formData.append("image", image || user?.image);

      const updatedUser = await api.put<User>(
        `${API_ROUTES.users}/${id}`,
        formData
      );

      return updatedUser.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
        const { message } = error.response.data;
        console.error("Error creating user:", message);
        throw new Error(message);
      }
      console.error("Error creating user:", error);
      throw error;
    }
  };

  const updateProfileMutation = useMutation({
    mutationFn: ({
      id,
      username,
      image,
    }: {
      id: User["id"];
      username: User["username"] | null;
      image: File | null;
    }) => updateUserProfile(id, username, image),
    onSuccess: (user) => {
      if (user) {
        setUser(user);
      }
    },
  });

  return {
    profile,
    isLoading,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
    updateError: updateProfileMutation.error
      ? updateProfileMutation.error.message
      : null,
    refetchProfile: refetch,
  };
};

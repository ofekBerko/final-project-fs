import { useMutation } from "@tanstack/react-query";
import { User, UserWithToken } from "@/types";
import { useSetRecoilState } from "recoil";
import { userAtom } from "@/atoms";
import api from "@/axios/axios";
import { API_ROUTES } from "@/axios/apiRoutes";
import { AxiosError } from "axios";

export const useRegister = () => {
  const setUser = useSetRecoilState(userAtom);

  const registerUser = async (
    email: User["email"],
    username: User["username"],
    password: string,
    image?: File | null
  ): Promise<User | null> => {
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("username", username);
      formData.append("password", password);

      if (image) {
        formData.append("image", image);
      }

      const user = await api.post<UserWithToken>(API_ROUTES.users, formData);
      localStorage.setItem("accessToken", user.data.accessToken);

      return user.data.user;
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
  const registerMutation = useMutation({
    mutationFn: ({
      email,
      username,
      password,
      image,
    }: {
      email: User["email"];
      username: User["username"];
      password: string;
      image?: File | null;
    }) => registerUser(email, username, password, image),
    onSuccess: (user) => {
      if (user) {
        setUser({ ...user });
      }
    },
  });

  return {
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error
      ? registerMutation.error.message
      : null,
  };
};

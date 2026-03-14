import { useRecoilState } from "recoil";
import { userAtom } from "@/atoms";
import { User, UserWithToken } from "@/types";
import { useMutation } from "@tanstack/react-query";
import api from "@/axios/axios";
import { API_ROUTES } from "@/axios/apiRoutes";
import { CredentialResponse } from "@react-oauth/google";
import { AxiosError } from "axios";

export const DEFAULT_USER_IMAGE =
  "https://static.vecteezy.com/system/resources/thumbnails/001/840/618/small/picture-profile-icon-male-icon-human-or-people-sign-and-symbol-free-vector.jpg";

export const useUser = () => {
  const [user, setUser] = useRecoilState(userAtom);

  const login = async (username: User["username"], password: string) => {
    try {
      const user = await api.post<UserWithToken>(
        `${API_ROUTES.users}/loginUser`,
        {
          username,
          password,
        }
      );

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

  const loginByToken = async (token: string) => {
    try {
      const response = await api.post(`${API_ROUTES.users}/validate-token`, {
        accessToken: token,
      });

      return response.data.user;
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

  const googleLogin = async (credential: CredentialResponse["credential"]) => {
    try {
      const { data } = await api.post(`${API_ROUTES.auth}/google`, {
        credential,
      });
      localStorage.setItem("accessToken", data.accessToken);

      return data.user;
    } catch (error) {
      console.error("Invalid credentials ", error);
      throw error;
    }
  };

  const loginByTokenMutation = useMutation({
    mutationFn: (token: string) => loginByToken(token),
    onSuccess: (user) => {
      if (user) {
        setUser({ ...user, image: user.image || DEFAULT_USER_IMAGE });
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: ({
      username,
      password,
    }: {
      username: User["username"];
      password: string;
    }) => login(username, password),
    onSuccess: (user) => {
      if (user) {
        console.log(user);
        setUser({ ...user, image: user.image || DEFAULT_USER_IMAGE });
      }
    },
  });

  const googleLoginMutation = useMutation({
    mutationFn: ({
      credential,
    }: {
      credential: CredentialResponse["credential"];
    }) => googleLogin(credential),
    onSuccess: (user) => {
      if (user) {
        setUser({ ...user, image: user.image || DEFAULT_USER_IMAGE });
      }
    },
  });

  const logout = async () => {
    try {
      await api.post<User>(`${API_ROUTES.users}/logoutUser`);
      localStorage.removeItem("accessToken");
      setUser(null);
    } catch (error) {
      console.error("Error in logout", error);
      throw error;
    }
  };

  return {
    user,
    loginGoogle: googleLoginMutation.mutate,
    login: loginMutation.mutate,
    loginByToken: loginByTokenMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error ? loginMutation.error.message : null,
  };
};

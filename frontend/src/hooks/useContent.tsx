import { API_ROUTES } from "@/axios/apiRoutes";
import api from "@/axios/axios";
import { ContentType } from "@/types";

export const useContent = () => {
  const generateContent = async (contentType: ContentType) => {
    try {
      const { data } = await api.post(`${API_ROUTES.content}/generate`, {
        contentType,
      });

      return data;
    } catch (error) {
      console.error(error);
    }
  };

  return {
    generateContent,
  };
};

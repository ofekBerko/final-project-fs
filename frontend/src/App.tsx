import "./App.css";
import QueryProvider from "@/providers/QueryProvider";
import RecoilProvider from "@/providers/RecoilProvider";
import { router } from "@/routes";
import { RouterProvider } from "@tanstack/react-router";

const App = () => {
  return (
    <QueryProvider>
      <RecoilProvider>
        <RouterProvider router={router} />
      </RecoilProvider>
    </QueryProvider>
  );
};

export default App;

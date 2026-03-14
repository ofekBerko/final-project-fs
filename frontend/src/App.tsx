import "./App.css";
import QueryProvider from "./providers/QueryProvider";
import RecoilProvider from "./providers/RecoilProvider";
import { RouterProvider } from "@tanstack/react-router";

const App = () => {
  return (
    <QueryProvider>
      <RecoilProvider>
        <RouterProvider/>
      </RecoilProvider>
    </QueryProvider>
  );
};

export default App;

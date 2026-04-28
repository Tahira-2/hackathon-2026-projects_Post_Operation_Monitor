import { RouterProvider } from "react-router-dom";
import { useAuthBootstrap } from "./lib/auth-hooks";
import { router } from "./routes";

export default function App() {
  useAuthBootstrap()

  return <RouterProvider router={router} />;
}

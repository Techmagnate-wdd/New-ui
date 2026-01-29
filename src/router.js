import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import TaskForm from "./components/TaskForm";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [{ path: "/", element: <TaskForm /> }],
  },
]);

export default router;

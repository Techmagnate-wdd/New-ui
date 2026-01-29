import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const showToast = (message, type = "success") => {
  if (type === "success") {
    toast.success(message);
  } else if (type === "error") {
    toast.error(message);
  } else {
    toast.info(message);
  }
};

export const CustomToastContainer = () => (
  <ToastContainer
    position="top-right"
    autoClose={2000}
    toastClassName="custom-toast"
    progressStyle={{
      background: "#2c3e50",
    }}
  />
);

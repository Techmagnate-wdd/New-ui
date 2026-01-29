import React from "react";
import InternalApp from "./Internal/InternalApp";
import App from "./App";

const MainRouter = () => {
  const path = window.location.hash || window.location.pathname;
  console.log(path, "path")

  const isInternalRoute =
    path.startsWith("#/internal") || path.startsWith("/internal-login");
  return isInternalRoute ? <InternalApp /> : <App />;
};

export default MainRouter;

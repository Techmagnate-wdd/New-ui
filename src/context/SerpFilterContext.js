import React, { createContext, useContext, useState } from "react";

const SerpFilterContext = createContext();

export const SerpFilterProvider = ({ children }) => {
  const [filter, setFilter] = useState({
    keyword: "",
    startDate: "",
    endDate: "",
    project: "",
    brand: "",
    category: "",
    subCategory: "",
    user: ""
  });

  return (
    <SerpFilterContext.Provider value={{ filter, setFilter }}>
      {children}
    </SerpFilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(SerpFilterContext);
  if (!context) {
    throw new Error("useFilter must be used inside SerpFilterProvider");
  }
  return context;
};

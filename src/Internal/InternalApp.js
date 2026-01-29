import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Index from "./Dashboard/Index";
import InternalMasterLayout from "./internalMasterLayout/InternalMasterLayout";
import { InternalAuthProvider } from "./context/InternalAuthContext";
import AirtableTablePage from "./AirtableTable/AirtableTablePage";
import InternalLogin from "./InternalLogin";

const InternalApp = () => {
  return (
    <InternalAuthProvider>
      <Routes>

        {/* Login page */}
        <Route path="/internal-login" element={<InternalLogin />} />

        {/* All internal pages under layout */}
        <Route path="/internal" element={<InternalMasterLayout />}>

          {/* Dashboard */}
          {/* <Route path="dashboard" element={<Index />} /> */}

          {/* Table page */}
          <Route path="table/:tableId" element={<AirtableTablePage />} />

          {/* Default redirect */}
          <Route index element={<Navigate to="dashboard" replace />} />

        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/internal-login" replace />} />

      </Routes>
    </InternalAuthProvider>
  );
};

export default InternalApp;

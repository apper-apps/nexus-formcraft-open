import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import FormResponses from "@/components/pages/FormResponses";
import React from "react";
import Dashboard from "@/components/pages/Dashboard";
import PublishedForm from "@/components/pages/PublishedForm";
import FormBuilder from "@/components/pages/FormBuilder";
import Layout from "@/components/organisms/Layout";
function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-surface">
<Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="builder" element={<FormBuilder />} />
            <Route path="builder/:formId" element={<FormBuilder />} />
            <Route path="form/:formId/responses" element={<FormResponses />} />
          </Route>
          <Route path="form/:publishId" element={<PublishedForm />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          className="!z-[9999]"
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
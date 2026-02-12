import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import SelectPersonType from "./pages/SelectPersonType";
import Register from "./pages/Register";
import Login from "./pages/Login";
import VerifyPhone from "./pages/VerifyPhone";

import Dashboard from "./pages/Dashboard";

// Onboarding
import Onboarding from "./pages/Onboarding";
import LivenessCheck from "./pages/LivenessCheck";
import IneUpload from "./pages/IneUpload";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Paso 0: Selección de tipo de persona */}
        <Route path="/" element={<Home />} />
        <Route path="/select-person-type" element={<SelectPersonType />} />

        {/* Registro */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-phone" element={<VerifyPhone />} />

        {/* Onboarding */}
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/onboarding/liveness" element={<LivenessCheck />} />
        <Route path="/onboarding/ine/upload" element={<IneUpload />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

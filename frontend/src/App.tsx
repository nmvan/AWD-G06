import { Routes, Route } from "react-router-dom";
import SignInPage from "./pages/SignIn";
import HomePage from "./pages/Home";
import SignUpPage from "./pages/SignUp";
import ProtectedRoute from "./components/ProtectRoute";
import NotFoundRedirect from "./components/NotFoundRoute";
import GoogleCallback from "./pages/GoogleCallBack";

function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomePage />} />
      </Route>
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/login/oauth/google/callback" element={<GoogleCallback />} />

      <Route path="*" element={<NotFoundRedirect />} />
    </Routes>
  );
}

export default App;

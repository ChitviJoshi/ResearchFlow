import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./features/auth/pages/login.jsx";
import Register from "./features/auth/pages/register.jsx";
import Protected from "./features/auth/components/protected.jsx";

import Home from "./features/repos/pages/home.jsx";
import RepoDetail from "./features/repoDetail/pages/repoDetail.jsx";

import ReviewList from "./features/review/pages/reviewList.jsx";
import ReviewDetail from "./features/review/pages/reviewDetail.jsx";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<Protected />}>
          <Route path="/" element={<Home />} />
          <Route path="/repos/:repoId" element={<RepoDetail />} />
          <Route path="/repos/:repoId/reviews" element={<ReviewList />} />
          <Route path="/reviews/:reviewId" element={<ReviewDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;

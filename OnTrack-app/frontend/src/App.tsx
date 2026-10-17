import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { TabLayout } from "./components/TabLayout";
import { getMe } from "./lib/api";
import { getToken } from "./lib/auth";
import { Chores } from "./screens/Chores";
import { Home } from "./screens/Home";
import { HouseFeed } from "./screens/HouseFeed";
import { HouseSetup } from "./screens/HouseSetup";
import { Login } from "./screens/Login";
import { Me } from "./screens/Me";

// Logged out -> /login. Logged in without a house -> /setup.
function RequireAuth({ needsHouse }: { needsHouse: boolean }) {
  const loggedIn = Boolean(getToken());
  const me = useQuery({ queryKey: ["me"], queryFn: getMe, enabled: loggedIn });

  if (!loggedIn) return <Navigate to="/login" replace />;
  if (me.isPending) return null;
  if (me.isError) return <Navigate to="/login" replace />;
  if (needsHouse && !me.data.house) return <Navigate to="/setup" replace />;
  if (!needsHouse && me.data.house) return <Navigate to="/" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth needsHouse={false} />}>
        <Route path="/setup" element={<HouseSetup />} />
      </Route>
      <Route element={<RequireAuth needsHouse />}>
        <Route element={<TabLayout />}>
          <Route index element={<Home />} />
          <Route path="chores" element={<Chores />} />
          <Route path="house" element={<HouseFeed />} />
          <Route path="me" element={<Me />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

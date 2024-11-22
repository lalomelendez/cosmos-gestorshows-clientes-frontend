import {
  createBrowserRouter,
  RouterProvider,
  Route,
  createRoutesFromElements,
  Outlet,
} from "react-router-dom";

import NavBar from "./components/NavBar";
import Home from "./components/Home";
import CreateShow from "./components/CreateShow";
import AssignUsers from "./components/AssignUsers";
import EditShow from "./components/EditShow";
import ShowPlayback from "./components/ShowPlayback";
import CapturePhoto from "./components/CapturePhoto";

// Create NotFound component
const NotFound = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <h1 className="text-2xl text-gray-600">404 - Page Not Found</h1>
  </div>
);

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="create-show" element={<CreateShow />} />
      <Route path="assign-users" element={<AssignUsers />} />
      <Route path="edit-show" element={<EditShow />} />
      <Route path="show-playback" element={<ShowPlayback />} />
      <Route path="capture-photo" element={<CapturePhoto />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  ),
  {
    future: {
      v7_skipActionErrorRevalidation: true
    },
  }
);

function App() {
  return <RouterProvider router={router} />;
}

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default App;

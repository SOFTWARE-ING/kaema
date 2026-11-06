import { createBrowserRouter, Navigate } from "react-router-dom";
import Landing from "@/components/pages/Landing";
import ClientLayout from "@/components/layout/ClientLayout";
import ClientLogin from "@/components/pages/client/Login";
import ClientDashboard from "@/components/pages/client/Dashboard";
import RendezVous from "@/components/pages/client/RendezVous";
import Suggestions from "@/components/pages/client/Suggestions";
import Chat from "@/components/pages/client/Chat";
import AdminLogin from "@/components/pages/admin/Login";
import AdminDashboard from "@/components/pages/admin/Dashboard";
import SpecialitesPage from "@/components/pages/Specialites";
import Showroom from "@/components/pages/Showroom";
import GuideMateriaux from "@/components/pages/GuideMateriaux";

export const router = createBrowserRouter([
    { path: "/", element: <Landing /> },
    { path: "/showroom", element: <Showroom /> },
    { path: "/guide-materiaux", element: <GuideMateriaux /> },
    { path: "/prestations", element: <SpecialitesPage /> },
    { path: "/specialites", element: <Navigate to="/prestations" replace /> },
    {
        path: "/client",
        element: <ClientLayout />,
        children: [
            { index: true, element: <ClientDashboard /> },
            { path: "rendez-vous", element: <RendezVous /> },
            { path: "suggestions", element: <Suggestions /> },
            { path: "chat", element: <Chat /> },
        ],
    },
    { path: "/client/login", element: <ClientLogin /> },
    { path: "/admin/login", element: <AdminLogin /> },
    { path: "/admin", element: <AdminDashboard /> },
    { path: "*", element: <Navigate to="/" replace /> },
]);
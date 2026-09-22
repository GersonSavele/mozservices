import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Welcome from "./pages/auth/Welcome";
import Login from "./pages/auth/Login";
import RegisterClient from "./pages/auth/RegisterClient";
import RegisterProvider from "./pages/auth/RegisterProvider";
import ForgotPassword from "./pages/auth/ForgotPassword";
import CompleteProfile from "./pages/auth/CompleteProfile";

import Home from "./pages/client/Home";
import ProviderProfile from "./pages/client/ProviderProfile";
import RequestSent from "./pages/client/RequestSent";
import MyRequests from "./pages/client/MyRequests";

import Notifications from "./pages/provider/Notifications";
import RequestDetail from "./pages/provider/RequestDetail";
import Dashboard from "./pages/provider/Dashboard";
import NewService from "./pages/provider/NewService";

import Review from "./pages/shared/Review";
import EditSchedule from "./pages/shared/EditSchedule";
import Profile from "./pages/shared/Profile";
import EditProfile from "./pages/shared/EditProfile";
import ServiceImages from "./pages/provider/ServiceImages";

export default function App() {
  return (
    <Routes>
      {/* Autenticação */}
      <Route path="/" element={<Welcome />} />
      <Route path="/entrar" element={<Login />} />
      <Route path="/registo/cliente" element={<RegisterClient />} />
      <Route path="/registo/prestador" element={<RegisterProvider />} />
      <Route path="/recuperar-senha" element={<ForgotPassword />} />
      <Route path="/completar-perfil" element={<CompleteProfile />} />

      {/* Fluxo do cliente */}
      <Route
        path="/inicio"
        element={
          <ProtectedRoute somente="cliente">
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/servico/:idServico"
        element={
          <ProtectedRoute somente="cliente">
            <ProviderProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pedido-enviado/:idSolicitacao"
        element={
          <ProtectedRoute somente="cliente">
            <RequestSent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/minhas-solicitacoes"
        element={
          <ProtectedRoute somente="cliente">
            <MyRequests />
          </ProtectedRoute>
        }
      />

      {/* Fluxo do prestador */}
      <Route
        path="/notificacoes"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/painel"
        element={
          <ProtectedRoute somente="prestador">
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/painel/novo-servico"
        element={
          <ProtectedRoute somente="prestador">
            <NewService />
          </ProtectedRoute>
        }
      />

      {/* Comum: detalhe da solicitação, agendamento, avaliação, perfil */}
      <Route
        path="/solicitacao/:idSolicitacao"
        element={
          <ProtectedRoute>
            <RequestDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agendamento/:idSolicitacao"
        element={
          <ProtectedRoute>
            <EditSchedule />
          </ProtectedRoute>
        }
      />
      <Route
        path="/avaliar/:idSolicitacao"
        element={
          <ProtectedRoute somente="cliente">
            <Review />
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfil/editar"
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/painel/servico/:idServico/fotos"
        element={
          <ProtectedRoute somente="prestador">
            <ServiceImages />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

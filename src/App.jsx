import "./style/globalStyle.scss"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/login/Login"
import Home from "./pages/home/Home"
import Register from "./pages/registroLogin/RegistroLogin"
import RegistroAbrigo from './pages/registroAbrigos/RegistroAbrigos'
import RegistroDesabrigados from './pages/registroDesabrigados/RegistroDesabrigados'
import AbrigosMaisProximos from './pages/registroDesabrigados/AbrigosMaisProximos'
import RegistroPets from './pages/registroPets/RegistroPets'
import AdminPainel from './pages/Admin/AdminPainel'
import GerenciaUsuarios from './pages/Admin/GerenciaUsuarios'
import GerenciaAbrigos from './pages/Admin/GerenciaAbrigos'
import GerenciaPets from './pages/Admin/GerenciaPets'
import GerenciaDesabrigados from './pages/Admin/GerenciaDesabrigados'
import Desabrigados from './components/Desabrigados/Desabrigados'
import Usuario from './pages/Usuario/Usuario'
import PrivateRoute from "./routes/PrivateRoutes"
import AdminRoute from "./routes/AdminRoute"
import Landing from "./pages/Landing/Landing"
function App() {


  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/shelter" element={<RegistroAbrigo />} />
          <Route path="/register/desabrigado" element={<RegistroDesabrigados />} />
          <Route path="/desabrigados/:id/abrigos-proximos" element={<PrivateRoute><AbrigosMaisProximos /></PrivateRoute>} />
          <Route path="/desabrigados" element={<PrivateRoute><Desabrigados /></PrivateRoute>} />
          <Route path="/register/pet" element={<RegistroPets />} />
          <Route path="/admin" element={<AdminRoute><AdminPainel /></AdminRoute>} />
          <Route path="/admin/usuarios" element={<AdminRoute><GerenciaUsuarios /></AdminRoute>} />
          <Route path="/admin/abrigos" element={<AdminRoute><GerenciaAbrigos /></AdminRoute>} />
          <Route path="/admin/pets" element={<AdminRoute><GerenciaPets /></AdminRoute>} />
          <Route path="/admin/desabrigados" element={<AdminRoute><GerenciaDesabrigados /></AdminRoute>} />
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Usuario /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App

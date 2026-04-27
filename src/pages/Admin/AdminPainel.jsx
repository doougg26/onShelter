import { useNavigate } from "react-router-dom"
import Header from "../../components/header/Header"
import Footer from "../../components/footer/Footer"
import s from "./AdminPainel.module.scss"

export default function AdminPainel() {
  const navigate = useNavigate()

  const handleNavigateUsuarios = () => {
    navigate("/admin/usuarios")
  }

  const handleNavigateAbrigos = () => {
    navigate("/admin/abrigos")
  }

  const handleNavigatePets = () => {
    navigate("/admin/pets")
  }

  const handleNavigateDesabrigados = () => {
    navigate("/admin/desabrigados")
  }

  return (
    <>
      <Header />
      <div className={s.adminContainer}>
        <h1>Painel de Administrador</h1>
        <p>Escolha uma seção para gerenciar:</p>
        <div className={s.links}>
          <button onClick={handleNavigateUsuarios}>Gerenciar Usuários</button>
          <button onClick={handleNavigateAbrigos}>Gerenciar Abrigos</button>
          <button onClick={handleNavigatePets}>Gerenciar Pets</button>
          <button onClick={handleNavigateDesabrigados}>Gerenciar Desabrigados</button>
        </div>
      </div>
      <Footer />
    </>
  )
}

import Header from "../../components/header/Header"
import s from "./Home.module.scss"
import Footer from "../../components/footer/Footer"
import { useNavigate } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import {jwtDecode} from "jwt-decode"
// import api from "../../services/api"

export default function Home() {
  const navigate = useNavigate()
  const { token } = useContext(AuthContext)
  const decoded = token ? jwtDecode(token) : null
  const role = decoded?.role || "user"

  const navigateShelter = () => {
    navigate("/register/shelter")
  }
  const NavigateDesabrigados = () => {
    navigate("/register/desabrigado")
  }
  const navigatePets = () => {
    navigate("/register/pet")
  }
    const handleNavigateDesabrigados = (event) => {
    event.preventDefault()
    navigate("/desabrigados")
  }

  const showAbrigos = role === "manager" || role === "admin"

  return (
    <>
      <Header />
      <div className={s.container}>
        <h2>Bem vindo ao onShelter</h2>
        <section className={s.boxContainer}>
          <div className={s.boxDesabrigados}>
            <h3>Estou Desabrigado</h3>
            <button onClick={NavigateDesabrigados}>Registrar</button>
          </div>

                    <div className={s.boxDesabrigados}>
            <h3>Consultar Abrigos/Pets/Desabrigados</h3>
            <button onClick={handleNavigateDesabrigados}>Consultar</button>
          </div>
          {showAbrigos && (
            <div className={s.boxAbrigados}>
              <h3>Quero Cadastrar um Abrigo</h3>
              <button onClick={navigateShelter}>Cadastrar</button>
            </div>
          )}
          <div className={s.boxPets}>
            <h3>Perdi meu pet</h3>
            <button onClick={navigatePets}>Registrar</button>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}

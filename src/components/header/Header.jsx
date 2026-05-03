import { useNavigate } from "react-router-dom"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../../context/AuthContext"
import api from "../../services/api"
import s from "./Header.module.scss"
import imglogo from "../../assets/img/hero.png"

import {jwtDecode} from "jwt-decode"

export default function Header( { onNavigate } ) {
  const { logout, token } = useContext(AuthContext)
  const [role, setRole] = useState(null)
  const [userName, setUserName] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      setRole(null)
      setUserName("")
      return
    }

    try {
      const decoded = jwtDecode(token)
      setRole(decoded.role)

      api.get(`/usuarios/${decoded.id}`)
        .then((response) => {
          setUserName(response.data.nome_completo || "Usuário")
        })
        .catch(() => setUserName("Usuário"))
    } catch (error) {
        console.error("Erro ao decodificar token:", error)  
      setRole(null)
      setUserName("")
    }
    console
  }, [token])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleNavigateLanding = (event) => {
    event.preventDefault()
    navigate("/landing")
  }

  const handleNavigateLogin = (event) => {
    event.preventDefault()
    navigate("/login")
  }

  const handleNavigateRegister = (event) => {
    event.preventDefault()
    navigate("/register")
  }

  const handleNavigateShelter = (event) => {
    event.preventDefault()
    navigate("/admin/abrigos")
  }

  const handleNavigateAdmin = (event) => {
    event.preventDefault()
    navigate("/admin")
  }

const handleNavigateHome = (event) => {
    event.preventDefault()
    navigate("/home")
  }

  const handleNavigateProfile = (event) => {
    event.preventDefault()
    navigate("/profile")
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const isLogged = !!token

  return (
    <header className={s.header}>
      <section className={s.boxLogo} onClick={handleNavigateHome}>
        <img src={imglogo} alt="Logo" />
        <h1>OnShelter</h1>
      </section>

      <button className={s.hamburger} onClick={toggleMenu} aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav className={`${s.nav} ${isMenuOpen ? s.navOpen : ''}`}>
        {!isLogged && (
          <div className={s.navGroup}>
            <a href="#" onClick={() => onNavigate('sobre')}>Quem somos</a>
            <a href="#" onClick={() => onNavigate('contato')}>Contato</a>
            <a href="#" onClick={handleNavigateLogin}>Entrar</a>
            <a href="#" onClick={handleNavigateRegister}>Registrar</a>
          </div>
        )}

        {isLogged && role === "user" && (
          <div className={s.navUser}>
            <a href="#" onClick={handleNavigateProfile} className={s.nameLink}>Olá, {userName || "Usuário"}</a>
            <div className={s.navLinks}>
              <a href="#" onClick={() => onNavigate('sobre')}>Quem somos</a>
              <a href="#" onClick={() => onNavigate('contato')}>Contato</a>
            </div>
            <button onClick={handleLogout}>Sair</button>
          </div>
        )}

        {isLogged && role === "manager" && (
          <div className={s.navUser}>
            <a href="#" onClick={handleNavigateProfile} className={s.nameLink}>Olá, {userName || "Usuário"}</a>
            <a href="#" onClick={handleNavigateShelter}>Gerenciar abrigo</a>
            <button onClick={handleLogout}>Sair</button>
          </div>
        )}

        {isLogged && role === "admin" && (
          <div className={s.navUser}>
            <a href="#" onClick={handleNavigateProfile} className={s.nameLink}>Olá, {userName || "Usuário"}</a>
            <a href="#" onClick={handleNavigateAdmin}>Painel de administrador</a>
            <button onClick={handleLogout}>Sair</button>
          </div>
        )}
      </nav>
    </header>
  )
}
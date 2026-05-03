import Header from "../../components/header/Header"
import s from "./Home.module.scss"
import Footer from "../../components/footer/Footer"
import { useNavigate } from "react-router-dom"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../../context/AuthContext"
import {jwtDecode} from "jwt-decode"
import api from "../../services/api"
import { FaUsers, FaSearch, FaHome, FaPaw, FaSpinner, FaMapPin, FaPhone } from "react-icons/fa"
import { MdLocalActivity } from "react-icons/md"

export default function Home() {
  const navigate = useNavigate()
  const { token } = useContext(AuthContext)
  const decoded = token ? jwtDecode(token) : null
  const role = decoded?.role || "user"
  const [abrigos, setAbrigos] = useState([])
  const [loadingAbrigos, setLoadingAbrigos] = useState(true)

  useEffect(() => {
    const loadAbrigos = async () => {
      try {
        const res = await api.get('/abrigos')
        setAbrigos(res.data.abrigos || [])
      } catch (err) {
        console.error('Erro ao carregar abrigos:', err)
      } finally {
        setLoadingAbrigos(false)
      }
    }
    loadAbrigos()
  }, [])

  const calcularPorcentagem = (atual, total) => {
    if (total === 0) return 0
    return Math.round((atual / total) * 100)
  }

  const getStatusColor = (porcentagem) => {
    if (porcentagem <= 50) return '#22c55e'
    if (porcentagem <= 80) return '#eab308'
    return '#ef4444'
  }

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
            <FaUsers className={s.boxIcon} />
            <h3>Estou Desabrigado</h3>
            <button onClick={NavigateDesabrigados}>Registrar</button>
          </div>

          <div className={s.boxDesabrigados}>
            <FaSearch className={s.boxIcon} />
            <h3>Consultar Abrigos/Pets/Desabrigados</h3>
            <button onClick={handleNavigateDesabrigados}>Consultar</button>
          </div>
          {showAbrigos && (
            <div className={s.boxAbrigados}>
              <FaHome className={s.boxIcon} />
              <h3>Quero Cadastrar um Abrigo</h3>
              <button onClick={navigateShelter}>Cadastrar</button>
            </div>
          )}
          <div className={s.boxPets}>
            <FaPaw className={s.boxIcon} />
            <h3>Perdi meu pet</h3>
            <button onClick={navigatePets}>Registrar</button>
          </div>
        </section>

        <section className={s.dashboardSection}>
          <h2><MdLocalActivity className={s.dashboardIcon} /> Disponibilidade de Abrigos</h2>
          {loadingAbrigos ? (
            <p className={s.loadingText}><FaSpinner className={s.spinner} /> Carregando dados dos abrigos...</p>
          ) : abrigos.length === 0 ? (
            <p className={s.emptyText}>Nenhum abrigo cadastrado ainda.</p>
          ) : (
            <div className={s.dashboardGrid}>
              {abrigos.map((abrigo) => {
                const porcentagem = calcularPorcentagem(abrigo.capacidade_atual, abrigo.capacidade_total)
                const statusColor = getStatusColor(porcentagem)
                const vagasDisponiveis = abrigo.capacidade_total - abrigo.capacidade_atual

                return (
                  <div key={abrigo.id} className={s.abrrigoCard}>
                    <div className={s.cardHeader}>
                      <div className={s.titleWithIcon}>
                        <FaHome className={s.cardIcon} />
                        <h3>{abrigo.nome}</h3>
                      </div>
                      <span className={s.enderecoSmall}>
                        <FaMapPin /> {abrigo.endereco}
                      </span>
                    </div>

                    <div className={s.occupancyMetric}>
                      <div className={s.progressBarContainer}>
                        <div
                          className={s.progressBar}
                          style={{
                            width: `${porcentagem}%`,
                            backgroundColor: statusColor,
                          }}
                        />
                      </div>
                      <div className={s.occupancyStats}>
                        <span className={s.percentage}>{porcentagem}% Ocupado</span>
                        <span className={s.numbers}>
                          {abrigo.capacidade_atual}/{abrigo.capacidade_total} pessoas
                        </span>
                        <span className={s.available}>
                          ✓ {vagasDisponiveis} vaga{vagasDisponiveis !== 1 ? 's' : ''} disponível{vagasDisponiveis !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {abrigo.aceita_pets && (
                      <div className={s.petsInfo}>
                        <h4><FaPaw /> Pets</h4>
                        <div className={s.petMetric}>
                          <div className={s.progressBarContainer}>
                            <div
                              className={s.progressBar}
                              style={{
                                width: `${calcularPorcentagem(abrigo.capacidade_atual_pets, abrigo.capacidade_pets)}%`,
                                backgroundColor: getStatusColor(calcularPorcentagem(abrigo.capacidade_atual_pets, abrigo.capacidade_pets)),
                              }}
                            />
                          </div>
                          <span className={s.petNumbers}>
                            {abrigo.capacidade_atual_pets}/{abrigo.capacidade_pets}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className={s.cardFooter}>
                      <span className={s.contact}><FaPhone /> {abrigo.contato}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
                
             
            </div>
          
       
      
      <Footer />
    </>
  )
}

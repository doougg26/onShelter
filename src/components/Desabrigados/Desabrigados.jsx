import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"
import Header from "../../components/header/Header"
import Footer from "../../components/footer/Footer"
import s from "./Desabrigados.module.scss"

export default function Desabrigados() {
  const [desabrigados, setDesabrigados] = useState([])
  const [pets, setPets] = useState([])
  const [abrigos, setAbrigos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const loadData = async () => {
      try {
        const [desabrigadosRes, petsRes, abrigosRes] = await Promise.all([
          api.get('/desabrigados'),
          api.get('/pets'),
          api.get('/abrigos')
        ])

        // Filtrar desabrigados com status "desabrigado" ou "buscando"
        const filteredDesabrigados = desabrigadosRes.data.filter(d => 
          d.status === 'BUSCANDO' || d.status === 'RESGATADO'
        )
        setDesabrigados(filteredDesabrigados)

        // Filtrar pets com status "perdido" ou "encontrado"
        const filteredPets = petsRes.data.pets.filter(p => 
          p.status === 'PERDIDO' || p.status === 'ENCONTRADO'
        )
        setPets(filteredPets)

        // Filtrar abrigos com lotação não máxima
        const filteredAbrigos = abrigosRes.data.abrigos.filter(a => 
          a.capacidade_atual < a.capacidade_total
        )
        setAbrigos(filteredAbrigos)

      } catch (err) {
        console.error('Erro ao carregar dados:', err)
        setError('Não foi possível carregar os dados.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleNavigateDesabrigado = (id) => {
    navigate(`/desabrigados/${id}/abrigos-proximos?from=consulta`)
  }

  // const handleNavigatePet = (id) => {
  //   // Talvez uma página de detalhes do pet
  //   // navigate(`/pets/${id}`)
  // }

  // const handleNavigateAbrigo = (id) => {
  //   // Talvez uma página de detalhes do abrigo
  //   // navigate(`/abrigos/${id}`)
  // }

  if (loading) {
    return (
      <>
        <Header />
        <div className={s.container}>
          <p>Carregando...</p>
        </div>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header />
        <div className={s.container}>
          <p>{error}</p>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className={s.container}>
        <h1>Desabrigados, Pets e Abrigos Disponíveis</h1>

        <section className={s.section}>
          <h2>Pessoas Desabrigadas</h2>
          {desabrigados.length === 0 ? (
            <p>Nenhuma pessoa desabrigada encontrada.</p>
          ) : (
            <div className={s.grid}>
              {desabrigados.map((desabrigado) => (
                <div key={desabrigado.id} className={s.card}>
                  <h3>{desabrigado.nome_completo}</h3>
                  <p><strong>Contato:</strong> {desabrigado.contato}</p>
                  <p><strong>CEP:</strong> {desabrigado.cep}</p>
                  <p><strong>Status:</strong> {desabrigado.status}</p>
                  <button onClick={() => handleNavigateDesabrigado(desabrigado.id)}>
                    Ver Abrigos Próximos
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={s.section}>
          <h2>Pets Perdidos ou Encontrados</h2>
          {pets.length === 0 ? (
            <p>Nenhum pet encontrado.</p>
          ) : (
            <div className={s.grid}>
              {pets.map((pet) => (
                <div key={pet.id} className={s.card}>
                  <h3>{pet.nome}</h3>
                  <p><strong>Espécie:</strong> {pet.especie}</p>
                  <p><strong>Raça:</strong> {pet.raca}</p>
                  <p><strong>Status:</strong> {pet.status}</p>
                  {/* <button onClick={() => handleNavigatePet(pet.id)}>
                    Ver Detalhes
                  </button> */}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={s.section}>
          <h2>Abrigos com Vagas Disponíveis</h2>
          {abrigos.length === 0 ? (
            <p>Nenhum abrigo com vagas encontrado.</p>
          ) : (
            <div className={s.grid}>
              {abrigos.map((abrigo) => (
                <div key={abrigo.id} className={s.card}>
                  <h3>{abrigo.nome}</h3>
                  <p><strong>Endereço:</strong> {abrigo.endereco}</p>
                  <p><strong>CEP:</strong> {abrigo.cep}</p>
                  <p><strong>Vagas:</strong> {abrigo.capacidade_atual}/{abrigo.capacidade_total}</p>
                  {/* <button onClick={() => handleNavigateAbrigo(abrigo.id)}>
                    Ver Detalhes
                  </button> */}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </>
  )
}
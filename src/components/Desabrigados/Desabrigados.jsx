import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"
import Header from "../../components/header/Header"
import Footer from "../../components/footer/Footer"
import petPlaceholder from "../../assets/img/pet_placeholder.svg"
import s from "./Desabrigados.module.scss"

export default function Desabrigados() {
  const [desabrigados, setDesabrigados] = useState([])
  const [pets, setPets] = useState([])
  const [abrigos, setAbrigos] = useState([])
  const [owners, setOwners] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // Estados para filtros e busca
  const [searchDesabrigados, setSearchDesabrigados] = useState('')
  const [filterStatusDesabrigados, setFilterStatusDesabrigados] = useState('')
  const [searchPets, setSearchPets] = useState('')
  const [filterStatusPets, setFilterStatusPets] = useState('')
  const [filterEspeciePets, setFilterEspeciePets] = useState('')
  const [searchAbrigos, setSearchAbrigos] = useState('')

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
         d.status === 'DESABRIGADO' || d.status === 'BUSCANDO' || d.status === 'ABRIGADO' 
        )
        setDesabrigados(filteredDesabrigados)

        // Filtrar pets com status "perdido" ou "encontrado"
        const filteredPets = petsRes.data.pets.filter(p => 
          p.status === 'PERDIDO' || p.status === 'ENCONTRADO'
        )
        setPets(filteredPets)

        // Buscar donos dos pets
        const uniqueOwnerIds = [...new Set(filteredPets.map(p => p.id_dono).filter(id => id))]
        if (uniqueOwnerIds.length > 0) {
          const ownerPromises = uniqueOwnerIds.map(id => 
            api.get(`/usuarios/${id}`).then(res => ({ id, data: res.data })).catch(() => ({ id, data: null }))
          )
          const ownersData = await Promise.all(ownerPromises)
          const ownersMap = ownersData.reduce((acc, { id, data }) => ({ ...acc, [id]: data }), {})
          setOwners(ownersMap)
        }

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

  const handlePetImageError = (event) => {
    event.target.src = petPlaceholder
  }

  // Funções de filtragem
  const filteredDesabrigados = desabrigados.filter(d => {
    const matchesSearch = d.nome_completo.toLowerCase().includes(searchDesabrigados.toLowerCase()) ||
                          d.contato.toLowerCase().includes(searchDesabrigados.toLowerCase()) ||
                          d.ultima_localizacao.includes(searchDesabrigados)
    const matchesStatus = filterStatusDesabrigados === '' || d.status === filterStatusDesabrigados
    return matchesSearch && matchesStatus
  })

  const filteredPets = pets.filter(p => {
    const searchLower = searchPets.toLowerCase()
    const matchesSearch = (p.nome && p.nome.toLowerCase().includes(searchLower)) ||
                          (p.especie && p.especie.toLowerCase().includes(searchLower)) ||
                          (p.raca && p.raca.toLowerCase().includes(searchLower)) ||
                          (p.descricao && p.descricao.toLowerCase().includes(searchLower))
    const matchesStatus = filterStatusPets === '' || p.status === filterStatusPets
    const matchesEspecie = filterEspeciePets === '' || (p.especie && p.especie === filterEspeciePets)
    return matchesSearch && matchesStatus && matchesEspecie
  })

  const filteredAbrigos = abrigos.filter(a => {
    const matchesSearch = a.nome.toLowerCase().includes(searchAbrigos.toLowerCase()) ||
                          a.endereco.toLowerCase().includes(searchAbrigos.toLowerCase()) ||
                          a.cep.includes(searchAbrigos)
    return matchesSearch
  })

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
          <div className={s.filters}>
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={searchDesabrigados}
              onChange={(e) => setSearchDesabrigados(e.target.value)}
              className={s.searchInput}
            />
            <select
              value={filterStatusDesabrigados}
              onChange={(e) => setFilterStatusDesabrigados(e.target.value)}
              className={s.filterSelect}
            >
              <option value="">Todos os Status</option>
              <option value="DESABRIGADO">Desabrigado</option>
              <option value="BUSCANDO">Buscando</option>
              <option value="RESGATADO">Resgatado</option>
            </select>
          </div>
          {filteredDesabrigados.length === 0 ? (
            <p>Nenhuma pessoa desabrigada encontrada.</p>
          ) : (
            <div className={s.grid}>
              {filteredDesabrigados.map((desabrigado) => (
                <div key={desabrigado.id} className={s.card}>
                  <h3>{desabrigado.nome_completo}</h3>
                  <p><strong>Contato:</strong> {desabrigado.contato}</p>
                  <p><strong>Ultima Localização:</strong> {desabrigado.ultima_localizacao}</p>
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
          <div className={s.filters}>
            <input
              type="text"
              placeholder="Buscar por nome, espécie, raça ou descrição..."
              value={searchPets}
              onChange={(e) => setSearchPets(e.target.value)}
              className={s.searchInput}
            />
            <select
              value={filterStatusPets}
              onChange={(e) => setFilterStatusPets(e.target.value)}
              className={s.filterSelect}
            >
              <option value="">Todos os Status</option>
              <option value="BUSCANDO">Perdido</option>
              <option value="ENCONTRADO">Encontrado</option>
            </select>
            <select
              value={filterEspeciePets}
              onChange={(e) => setFilterEspeciePets(e.target.value)}
              className={s.filterSelect}
            >
              <option value="">Todas as Espécies</option>
              <option value="Cachorro">Cachorro</option>
              <option value="Gato">Gato</option>
             <option value="">Outro</option>
            </select>
          </div>
          {filteredPets.length === 0 ? (
            <p>Nenhum pet encontrado.</p>
          ) : (
            <div className={s.grid}>
              {filteredPets.map((pet) => (
                <div key={pet.id} className={s.card}>
                  <img
                    className={s.petImage}
                    src={pet.foto_url || petPlaceholder}
                    alt={pet.nome ? `${pet.nome} foto` : 'Pet'}
                    onError={handlePetImageError}
                  />
                  <h3>{pet.nome || 'Nome não informado'}</h3>
                  <p><strong>Espécie:</strong> {pet.especie || 'Não informada'}</p>
                  <p><strong>Raça:</strong> {pet.raca || 'Não informada'}</p>
                  <p><strong>Status:</strong> {pet.status}</p>
                  <p><strong>Ultima Localização:</strong> {pet.descricao || 'Não informada'}</p>
                  {pet.id_dono && owners[pet.id_dono] && (
                    <>
                      <p><strong>Dono:</strong> {owners[pet.id_dono].nome_completo || 'Nome não informado'}</p>
                      <p><strong>Contato do Dono:</strong> {owners[pet.id_dono].telefone || owners[pet.id_dono].email || 'Não informado'}</p>
                    </>
                  )}
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
          <div className={s.filters}>
            <input
              type="text"
              placeholder="Buscar por nome, endereço ou CEP..."
              value={searchAbrigos}
              onChange={(e) => setSearchAbrigos(e.target.value)}
              className={s.searchInput}
            />
          </div>
          {filteredAbrigos.length === 0 ? (
            <p>Nenhum abrigo com vagas encontrado.</p>
          ) : (
            <div className={s.grid}>
              {filteredAbrigos.map((abrigo) => (
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
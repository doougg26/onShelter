import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import { jwtDecode } from "jwt-decode"
import api from "../../services/api"
import Header from "../../components/header/Header"
import Footer from "../../components/footer/Footer"
import s from "./GerenciaPets.module.scss"

export default function GerenciaPets() {
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({})
  const [role, setRole] = useState(null)
  const navigate = useNavigate()
  const { token } = useContext(AuthContext)

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token)
        setRole(decoded.role)
      } catch (error) {
        console.error("Erro ao decodificar token:", error)
      }
    }
    loadData()
  }, [token])

  const loadData = async () => {
    try {
      const res = await api.get('/pets')
      setPets(res.data.pets)
    } catch (err) {
      console.error('Erro ao carregar pets:', err)
      setError('Não foi possível carregar os pets.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (pet) => {
    setEditing(pet.id)
    setFormData(pet)
  }

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSave = async (id) => {
    try {
      await api.put(`/pets/${id}`, {
        nome: formData.nome,
        especie: formData.especie,
        raca: formData.raca,
        genero: formData.genero,
        tamanho: formData.tamanho,
        foto_url: formData.foto_url,
        descricao: formData.descricao || null,
        id_dono: formData.id_dono ? parseInt(formData.id_dono, 10) : null,
        id_abrigo: formData.id_abrigo ? parseInt(formData.id_abrigo, 10) : null,
        status: formData.status
      })
      setEditing(null)
      loadData()
    } catch (err) {
      console.error('Erro ao salvar edição:', err)
      alert('Erro ao salvar edição. Veja o console para detalhes.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este pet?')) return
    try {
      await api.delete(`/pets/${id}`)
      loadData()
    } catch (err) {
      console.error('Erro ao remover pet:', err)
      alert('Erro ao remover pet. Veja o console para detalhes.')
    }
  }

  const handleBack = () => {
    navigate("/admin")
  }

  if (loading) {
    return <div className={s.adminContainer}><p>Carregando pets...</p></div>
  }

  if (error) {
    return <div className={s.adminContainer}><p>{error}</p></div>
  }

  return (
    <>
      <Header />
      <div className={s.adminContainer}>
        <h1>Gerenciar Pets</h1>
        {role === "admin" && (
          <button onClick={handleBack} style={{ marginBottom: '20px' }}>Voltar ao Painel</button>
        )}

        <table className={s.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Espécie</th>
              <th>Raça</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pets.map((pet) => (
              <tr key={pet.id}>
                <td>{pet.id}</td>
                <td>{editing === pet.id ? <input value={formData.nome || ''} onChange={(e) => handleChange('nome', e.target.value)} /> : pet.nome}</td>
                <td>{editing === pet.id ? <input value={formData.especie || ''} onChange={(e) => handleChange('especie', e.target.value)} /> : pet.especie}</td>
                <td>{editing === pet.id ? <input value={formData.raca || ''} onChange={(e) => handleChange('raca', e.target.value)} /> : pet.raca}</td>
                <td>{editing === pet.id ? <input value={formData.status || ''} onChange={(e) => handleChange('status', e.target.value)} /> : pet.status}</td>
                <td className={s.actionsCell}>
                  {editing === pet.id ? (
                    <>
                      <button onClick={() => handleSave(pet.id)}>Salvar</button>
                      <button onClick={() => setEditing(null)}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(pet)}>Editar</button>
                      <button onClick={() => handleDelete(pet.id)}>Remover</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Footer />
    </>
  )
}
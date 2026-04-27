import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import { jwtDecode } from "jwt-decode"
import api from "../../services/api"
import Header from "../../components/header/Header"
import Footer from "../../components/footer/Footer"
import s from "./GerenciaAbrigos.module.scss"

export default function GerenciaAbrigos() {
  const [abrigos, setAbrigos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({})
  const [role, setRole] = useState(null)
  const [userId, setUserId] = useState(null)
  const navigate = useNavigate()
  const { token } = useContext(AuthContext)

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token)
        setRole(decoded.role)
        setUserId(decoded.id)
      } catch (error) {
        console.error("Erro ao decodificar token:", error)
      }
    }
    loadData()
  }, [token])

  const loadData = async () => {
    try {
      const res = await api.get('/abrigos')
      let filteredAbrigos = res.data.abrigos
      if (role === "manager" && userId) {
        filteredAbrigos = res.data.abrigos.filter(abrigo => abrigo.gerente_id === userId)
      }
      setAbrigos(filteredAbrigos)
    } catch (err) {
      console.error('Erro ao carregar abrigos:', err)
      setError('Não foi possível carregar os abrigos.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (abrigo) => {
    if (role === "manager" && abrigo.gerente_id !== userId) {
      alert("Você só pode editar o abrigo associado à sua conta.")
      return
    }
    setEditing(abrigo.id)
    setFormData(abrigo)
  }

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSave = async (id) => {
    try {
      await api.put(`/abrigos/${id}`, {
        nome: formData.nome,
        endereco: formData.endereco,
        cep: formData.cep,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        capacidade_total: parseInt(formData.capacidade_total, 10),
        capacidade_atual: parseInt(formData.capacidade_atual, 10),
        aceita_pets: formData.aceita_pets === true || formData.aceita_pets === 'true',
        capacidade_pets: parseInt(formData.capacidade_pets, 10),
        capacidade_atual_pets: parseInt(formData.capacidade_atual_pets, 10),
        contato: formData.contato,
        gerente_id: formData.gerente_id,
        verificacao: formData.verificacao === true || formData.verificacao === 'true'
      })
      setEditing(null)
      loadData()
    } catch (err) {
      console.error('Erro ao salvar edição:', err)
      alert('Erro ao salvar edição. Veja o console para detalhes.')
    }
  }

  const handleDelete = async (id) => {
    const abrigo = abrigos.find(a => a.id === id)
    if (role === "manager" && abrigo && abrigo.gerente_id !== userId) {
      alert("Você só pode remover o abrigo associado à sua conta.")
      return
    }
    if (!window.confirm('Tem certeza que deseja remover este abrigo?')) return
    try {
      await api.delete(`/abrigos/${id}`)
      loadData()
    } catch (err) {
      console.error('Erro ao remover abrigo:', err)
      alert('Erro ao remover abrigo. Veja o console para detalhes.')
    }
  }

  const handleBack = () => {
    navigate("/admin")
  }

  if (loading) {
    return <div className={s.adminContainer}><p>Carregando abrigos...</p></div>
  }

  if (error) {
    return <div className={s.adminContainer}><p>{error}</p></div>
  }

  return (
    <>
      <Header />
      <div className={s.adminContainer}>
        <h1>Gerenciar Abrigos</h1>
        {role === "admin" && (
          <button onClick={handleBack} style={{ marginBottom: '20px' }}>Voltar ao Painel</button>
        )}

        <table className={s.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Endereço</th>
              <th>CEP</th>
              <th>Capacidade atual</th>
              <th>Capacidade total</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {abrigos.map((abrigo) => (
              <tr key={abrigo.id}>
                <td>{abrigo.id}</td>
                <td>{editing === abrigo.id ? <input value={formData.nome || ''} onChange={(e) => handleChange('nome', e.target.value)} /> : abrigo.nome}</td>
                <td>{editing === abrigo.id ? <input value={formData.endereco || ''} onChange={(e) => handleChange('endereco', e.target.value)} /> : abrigo.endereco}</td>
                <td>{editing === abrigo.id ? <input value={formData.cep || ''} onChange={(e) => handleChange('cep', e.target.value)} /> : abrigo.cep}</td>
                <td>{editing === abrigo.id ? <input value={formData.capacidade_atual || ''} onChange={(e) => handleChange('capacidade_atual', e.target.value)} /> : abrigo.capacidade_atual}</td>
                <td>{editing === abrigo.id ? <input value={formData.capacidade_total || ''} onChange={(e) => handleChange('capacidade_total', e.target.value)} /> : abrigo.capacidade_total}</td>
                <td className={s.actionsCell}>
                  {editing === abrigo.id ? (
                    <>
                      <button onClick={() => handleSave(abrigo.id)}>Salvar</button>
                      <button onClick={() => setEditing(null)}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(abrigo)}>Editar</button>
                      <button onClick={() => handleDelete(abrigo.id)}>Remover</button>
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
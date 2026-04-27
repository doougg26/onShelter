import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import { jwtDecode } from "jwt-decode"
import api from "../../services/api"
import Header from "../../components/header/Header"
import Footer from "../../components/footer/Footer"
import s from "./GerenciaDesabrigados.module.scss"

export default function GerenciaDesabrigados() {
  const [desabrigados, setDesabrigados] = useState([])
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
      const res = await api.get('/desabrigados')
      setDesabrigados(res.data)
    } catch (err) {
      console.error('Erro ao carregar desabrigados:', err)
      setError('Não foi possível carregar os desabrigados.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (desabrigado) => {
    setEditing(desabrigado.id)
    setFormData(desabrigado)
  }

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSave = async (id) => {
    try {
      await api.put(`/desabrigados/${id}`, {
        nome_completo: formData.nome_completo,
        tamanho_familia: formData.tamanho_familia,
        contato: formData.contato,
        cep: formData.cep,
        latitude: formData.latitude,
        longitude: formData.longitude,
        id_abrigo_atual: formData.id_abrigo_atual ? parseInt(formData.id_abrigo_atual, 10) : null,
        status: formData.status,
        detalhes_medicos: formData.detalhes_medicos
      })
      setEditing(null)
      loadData()
    } catch (err) {
      console.error('Erro ao salvar edição:', err)
      alert('Erro ao salvar edição. Veja o console para detalhes.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este desabrigado?')) return
    try {
      await api.delete(`/desabrigados/${id}`)
      loadData()
    } catch (err) {
      console.error('Erro ao remover desabrigado:', err)
      alert('Erro ao remover desabrigado. Veja o console para detalhes.')
    }
  }

  const handleBack = () => {
    navigate("/admin")
  }

  if (loading) {
    return <div className={s.adminContainer}><p>Carregando desabrigados...</p></div>
  }

  if (error) {
    return <div className={s.adminContainer}><p>{error}</p></div>
  }

  return (
    <>
      <Header />
      <div className={s.adminContainer}>
        <h1>Gerenciar Desabrigados</h1>
        {role === "admin" && (
          <button onClick={handleBack} style={{ marginBottom: '20px' }}>Voltar ao Painel</button>
        )}

        <table className={s.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Contato</th>
              <th>CEP</th>
              <th>Status</th>
              <th>Abrigo Atual</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {desabrigados.map((desabrigado) => (
              <tr key={desabrigado.id}>
                <td>{desabrigado.id}</td>
                <td>{editing === desabrigado.id ? <input value={formData.nome_completo || ''} onChange={(e) => handleChange('nome_completo', e.target.value)} /> : desabrigado.nome_completo}</td>
                <td>{editing === desabrigado.id ? <input value={formData.contato || ''} onChange={(e) => handleChange('contato', e.target.value)} /> : desabrigado.contato}</td>
                <td>{editing === desabrigado.id ? <input value={formData.cep || ''} onChange={(e) => handleChange('cep', e.target.value)} /> : desabrigado.cep}</td>
                <td>{editing === desabrigado.id ? <input value={formData.status || ''} onChange={(e) => handleChange('status', e.target.value)} /> : desabrigado.status}</td>
                <td>{editing === desabrigado.id ? <input value={formData.id_abrigo_atual || ''} onChange={(e) => handleChange('id_abrigo_atual', e.target.value)} /> : desabrigado.id_abrigo_atual}</td>
                <td className={s.actionsCell}>
                  {editing === desabrigado.id ? (
                    <>
                      <button onClick={() => handleSave(desabrigado.id)}>Salvar</button>
                      <button onClick={() => setEditing(null)}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(desabrigado)}>Editar</button>
                      <button onClick={() => handleDelete(desabrigado.id)}>Remover</button>
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
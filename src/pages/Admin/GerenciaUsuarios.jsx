import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import { jwtDecode } from "jwt-decode"
import api from "../../services/api"
import Header from "../../components/header/Header"
import Footer from "../../components/footer/Footer"
import s from "./GerenciaUsuarios.module.scss"

export default function GerenciaUsuarios() {
  const [usuarios, setUsuarios] = useState([])
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
      const res = await api.get('/usuarios')
      setUsuarios(res.data)
    } catch (err) {
      console.error('Erro ao carregar usuários:', err)
      setError('Não foi possível carregar os usuários.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user) => {
    setEditing(user.id)
    setFormData(user)
  }

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSave = async (id) => {
    try {
      await api.put(`/usuarios/${id}`, {
        nome_completo: formData.nome_completo,
        telefone: formData.telefone,
        email: formData.email,
        role: formData.role,
        hash_senha: formData.hash_senha || undefined
      })
      setEditing(null)
      loadData()
    } catch (err) {
      console.error('Erro ao salvar edição:', err)
      alert('Erro ao salvar edição. Veja o console para detalhes.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este usuário?')) return
    try {
      await api.delete(`/usuarios/${id}`)
      loadData()
    } catch (err) {
      console.error('Erro ao remover usuário:', err)
      alert('Erro ao remover usuário. Veja o console para detalhes.')
    }
  }

  const handleBack = () => {
    navigate("/admin")
  }

  if (loading) {
    return <div className={s.adminContainer}><p>Carregando usuários...</p></div>
  }

  if (error) {
    return <div className={s.adminContainer}><p>{error}</p></div>
  }

  return (
    <>
      <Header />
      <div className={s.adminContainer}>
        <h1>Gerenciar Usuários</h1>
        {role === "admin" && (
          <button onClick={handleBack} style={{ marginBottom: '20px' }}>Voltar ao Painel</button>
        )}

        <table className={s.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Role</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>
                  {editing === user.id ? (
                    <input value={formData.nome_completo || ''} onChange={(e) => handleChange('nome_completo', e.target.value)} />
                  ) : (
                    user.nome_completo
                  )}
                </td>
                <td>
                  {editing === user.id ? (
                    <input value={formData.email || ''} onChange={(e) => handleChange('email', e.target.value)} />
                  ) : (
                    user.email
                  )}
                </td>
                <td>
                  {editing === user.id ? (
                    <input value={formData.telefone || ''} onChange={(e) => handleChange('telefone', e.target.value)} />
                  ) : (
                    user.telefone
                  )}
                </td>
                <td>
                  {editing === user.id ? (
                    <select value={formData.role || ''} onChange={(e) => handleChange('role', e.target.value)}>
                      <option value="user">user</option>
                      <option value="manager">manager</option>
                      <option value="admin">admin</option>
                    </select>
                  ) : (
                    user.role
                  )}
                </td>
                <td className={s.actionsCell}>
                  {editing === user.id ? (
                    <>
                      <input
                        type="password"
                        placeholder="Nova senha (opcional)"
                        value={formData.hash_senha || ''}
                        onChange={(e) => handleChange('hash_senha', e.target.value)}
                        className={s.smallInput}
                      />
                      <button onClick={() => handleSave(user.id)}>Salvar</button>
                      <button onClick={() => setEditing(null)}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(user)}>Editar</button>
                      <button onClick={() => handleDelete(user.id)}>Remover</button>
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
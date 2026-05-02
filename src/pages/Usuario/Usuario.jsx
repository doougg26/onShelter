import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import { jwtDecode } from "jwt-decode"
import api from "../../services/api"
import Header from "../../components/header/Header"
import Footer from "../../components/footer/Footer"
import s from "./Usuario.module.scss"
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Usuario() {
  const { logout, token } = useContext(AuthContext)
  const navigate = useNavigate()
  const [userId, setUserId] = useState(null)
  const [role, setRole] = useState(null)
  const [userData, setUserData] = useState(null)
  const [desabrigadoData, setDesabrigadoData] = useState(null)
  const [abrigoData, setAbrigoData] = useState(null)
  const [usuariosAbrigo, setUsuariosAbrigo] = useState([])
  const [petsData, setPetsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) {
      navigate("/login")
      return
    }

    try {
      const decoded = jwtDecode(token)
      setUserId(decoded.id)
      setRole(decoded.role)
      loadUserData(decoded.id, decoded.role)
    } catch (error) {
      console.error("Erro ao decodificar token:", error)
      navigate("/login")
    }
  }, [token])

  const loadUserData = async (id, userRole) => {
    try {
      setLoading(true)
      
      // Carrega dados do usuário
      const userRes = await api.get(`/usuarios/${id}`)
      setUserData(userRes.data)
      setEditData(userRes.data)

      // Se é usuário comum, carrega dados de desabrigado
      if (userRole === "user") {
        try {
          const desRes = await api.get(`/desabrigados/usuario/${id}`)
          if (desRes.data) {
            setDesabrigadoData(desRes.data)

            // Se tem abrigo vinculado, carrega dados do abrigo
            if (desRes.data.id_abrigo_atual) {
              const abRes = await api.get(`/abrigos/${desRes.data.id_abrigo_atual}`)
              setAbrigoData(abRes.data.abrigo)
            }
          }
        } catch (err) {
          console.log("Usuário não tem perfil de desabrigado", err)
          toast.error("Usuário não tem perfil de desabrigado")
        }

        // Carrega pets do usuário
        try {
          const petsRes = await api.get(`/pets`)
          const petsFiltrados = petsRes.data.pets.filter(pet => pet.id_dono === id)
          setPetsData(petsFiltrados)
        } catch (err) {
          console.log("Erro ao carregar pets", err)
          toast.error("Erro ao carregar pets")
        }
      }

      // Se é manager, carrega dados do abrigo e usuários
      if (userRole === "manager") {
        try {
          const abRes = await api.get(`/abrigos`)
          const abrigo = abRes.data.abrigos.find(a => a.gerente_id === id)
          if (abrigo) {
            setAbrigoData(abrigo)

            // Carrega usuários no abrigo
            const desRes = await api.get(`/desabrigados`)
            const usuariosNoAbrigo = desRes.data.filter(
              d => d.id_abrigo_atual === abrigo.id
            )
            setUsuariosAbrigo(usuariosNoAbrigo)

            // Carrega pets no abrigo
            const petsRes = await api.get(`/pets`)
            const petsNoAbrigo = petsRes.data.pets.filter(
              p => p.id_abrigo === abrigo.id
            )
            setPetsData(petsNoAbrigo)
          }
        } catch (err) {
          console.error("Erro ao carregar dados do abrigo:", err)
          toast.error("Erro ao carregar dados do abrigo")
        }
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err)
      setError("Erro ao carregar dados do perfil")
      toast.error("Erro ao carregar dados do perfil" ) 
    } finally {
      setLoading(false)
    }
  }

  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveUser = async () => {
    try {
      const dataToUpdate = {
        nome_completo: editData.nome_completo,
        telefone: editData.telefone,
        email: editData.email
      }
      
      await api.put(`/usuarios/${userId}`, dataToUpdate)
      setUserData(editData)
      setEditing(false)
      toast.success("Perfil atualizado com sucesso!")
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err)
      toast.error("Erro ao atualizar perfil")
    }
  }

  const handleDeleteUser = async () => {
    if (!window.confirm("Tem certeza que deseja deletar sua conta?")) return

    try {
      if (desabrigadoData) {
        await api.delete(`/desabrigados/${desabrigadoData.id}`)
      }

      const pets = await api.get(`/pets`)
      const userPets = pets.data.pets.filter(p => p.id_dono === userId)
      for (const pet of userPets) {
        await api.delete(`/pets/${pet.id}`)
      }

      await api.delete(`/usuarios/${userId}`)
      logout()
      navigate("/login")
    } catch (err) {
      console.error("Erro ao deletar conta:", err)
      toast.error("Erro ao deletar conta")
    }
  }

  const handleUnlinkShelter = async () => {
    if (!desabrigadoData || !abrigoData) return
    if (!window.confirm("Tem certeza que deseja se desvincular do abrigo?")) return

    try {
      const novaCapacidade = abrigoData.capacidade_atual - desabrigadoData.tamanho_familia

      await api.put(`/desabrigados/${desabrigadoData.id}`, {
        ...desabrigadoData,
        id_abrigo_atual: null,
        status: "sem_abrigo"
      })

      await api.put(`/abrigos/${abrigoData.id}`, {
        ...abrigoData,
        capacidade_atual: novaCapacidade
      })

      // Atualiza pets para remover do abrigo
      const userPets = petsData.filter(p => p.id_dono === userId)
      for (const pet of userPets) {
        if (pet.id_abrigo === abrigoData.id) {
          const novaCapacidadePets = abrigoData.capacidade_atual_pets - 1
          await api.put(`/pets/${pet.id}`, {
            ...pet,
            id_abrigo: null,
            status: "perdido"
          })
          
          await api.put(`/abrigos/${abrigoData.id}`, {
            ...abrigoData,
            capacidade_atual_pets: novaCapacidadePets
          })
        }
      }

      loadUserData(userId, role)
      toast.success("Desvinculado do abrigo com sucesso!")
    } catch (err) {
      console.error("Erro ao desvincular do abrigo:", err)
      toast.error("Erro ao desvincular do abrigo")
    }
  }

  const handleDeleteDesabrigado = async () => {
    if (!desabrigadoData) return
    if (!window.confirm("Tem certeza que deseja deletar seu perfil de desabrigado?")) return

    try {
      if (desabrigadoData.id_abrigo_atual && abrigoData) {
        const novaCapacidade = abrigoData.capacidade_atual - desabrigadoData.tamanho_familia
        await api.put(`/abrigos/${abrigoData.id}`, {
          ...abrigoData,
          capacidade_atual: novaCapacidade
        })
      }

      await api.delete(`/desabrigados/${desabrigadoData.id}`)
      loadUserData(userId, role)
      toast.success("Perfil de desabrigado deletado com sucesso!")
    } catch (err) {
      console.error("Erro ao deletar perfil de desabrigado:", err)
      toast.error("Erro ao deletar perfil de desabrigado")
    }
  }

  const handleDeletePet = async (petId) => {
    if (!window.confirm("Tem certeza que deseja deletar este pet?")) return

    try {
      const pet = petsData.find(p => p.id === petId)
      
      if (pet && pet.id_abrigo && abrigoData && role === "user") {
        const novaCapacidadePets = abrigoData.capacidade_atual_pets - 1
        await api.put(`/abrigos/${abrigoData.id}`, {
          ...abrigoData,
          capacidade_atual_pets: novaCapacidadePets
        })
      }

      await api.delete(`/pets/${petId}`)
      setPetsData(petsData.filter(p => p.id !== petId))
      toast.success("Pet deletado com sucesso!")
    } catch (err) {
      console.error("Erro ao deletar pet:", err)
      toast.error("Erro ao deletar pet")
    }
  }

  const handleRemoveUserFromShelter = async (usuarioId) => {
    const usuario = usuariosAbrigo.find(u => u.id === usuarioId)
    if (!usuario) return
    if (!window.confirm(`Tem certeza que deseja remover ${usuario.nome_completo} do abrigo?`)) return

    try {
      const novaCapacidade = abrigoData.capacidade_atual - usuario.tamanho_familia
      
      await api.put(`/desabrigados/${usuarioId}`, {
        ...usuario,
        id_abrigo_atual: null,
        status: "sem_abrigo"
      })

      await api.put(`/abrigos/${abrigoData.id}`, {
        ...abrigoData,
        capacidade_atual: novaCapacidade
      })

      // Remove pets do usuário do abrigo
      const userPets = petsData.filter(p => p.id_dono === usuarioId)
      let novaCapacidadePets = abrigoData.capacidade_atual_pets
      for (const pet of userPets) {
        if (pet.id_abrigo === abrigoData.id) {
          novaCapacidadePets -= 1
          await api.put(`/pets/${pet.id}`, {
            ...pet,
            id_abrigo: null,
            status: "perdido"
          })
        }
      }

      if (novaCapacidadePets !== abrigoData.capacidade_atual_pets) {
        await api.put(`/abrigos/${abrigoData.id}`, {
          ...abrigoData,
          capacidade_atual_pets: novaCapacidadePets
        })
      }

      loadUserData(userId, role)
      toast.success("Usuário removido do abrigo com sucesso!")
    } catch (err) {
      console.error("Erro ao remover usuário:", err)
      toast.error("Erro ao remover usuário do abrigo")
    }
  }

  const handleRemovePetFromShelter = async (petId) => {
    const pet = petsData.find(p => p.id === petId)
    if (!pet) return
    if (!window.confirm(`Tem certeza que deseja remover ${pet.nome} do abrigo?`)) return

    try {
      const novaCapacidadePets = abrigoData.capacidade_atual_pets - 1

      await api.put(`/pets/${petId}`, {
        ...pet,
        id_abrigo: null,
        status: "perdido"
      })

      await api.put(`/abrigos/${abrigoData.id}`, {
        ...abrigoData,
        capacidade_atual_pets: novaCapacidadePets
      })

      loadUserData(userId, role)
      toast.success("Pet removido do abrigo com sucesso!")
    } catch (err) {
      console.error("Erro ao remover pet:", err)
      toast.error("Erro ao remover pet do abrigo")
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className={s.container}>
          <p>Carregando perfil...</p>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className={s.container}>
        <h1>Meu Perfil</h1>

        {error && <div className={s.error}>{error}</div>}

        {/* Seção de Dados do Usuário */}
        <section className={s.section}>
          <h2>Dados Pessoais</h2>
          {editing ? (
            <div className={s.form}>
              <div className={s.formGroup}>
                <label>Nome Completo:</label>
                <input
                  type="text"
                  value={editData.nome_completo || ""}
                  onChange={(e) => handleEditChange("nome_completo", e.target.value)}
                />
              </div>
              <div className={s.formGroup}>
                <label>Telefone:</label>
                <input
                  type="text"
                  value={editData.telefone || ""}
                  onChange={(e) => handleEditChange("telefone", e.target.value)}
                />
              </div>
              <div className={s.formGroup}>
                <label>Email:</label>
                <input
                  type="email"
                  value={editData.email || ""}
                  onChange={(e) => handleEditChange("email", e.target.value)}
                />
              </div>
              <div className={s.formGroup}>

              </div>
              <div className={s.buttonGroup}>
                <button onClick={handleSaveUser} className={s.saveBtn}>
                  Salvar
                </button>
                <button onClick={() => setEditing(false)} className={s.cancelBtn}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className={s.info}>
              <p>
                <strong>Nome:</strong> {userData?.nome_completo}
              </p>
              <p>
                <strong>Telefone:</strong> {userData?.telefone}
              </p>
              <p>
                <strong>Email:</strong> {userData?.email}
              </p>
              <p>
                <strong> Perfil:</strong> {userData?.role}
              </p>
              <div className={s.buttonGroup}>
                <button onClick={() => setEditing(true)} className={s.editBtn}>
                  Editar
                </button>
                <button onClick={handleDeleteUser} className={s.deleteBtn}>
                  Deletar Conta
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Seção de Desabrigado (apenas para usuários comuns) */}
        {role === "user" && desabrigadoData && (
          <section className={s.section}>
            <h2>Dados de Desabrigado</h2>
            <div className={s.info}>
              <p>
                <strong>Nome:</strong> {desabrigadoData.nome_completo}
              </p>
              <p>
                <strong>Tamanho da Família:</strong> {desabrigadoData.tamanho_familia}
              </p>
              <p>
                <strong>Contato:</strong> {desabrigadoData.contato}
              </p>
              <p>
                <strong>CEP:</strong> {desabrigadoData.cep}
              </p>
              <p>
                <strong>Status:</strong> {desabrigadoData.status}
              </p>
              <p>
                <strong>Detalhes Médicos:</strong> {desabrigadoData.detalhes_medicos || "N/A"}
              </p>
              <div className={s.buttonGroup}>
                <button onClick={handleDeleteDesabrigado} className={s.deleteBtn}>
                  Deletar Perfil de Desabrigado
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Seção de Abrigo Vinculado (usuários comuns) */}
        {role === "user" && abrigoData && (
          <section className={s.section}>
            <h2>Abrigo Vinculado</h2>
            <div className={s.info}>
              <p>
                <strong>Nome:</strong> {abrigoData.nome}
              </p>
              <p>
                <strong>Endereço:</strong> {abrigoData.endereco}
              </p>
              <p>
                <strong>Contato:</strong> {abrigoData.contato}
              </p>
              <p>
                <strong>Capacidade:</strong> {abrigoData.capacidade_atual}/{abrigoData.capacidade_total}
              </p>
              <div className={s.buttonGroup}>
                <button onClick={handleUnlinkShelter} className={s.unlinkBtn}>
                  Desvincular do Abrigo
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Seção de Pets (usuários comuns) */}
        {role === "user" && petsData.length > 0 && (
          <section className={s.section}>
            <h2>Meus Pets ({petsData.length})</h2>
            <div className={s.petsList}>
              {petsData.map(pet => (
                <div key={pet.id} className={s.petCard}>
                  <h3>{pet.nome}</h3>
                  <p>
                    <strong>Espécie:</strong> {pet.especie}
                  </p>
                  <p>
                    <strong>Raça:</strong> {pet.raca}
                  </p>
                  <p>
                    <strong>Gênero:</strong> {pet.genero}
                  </p>
                  <p>
                    <strong>Tamanho:</strong> {pet.tamanho}
                  </p>
                  <p>
                    <strong>Status:</strong> {pet.status}
                  </p>
                  {pet.id_abrigo && (
                    <p>
                      <strong>No Abrigo:</strong> {abrigoData?.nome}
                    </p>
                  )}
                  <div className={s.buttonGroup}>
                    <button onClick={() => handleDeletePet(pet.id)} className={s.deleteBtn}>
                      Deletar Pet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Seção do Abrigo (apenas para managers) */}
        {role === "manager" && abrigoData && (
          <section className={s.section}>
            <h2>Meu Abrigo</h2>
            <div className={s.info}>
              <p>
                <strong>Nome:</strong> {abrigoData.nome}
              </p>
              <p>
                <strong>Endereço:</strong> {abrigoData.endereco}
              </p>
              <p>
                <strong>CEP:</strong> {abrigoData.cep}
              </p>
              <p>
                <strong>Contato:</strong> {abrigoData.contato}
              </p>
              <p>
                <strong>Capacidade:</strong> {abrigoData.capacidade_atual}/{abrigoData.capacidade_total}
              </p>
              <p>
                <strong>Aceita Pets:</strong> {abrigoData.aceita_pets ? "Sim" : "Não"}
              </p>
              {abrigoData.aceita_pets && (
                <p>
                  <strong>Capacidade de Pets:</strong> {abrigoData.capacidade_atual_pets}/{abrigoData.capacidade_pets}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Seção de Usuários no Abrigo (managers) */}
        {role === "manager" && usuariosAbrigo.length > 0 && (
          <section className={s.section}>
            <h2>Usuários no Abrigo ({usuariosAbrigo.length})</h2>
            <div className={s.usersList}>
              {usuariosAbrigo.map(usuario => (
                <div key={usuario.id} className={s.userCard}>
                  <h3>{usuario.nome_completo}</h3>
                  <p>
                    <strong>Família:</strong> {usuario.tamanho_familia}
                  </p>
                  <p>
                    <strong>Contato:</strong> {usuario.contato}
                  </p>
                  <p>
                    <strong>Status:</strong> {usuario.status}
                  </p>
                  <div className={s.buttonGroup}>
                    <button
                      onClick={() => handleRemoveUserFromShelter(usuario.id)}
                      className={s.deleteBtn}
                    >
                      Remover do Abrigo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Seção de Pets no Abrigo (managers) */}
        {role === "manager" && petsData.length > 0 && (
          <section className={s.section}>
            <h2>Pets no Abrigo ({petsData.length})</h2>
            <div className={s.petsList}>
              {petsData.map(pet => (
                <div key={pet.id} className={s.petCard}>
                  <h3>{pet.nome}</h3>
                  <p>
                    <strong>Dono:</strong> {pet.id_dono ? `Usuário #${pet.id_dono}` : "Sem dono"}
                  </p>
                  <p>
                    <strong>Espécie:</strong> {pet.especie}
                  </p>
                  <p>
                    <strong>Raça:</strong> {pet.raca}
                  </p>
                  <p>
                    <strong>Tamanho:</strong> {pet.tamanho}
                  </p>
                  <div className={s.buttonGroup}>
                    <button
                      onClick={() => handleRemovePetFromShelter(pet.id)}
                      className={s.deleteBtn}
                    >
                      Remover do Abrigo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {role === "user" && !desabrigadoData && (
          <div className={s.noDataMessage}>
            <p>Você ainda não tem um perfil de desabrigado. Crie um para acessar recursos especiais.</p>
          </div>
        )}

        {role === "manager" && !abrigoData && (
          <div className={s.noDataMessage}>
            <p>Nenhum abrigo vinculado à sua conta.</p>
          </div>
        )}
      </div>
      <Footer />

      <ToastContainer
        position="top-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </>
  )
}

// CAMPOS DA TABELA DESABRIGADDOS: usuario_id, nome_completo, tamanho_familia, contato, cep, latitude, longitude, id_abrigo_atual, status, detalhes_medicos

import s from "./RegistroDesabrigados.module.scss"
import api from "../../services/api"
// import { cepApi } from "../../services/api"
import { useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import {jwtDecode} from "jwt-decode"
import Header from "../../components/header/Header"
import Footer from "../../components/footer/Footer"

export default function RegistroDesabrigados() {
  const [usuario_id, setUsuario_id] = useState("")
  const [nome_completo, setNome_completo] = useState("")
  const [tamanho_familia, setTamanho_familia] = useState(1)
  const [contato, setContato] = useState("")
  const [cep, setCep] = useState("")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [id_abrigo_atual, setId_abrigo_atual] = useState("")
  const [status, setStatus] = useState("")
  const [detalhes_medicos, setDetalhes_medicos] = useState("")
  const [authUserId, setAuthUserId] = useState(null)
  const [autoFilled, setAutoFilled] = useState({ usuario_id: false, nome_completo: false, contato: false })

  const navigate = useNavigate()
  const { token } = useContext(AuthContext)

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    const decoded = jwtDecode(token)
    setAuthUserId(decoded.id)
  }, [token, navigate])

  // async function buscarEndereco() {
  //   try {
  //     const resposta = await cepApi.get(`/${cep}`)
  //     // cep API não retorna endereço completo; mantemos apenas o CEP no formulário
  //     alert('CEP encontrado:', resposta.data.location.coordinate[0])
  //   } catch (error) {
  //     console.error('Erro ao buscar endereço:', error)
  //   }
  // }

  const buscarLocalizacao = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada pelo navegador.')
      return
    }

    navigator.geolocation.getCurrentPosition((position) => {
      setLatitude(position.coords.latitude.toString())
      setLongitude(position.coords.longitude.toString())
    }, (error) => {
      console.error('Erro ao obter localização:', error)
      alert('Não foi possível obter a localização. Verifique as permissões do navegador.')
    })
  }

  const preencherComMeusDados = async () => {
    if (!authUserId) return

    try {
      const response = await api.get(`/usuarios/${authUserId}`)
      const user = response.data
      setUsuario_id(authUserId)
      setNome_completo(user.nome_completo || "")
      setContato(user.telefone || user.email || "")
      setAutoFilled({ usuario_id: true, nome_completo: true, contato: true })
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
      alert('Não foi possível carregar seus dados. Preencha manualmente.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const payload = {
        usuario_id: parseInt(usuario_id, 10),
        nome_completo,
        tamanho_familia: parseInt(tamanho_familia, 10) || 1,
        contato,
        cep: cep.replace(/\D/g, ''),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        id_abrigo_atual: id_abrigo_atual ? parseInt(id_abrigo_atual, 10) : null,
        status,
        detalhes_medicos: detalhes_medicos || null,
      }

      const response = await api.post('/desabrigados', payload)
      alert('Desabrigado registrado com sucesso!')
      navigate(`/desabrigados/${response.data.desabrigado.id}/abrigos-proximos`)
    } catch (error) {
      console.error('Erro ao registrar desabrigado:', error.response ? error.response.data : error.message)
      if (error.response && error.response.data) {
        alert(`Erro ao registrar desabrigado: ${JSON.stringify(error.response.data)}`)
      }
    }
  }

  return (<><Header/>
    <div className={s.registroContainer}>
      <form className={s.registroForm} onSubmit={handleSubmit}>
        <h1>Registro de Desabrigados</h1>
        <button type="button" className={s.autoFillButton} onClick={preencherComMeusDados}>
          Preencher com meus dados
        </button>
        <label htmlFor="usuario_id">ID do Usuário:</label>
        <input type="number" id="usuario_id" placeholder="ID do Usuário" value={usuario_id} onChange={(e) => setUsuario_id(e.target.value)} disabled={autoFilled.usuario_id} />
        <label htmlFor="nome_completo">Nome completo:</label>
        <input type="text" id="nome_completo" placeholder="Nome completo" value={nome_completo} onChange={(e) => setNome_completo(e.target.value)} disabled={autoFilled.nome_completo} required />
        <label htmlFor="tamanho_familia">Tamanho da família:</label>
        <input type="number" id="tamanho_familia" placeholder="Tamanho da família" value={tamanho_familia} onChange={(e) => setTamanho_familia(e.target.value)} min="1" required />
        <label htmlFor="contato">Contato:</label>
        <input type="text" id="contato" placeholder="Contato" value={contato} onChange={(e) => setContato(e.target.value)} disabled={autoFilled.contato} required />
        <label htmlFor="cep">CEP:</label>
        <input type="text" id="cep" placeholder="CEP" value={cep} onChange={(e) => setCep(e.target.value)} required />
        {/* <button type="button" onClick={buscarEndereco}>Buscar CEP</button> */}
        <button type="button" onClick={buscarLocalizacao}>Buscar posição atual</button>
        <label htmlFor="latitude">Latitude:</label>
        <input type="text" id="latitude" placeholder="Latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
        <label htmlFor="longitude">Longitude:</label>
        <input type="text" id="longitude" placeholder="Longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
        <label htmlFor="id_abrigo_atual">ID do Abrigo Atual (opcional):</label>
        <input type="number" id="id_abrigo_atual" placeholder="ID do Abrigo Atual (opcional)" value={id_abrigo_atual} onChange={(e) => setId_abrigo_atual(e.target.value)} />
        <label htmlFor="status">Status:</label>
        <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} required>
          <option value="">Selecione um status</option>
          <option value="DESABRIGADO">Desabrigado</option>
          <option value="BUSCANDO">Buscando</option>
          <option value="RESGATADO">Resgatado</option>
        </select>

{/* <select value={genero} onChange={(e) => setGenero(e.target.value)} required>
          <option value="">Gênero</option>
          <option value="M">M</option>
          <option value="F">F</option> */}

        <label htmlFor="detalhes_medicos">Detalhes médicos (opcional):</label>
        <textarea id="detalhes_medicos" placeholder="Detalhes médicos (opcional)" value={detalhes_medicos} onChange={(e) => setDetalhes_medicos(e.target.value)} rows="4" />
        <button type="submit">Registrar Desabrigado</button>
      </form>
    </div>
    <Footer />
    </>
  )
}

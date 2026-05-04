// CAMPOS DA TABELA DESABRIGADDOS: usuario_id, nome_completo, tamanho_familia, contato, cep, latitude, longitude, id_abrigo_atual, status, detalhes_medicos

import s from "./RegistroDesabrigados.module.scss"
import api from "../../services/api"
import { cepApi } from "../../services/api"
import { useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import {jwtDecode} from "jwt-decode"
import Header from "../../components/header/Header"
import Footer from "../../components/footer/Footer"
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
//usuario_id, nome_completo, tamanho_familia, contato, cep, latitude, longitude, id_abrigo_atual, status, detalhes_medicos

export default function RegistroDesabrigados() {
  const [usuario_id, setUsuario_id] = useState("")
  const [nome_completo, setNome_completo] = useState("")
  const [tamanho_familia, setTamanho_familia] = useState(1)
  const [contato, setContato] = useState("")
  const [ultima_localizacao, setUltima_localizacao] = useState("")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [id_abrigo_atual, setId_abrigo_atual] = useState("")
  const [status, setStatus] = useState("")
  const [detalhes_medicos, setDetalhes_medicos] = useState("")
  const [authUserId, setAuthUserId] = useState(null)
  const [autoFilled, setAutoFilled] = useState({ usuario_id: false, nome_completo: false, contato: false })
  const [CepBusca, setCepBusca] = useState("")
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

  async function buscarEndereco(cepBusca) {
    if (!cepBusca || cepBusca.trim() === '') {
      toast.error('Por favor, digite um CEP válido.');
      return;
    }

    try {
      console.log('Buscando CEP:', cepBusca);
      const resposta = await cepApi.get(`/${cepBusca.trim()}`);
      console.log('Resposta da API:', resposta.data);

      let enderecoFormatado = cepBusca.trim(); // fallback para o CEP digitado

      if (resposta.data && resposta.data.street) {
        enderecoFormatado = `${resposta.data.street}, ${resposta.data.neighborhood || ''}, ${resposta.data.city} - ${resposta.data.state}`.replace(/, ,/g, ',').replace(/^,|,$/g, '').trim();
      }

      console.log('Endereço formatado:', enderecoFormatado);
      setUltima_localizacao(enderecoFormatado);
      toast.success('CEP encontrado! O campo "Última Localização" foi preenchido.');
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
      if (error.response && error.response.status === 404) {
        toast.error('CEP não encontrado. Verifique se o CEP está correto.');
      } else {
        toast.error('Erro ao buscar endereço. Tente novamente.');
      }
    }
  }

  const buscarLocalizacao = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização não é suportada pelo navegador.');
      return;
    }

    toast.info('Obtendo sua localização...');

    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude.toString();
      const lng = position.coords.longitude.toString();

      setLatitude(lat);
      setLongitude(lng);

      // Tentar obter endereço via reverse geocoding
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
        const data = await response.json();

        if (data && data.display_name) {
          setUltima_localizacao(data.display_name);
          toast.success('Localização obtida com sucesso! Endereço preenchido automaticamente.');
        } else {
          toast.success('Localização obtida! Preencha o campo "Última Localização" manualmente.');
        }
      } catch (error) {
        console.error('Erro ao obter endereço da localização:', error);
        toast.success('Localização obtida! Preencha o campo "Última Localização" manualmente.');
      }
    }, (error) => {
      console.error('Erro ao obter localização:', error);
      let errorMessage = 'Erro ao obter localização: ';
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMessage += 'Usuário negou a solicitação de geolocalização.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage += 'Informações de localização indisponíveis.';
          break;
        case error.TIMEOUT:
          errorMessage += 'A solicitação para obter localização expirou.';
          break;
        default:
          errorMessage += 'Erro desconhecido.';
      }
      toast.error(errorMessage);
    });
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
      toast.error('Não foi possível carregar seus dados. Preencha manualmente.')
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
        ultima_localizacao: ultima_localizacao || 'Não informado',
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        id_abrigo_atual: id_abrigo_atual ? parseInt(id_abrigo_atual, 10) : null,
        status,
        detalhes_medicos: detalhes_medicos || null,
      }

      console.log('Payload sendo enviado:', payload);

      const response = await api.post('/desabrigados', payload)
      toast.success('Desabrigado registrado com sucesso!')
      navigate(`/desabrigados/${response.data.desabrigado.id}/abrigos-proximos?from=cadastro`)
    } catch (error) {
      console.error('Erro ao registrar desabrigado:', error.response ? error.response.data : error.message)
      if (error.response && error.response.data) {
        toast.error(`Erro ao registrar desabrigado: ${JSON.stringify(error.response.data)}`)
      }
    }
  }

  return (<>
  <Header/>
    <div className={s.registroContainer}>
      <form className={s.registroForm} onSubmit={handleSubmit}>
        <h1>Registro de Desabrigados</h1>
        <button type="button" className={s.autoFillButton} onClick={preencherComMeusDados}>
          Preencher com meus dados
        </button>
        <label htmlFor="usuario_id">ID do Usuário:</label>
        <input type="number"  id="usuario_id" placeholder="ID do Usuário" value={usuario_id} onChange={(e) => setUsuario_id(e.target.value)} disabled={autoFilled.usuario_id} />
        <label htmlFor="nome_completo">Nome completo:</label>
        <input type="text" required id="nome_completo" placeholder="Nome completo" value={nome_completo} onChange={(e) => setNome_completo(e.target.value)} disabled={autoFilled.nome_completo} required />
        <label htmlFor="tamanho_familia">Tamanho da família:</label>
        <input type="number" required id="tamanho_familia" placeholder="Tamanho da família" value={tamanho_familia} onChange={(e) => setTamanho_familia(e.target.value)} min="1" required />
        <label htmlFor="contato">Contato:</label>
        <input type="text" required id="contato" placeholder="Contato" value={contato} onChange={(e) => setContato(e.target.value)} disabled={autoFilled.contato} required />
        <label htmlFor="ultima_localizacao">Ultima Localização:</label>
        <input type="text" required id="ultima_localizacao" placeholder="Ultima Localização" value={ultima_localizacao} onChange={(e) => setUltima_localizacao(e.target.value)} required />
        <p>Ou</p>
        <label htmlFor="">Busque pelo cep</label>
        <input type="text" id="cepBusca" placeholder="Digite o CEP para buscar a localização" value={CepBusca} onChange={(e) => setCepBusca(e.target.value)} />
        <button type="button" onClick={() => buscarEndereco(CepBusca)}>Buscar CEP</button>       

        <button type="button" onClick={buscarLocalizacao}>Buscar posição atual</button>
        <label htmlFor="latitude">Latitude:</label>
        <input type="text" id="latitude" placeholder="Latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
        <label htmlFor="longitude">Longitude:</label>
        <input type="text" id="longitude" placeholder="Longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
        <label htmlFor="id_abrigo_atual">ID do Abrigo Atual (opcional):</label>
        <input type="number" id="id_abrigo_atual" placeholder="ID do Abrigo Atual (opcional)" value={id_abrigo_atual} onChange={(e) => setId_abrigo_atual(e.target.value)} />
        <label htmlFor="status">Status:</label>
        <select id="status" required value={status} onChange={(e) => setStatus(e.target.value)} required>
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

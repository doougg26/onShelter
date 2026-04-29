import s from "./RegistroPets.module.scss"
import api from "../../services/api"
import { useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import {jwtDecode} from "jwt-decode"
import Footer from "../../components/footer/Footer"
import Header from "../../components/header/Header"
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RegistroPets() {
  const [nome, setNome] = useState("")
  const [especie, setEspecie] = useState("")
  const [raca, setRaca] = useState("")
  const [genero, setGenero] = useState("")
  const [tamanho, setTamanho] = useState("")
  const [foto_url, setFoto_url] = useState("")
  const [descricao, setDescricao] = useState("")
  const [id_dono, setId_dono] = useState("")
  const [id_abrigo, setId_abrigo] = useState("")
  const [status, setStatus] = useState("")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")

  const navigate = useNavigate()
  const { token } = useContext(AuthContext)

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    const decoded = jwtDecode(token)
    setId_dono(decoded.id)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLatitude(position.coords.latitude.toString())
        setLongitude(position.coords.longitude.toString())
      }, (error) => {
        console.error('Erro ao obter localização:', error)
        toast.error('Não foi possível obter a localização. Verifique as permissões do navegador.')
      })
    }
  }, [token, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        nome,
        especie,
        raca,
        genero,
        tamanho,
        foto_url,
        descricao: descricao || null,
        id_dono: parseInt(id_dono, 10),
        id_abrigo: id_abrigo ? parseInt(id_abrigo, 10) : null,
        status,
      }

      await api.post('/pets', payload)
      toast.success('Pet registrado com sucesso!')
      navigate('/')
    } catch (error) {
      console.error('Erro ao registrar pet:', error.response ? error.response.data : error.message)
      if (error.response && error.response.data) {
        toast.error(`Erro ao registrar pet: ${JSON.stringify(error.response.data)}`)
      }
    }
  }

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
      toast.error('Não foi possível obter a localização. Verifique as permissões do navegador.')
    })
  }

  return (<>
  <Header />
    <div className={s.registroContainer}>
      <form className={s.registroForm} onSubmit={handleSubmit}>
        <h1>Registro de Pets</h1>
        <label htmlFor="nome">Nome</label>
        <input type="text" id="nome" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        <label htmlFor="especie">Espécie</label>
        <input type="text" id="especie" placeholder="Espécie" value={especie} onChange={(e) => setEspecie(e.target.value)} required />
        <label htmlFor="raca">Raça</label>
        <input type="text" id="raca" placeholder="Raça" value={raca} onChange={(e) => setRaca(e.target.value)} required />
        <label htmlFor="genero">Gênero</label>
        <select id="genero" value={genero} onChange={(e) => setGenero(e.target.value)} required>
          <option value="">Selecione</option>
          <option value="M">M</option>
          <option value="F">F</option>
        </select>
        <label htmlFor="tamanho">Tamanho</label>
        <input type="text" id="tamanho" placeholder="Tamanho" value={tamanho} onChange={(e) => setTamanho(e.target.value)} required />
        <label htmlFor="foto_url">Foto URL</label>
        <input type="url" id="foto_url" placeholder="Foto URL" value={foto_url} onChange={(e) => setFoto_url(e.target.value)} required />
        <label htmlFor="descricao">Descrição (opcional)</label>
        <textarea id="descricao" placeholder="Descrição (opcional)" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows="4" />
        <label htmlFor="id_dono">ID do Dono</label>
        <input type="number" id="id_dono" placeholder="ID do Dono" value={id_dono} disabled />
        <label htmlFor="id_abrigo">ID do Abrigo Atual (opcional)</label>
        <input type="number" id="id_abrigo" placeholder="ID do Abrigo Atual (opcional)" value={id_abrigo} onChange={(e) => setId_abrigo(e.target.value)} />
        <label htmlFor="status">Status</label>
        <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} required>
          <option value="">Selecione</option>
          <option value="PERDIDO">Perdido</option>
          <option value="RESGATADO">Resgatado</option>
          <option value="ENCONTRADO">Encontrado</option>
        </select>
        <button type="button" onClick={buscarLocalizacao}>Buscar posição atual</button>
        <label htmlFor="latitude">Latitude</label>
        <input type="text" id="latitude" placeholder="Latitude" value={latitude} disabled />
        <label htmlFor="longitude">Longitude</label>
        <input type="text" id="longitude" placeholder="Longitude" value={longitude} disabled />
        <button type="submit">Registrar Pet</button>
      </form>
    </div>
    <Footer/>
    
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

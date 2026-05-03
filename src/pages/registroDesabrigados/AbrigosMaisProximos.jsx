import s from "./AbrigosMaisProximos.module.scss"
import api from "../../services/api"
import { useState, useEffect } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";


function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function AbrigosMaisProximos() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const from = searchParams.get('from')
  const navigate = useNavigate()
  const [desabrigado, setDesabrigado] = useState(null)
  const [abrigos, setAbrigos] = useState([])
  const [selectedAbrigo, setSelectedAbrigo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [desabrigadoRes, abrigosRes] = await Promise.all([
          api.get(`/desabrigados/${id}`),
          api.get('/abrigos')
        ])

        const desabrigadoData = desabrigadoRes.data
        setDesabrigado(desabrigadoData)

        const userLat = parseFloat(desabrigadoData.latitude)
        const userLng = parseFloat(desabrigadoData.longitude)
        const nearby = abrigosRes.data.abrigos
          .map((abrigo) => ({
            ...abrigo,
            distancia: haversineDistance(
              userLat,
              userLng,
              parseFloat(abrigo.latitude),
              parseFloat(abrigo.longitude)
            )
          }))
          .sort((a, b) => a.distancia - b.distancia)

        setAbrigos(nearby)
        setSelectedAbrigo(nearby[0] || null)
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
        setError('Não foi possível carregar os abrigos próximos.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  const handleAbrigoClick = (abrigo) => {
    setSelectedAbrigo(abrigo)
  }

  const handleEntrarAbrigo = async () => {
    if (!selectedAbrigo) return
    setSubmitting(true)
    try {
      const response = await api.post(`/desabrigados/${id}/entrar`, {
        abrigoId: selectedAbrigo.id
      })
      setDesabrigado(response.data.desabrigado)
      setSelectedAbrigo(response.data.abrigo)
      toast.success('Você entrou no abrigo com sucesso!')
      navigate('/home')
    } catch (err) {
      console.error('Erro ao entrar no abrigo:', err.response ? err.response.data : err.message)
      toast.error('Erro ao entrar no abrigo. Veja o console para detalhes.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className={s.registroContainer}><p>Carregando abrigos próximos...</p></div>
  }

  if (error) {
    return <div className={s.registroContainer}><p>{error}</p></div>
  }

  return (
    <>
    <Header />
    <div className={s.registroContainer}>
      <h1>Abrigos mais próximos</h1>
      <div className={s.content}>
        <div className={s.list}>
          <h2>Selecione um abrigo</h2>
          {abrigos.length === 0 ? (
            <p>Nenhum abrigo encontrado.</p>
          ) : (
            abrigos.map((abrigo) => (
              <button
                key={abrigo.id}
                type="button"
                className={`${s.abrigoItem} ${selectedAbrigo?.id === abrigo.id ? s.selected : ''}`}
                onClick={() => handleAbrigoClick(abrigo)}
              >
                <strong>{abrigo.nome}</strong>
                <span>{abrigo.endereco}</span>
                <span>{abrigo.distancia.toFixed(2)} km</span>
              </button>
            ))
          )}
        </div>

        <div className={s.details}>
          <h2>Detalhes do abrigo</h2>
          {selectedAbrigo ? (
            <div>
              <p><strong>Nome:</strong> {selectedAbrigo.nome}</p>
              <p><strong>Endereço:</strong> {selectedAbrigo.endereco}</p>
              <p><strong>CEP:</strong> {selectedAbrigo.cep}</p>
              <p><strong>Latitude:</strong> {selectedAbrigo.latitude}</p>
              <p><strong>Longitude:</strong> {selectedAbrigo.longitude}</p>
              <p><strong>Capacidade total:</strong> {selectedAbrigo.capacidade_total}</p>
              <p><strong>Capacidade atual:</strong> {selectedAbrigo.capacidade_atual}</p>
              <p><strong>Aceita pets:</strong> {selectedAbrigo.aceita_pets ? 'Sim' : 'Não'}</p>
              <p><strong>Contato:</strong> {selectedAbrigo.contato}</p>
              <p><strong>Status do usuário:</strong> {desabrigado.status}</p>
              <button
                type="button"
                className={s.submitButton}
                onClick={handleEntrarAbrigo}
                disabled={submitting || desabrigado.status === 'abrigado' || from !== 'cadastro'}
              >
                {desabrigado.status === 'abrigado' ? 'Você já está abrigado' : from !== 'cadastro' ? '' : 'Entrar no abrigo'}
              </button>
            </div>
          ) : (
            <p>Selecione um abrigo para ver mais detalhes.</p>
          )}
        </div>
      </div>
    </div>
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
      <Footer />
    </>

  )
}

import s from "./RegistroAbrigos.module.scss"
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
//nome, endereco, cep, latitutde, longitude, capacidade_total, capacidade_atual, aceita_pets, capacidade_pets, capacidade_atual_pets, contato, gerente_id, verificacao

export default function RegistroAbrigos() {
    const [nome, setNome] = useState("")
    const [endereco, setEndereco] = useState("")
    const [cep, setCep] = useState("")
    const [latitude, setLatitude] = useState("")
    const [longitude, setLongitude] = useState("")
    const [capacidade_total, setCapacidade_total] = useState("")
    const [capacidade_atual, setCapacidade_atual] = useState(0)
    const [aceita_pets, setAceita_pets] = useState("")
    const [capacidade_pets, setCapacidade_pets] = useState(0)
    const [capacidade_atual_pets, setCapacidade_atual_pets] = useState(0)
    const [contato, setContato] = useState("")
    const [gerente_id, setGerente_id] = useState("")
    //pegar id do gerente logado e colocar aqui
    const verificacao = false

    const navigate = useNavigate()
    const { token } = useContext(AuthContext)

    useEffect(() => {
        const fetchUserAndLocation = async () => {
            if (!token) {
                navigate('/login')
                return
            }
            const decoded = jwtDecode(token)
            try {
                const userResponse = await api.get(`/usuarios/${decoded.id}`)
                const user = userResponse.data
                if (user.role !== 'manager' && user.role !== 'admin') {
                    toast.error('Acesso negado. Apenas gerentes ou administradores podem registrar abrigos.')
                    navigate('/')
                    return
                }
                setGerente_id(user.id)

                // Obter geolocalização
  
            } catch (error) {
                toast.error('Erro ao buscar usuário. Por favor, faça login novamente.')
                console.error('Erro ao buscar usuário:', error)
                navigate('/login')
            }
        }
        fetchUserAndLocation()
    }, [token, navigate])

    async function buscarEndereco() {
        try {
            const resposta = await cepApi.get(`/${cep}`)
            setEndereco(resposta.data.street)

        } catch (error) {
            console.error("Erro ao buscar endereço:", error)
        }
    }

    function buscarLocalizacao() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const lat = position.coords.latitude.toString()
                const lng = position.coords.longitude.toString()
                setLatitude(lat)
                setLongitude(lng)
                // Reverse geocoding para obter endereço
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`)
                    const data = await response.json()
                    setEndereco(data.display_name || '')
                    toast.success('Localização obtida com sucesso!')
                } catch (error) {
                    toast.error('Erro ao obter endereço da localização')
                    console.error('Erro ao obter endereço:', error)
                }
            }, (error) => {
                let errorMessage = 'Erro ao obter localização: '
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Usuário negou a solicitação de geolocalização.'
                        break
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Informações de localização indisponíveis.'
                        break
                    case error.TIMEOUT:
                        errorMessage += 'A solicitação para obter localização expirou.'
                        break
                    default:
                        errorMessage += 'Erro desconhecido.'
                        break
                }
                toast.error(errorMessage)
                console.error('Erro ao obter localização:', error)
            })
        } else {
            toast.error('Geolocalização não é suportada pelo navegador.')
        }
    }
    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validações básicas
        if (!nome.trim()) {
            toast.error("Nome do abrigo é obrigatório")
            return
        }
        if (!endereco.trim()) {
            toast.error("Endereço é obrigatório")
            return
        }
        if (!cep.trim()) {
            toast.error("CEP é obrigatório")
            return
        }
        if (!latitude || !longitude) {
            toast.error("Latitude e longitude são obrigatórias")
            return
        }
        if (!capacidade_total || parseInt(capacidade_total) <= 0) {
            toast.error("Capacidade total deve ser maior que zero")
            return
        }
        if (!contato.trim()) {
            toast.error("Contato é obrigatório")
            return
        }
        if (!gerente_id) {
            toast.error("ID do gerente não encontrado")
            return
        }

        try {
            const cleanCep = cep.replace(/\D/g, '')

            // Garantir que valores numéricos sejam válidos
            const capacidadeTotalNum = parseInt(capacidade_total, 10) || 0
            const capacidadeAtualNum = parseInt(capacidade_atual, 10) || 0
            const capacidadePetsNum = parseInt(capacidade_pets, 10) || 0
            const capacidadeAtualPetsNum = parseInt(capacidade_atual_pets, 10) || 0

            // Validar que capacidades atuais não excedam totais
            if (capacidadeAtualNum > capacidadeTotalNum) {
                toast.error("Capacidade atual não pode ser maior que a capacidade total")
                return
            }
            if (capacidadeAtualPetsNum > capacidadePetsNum) {
                toast.error("Capacidade atual de pets não pode ser maior que a capacidade total de pets")
                return
            }

            const payload = {
                nome: nome.trim(),
                endereco: endereco.trim(),
                cep: cleanCep,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                capacidade_total: capacidadeTotalNum,
                capacidade_atual: capacidadeAtualNum,
                aceita_pets: aceita_pets === 'Sim',
                capacidade_pets: capacidadePetsNum,
                capacidade_atual_pets: capacidadeAtualPetsNum,
                contato: contato.trim(),
                gerente_id: parseInt(gerente_id, 10),
                verificacao: false,
            }

            console.log('Payload sendo enviado:', payload) // Debug

            await api.post("/abrigos", payload)
            toast.success("Abrigo registrado com sucesso!")
            navigate("/home")
        } catch (error) {
            console.error("Erro ao registrar abrigo:", error)
            if (error.response) {
                console.error("Resposta do servidor:", error.response.data)
                console.error("Status:", error.response.status)
                if (error.response.status === 500) {
                    toast.error("Erro interno do servidor. Verifique os dados e tente novamente.")
                } else if (error.response.data && error.response.data.message) {
                    toast.error(`Erro: ${error.response.data.message}`)
                } else {
                    toast.error("Erro ao registrar abrigo. Verifique os dados.")
                }
            } else if (error.request) {
                toast.error("Erro de conexão. Verifique sua internet.")
            } else {
                toast.error("Erro inesperado. Tente novamente.")
            }
        }
    }


    return (<>
    <Header />
        <div className={s.registroContainer}>
            <form className={s.registroForm} onSubmit={handleSubmit}>
                <h1>Registro de Abrigos</h1>

                <div className={s.formGroup}>
                    <label htmlFor="nome">
                        Nome do Abrigo: <span className={s.required}>*</span>
                    </label>
                    <input
                        type="text"
                        required
                        id="nome"
                        placeholder="Digite o nome do abrigo"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                    />
                </div>

                <div className={s.formGroup}>
                    <label htmlFor="endereco">
                        Endereço: <span className={s.required}>*</span>
                    </label>
                    <input
                        type="text"
                        required
                        id="endereco"
                        placeholder="Digite o endereço completo"
                        value={endereco}
                        onChange={(e) => setEndereco(e.target.value)}
                    />
                </div>

                <div className={s.localizacao}>
                    <h3>Localização <span className={s.required}>*</span></h3>
                    <p className={s.helpText}>Preencha o CEP ou use sua localização atual para obter endereço e coordenadas precisas</p>

                    <div className={s.formGroup}>
                        <label htmlFor="cep">CEP:</label>
                        <input
                            type="text"
                            required
                            id="cep"
                            placeholder="00000-000"
                            value={cep}
                            onChange={(e) => setCep(e.target.value)}
                        />
                        <button type="button" onClick={buscarEndereco} className={s.secondaryBtn}>
                            Buscar Endereço
                        </button>
                    </div>

                    <div className={s.buttonGroup}>
                        <button type="button" onClick={buscarLocalizacao} className={s.locationBtn}>
                            📍 Usar Localização Atual
                        </button>
                    </div>

                    <div className={s.coordsGroup}>
                        <div className={s.formGroup}>
                            <label htmlFor="latitude">Latitude:</label>
                            <input
                                type="text"
                                id="latitude"
                                placeholder="-23.550520"
                                value={latitude}
                                onChange={(e) => setLatitude(e.target.value)}
                                readOnly
                            />
                        </div>
                        <div className={s.formGroup}>
                            <label htmlFor="longitude">Longitude:</label>
                            <input
                                type="text"
                                id="longitude"
                                placeholder="-46.633308"
                                value={longitude}
                                onChange={(e) => setLongitude(e.target.value)}
                                readOnly
                            />
                        </div>
                    </div>
                </div>

                <div className={s.capacitySection}>
                    <h3>Capacidades <span className={s.required}>*</span></h3>

                    <div className={s.capacityGroup}>
                        <div className={s.formGroup}>
                            <label htmlFor="capacidade_total">Capacidade Total de Pessoas:</label>
                            <input
                                type="number"
                                id="capacidade_total"
                                placeholder="Ex: 50"
                                min="1"
                                value={capacidade_total}
                                onChange={(e) => setCapacidade_total(e.target.value)}
                            />
                        </div>

                        <div className={s.formGroup}>
                            <label htmlFor="capacidade_atual">Capacidade Atual de Pessoas:</label>
                            <input
                                type="number"
                                id="capacidade_atual"
                                placeholder="Ex: 25"
                                min="0"
                                value={capacidade_atual}
                                onChange={(e) => setCapacidade_atual(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className={s.petsSection}>
                    <h3>Pets</h3>

                    <div className={s.formGroup}>
                        <label htmlFor="aceita_pets">Aceita Pets:</label>
                        <select
                            id="aceita_pets"
                            value={aceita_pets}
                            onChange={(e) => setAceita_pets(e.target.value)}
                        >
                            <option value="">Selecione</option>
                            <option value="Sim">Sim</option>
                            <option value="Não">Não</option>
                        </select>
                    </div>

                    {aceita_pets === 'Sim' && (
                        <div className={s.capacityGroup}>
                            <div className={s.formGroup}>
                                <label htmlFor="capacidade_pets">Capacidade Total de Pets:</label>
                                <input
                                    type="number"
                                    id="capacidade_pets"
                                    placeholder="Ex: 10"
                                    min="0"
                                    value={capacidade_pets}
                                    onChange={(e) => setCapacidade_pets(e.target.value)}
                                />
                            </div>

                            <div className={s.formGroup}>
                                <label htmlFor="capacidade_atual_pets">Capacidade Atual de Pets:</label>
                                <input
                                    type="number"
                                    id="capacidade_atual_pets"
                                    placeholder="Ex: 5"
                                    min="0"
                                    value={capacidade_atual_pets}
                                    onChange={(e) => setCapacidade_atual_pets(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className={s.formGroup}>
                    <label htmlFor="contato">
                        Contato: <span className={s.required}>*</span>
                    </label>
                    <input
                        type="text"
                        required
                        id="contato"
                        placeholder="(11) 99999-9999"
                        value={contato}
                        onChange={(e) => setContato(e.target.value)}
                    />
                </div>

                <div className={s.formGroup}>
                    <label htmlFor="gerente_id">ID do Gerente:</label>
                    <input
                        type="number"
                        id="gerente_id"
                        placeholder="ID do Gerente"
                        value={gerente_id}
                        onChange={(e) => setGerente_id(e.target.value)}
                        disabled
                        className={s.disabledInput}
                    />
                </div>

                <button type="submit" className={s.submitBtn}>
                    Registrar Abrigo
                </button>
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

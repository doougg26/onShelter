import s from "./RegistroAbrigos.module.scss"
import api from "../../services/api"
// import { cepApi } from "../../services/api"
import { useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import {jwtDecode} from "jwt-decode"
import Header from "../../components/header/Header"
import Footer from "../../components/footer/Footer"
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
                    alert('Acesso negado. Apenas gerentes ou administradores podem registrar abrigos.')
                    navigate('/')
                    return
                }
                setGerente_id(user.id)

                // Obter geolocalização
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
                        } catch (error) {
                            console.error('Erro ao obter endereço:', error)
                        }
                    }, (error) => {
                        console.error('Erro ao obter localização:', error)
                    })
                } else {
                    alert('Geolocalização não é suportada pelo navegador.')
                }
            } catch (error) {
                console.error('Erro ao buscar usuário:', error)
                navigate('/login')
            }
        }
        fetchUserAndLocation()
    }, [token, navigate])

    // async function buscarEndereco() {
    //     try {
    //         const resposta = await cepApi.get(`/${cep}`)
    //         setEndereco(resposta.data.street)

    //     } catch (error) {
    //         console.error("Erro ao buscar endereço:", error)
    //     }
    // }
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const cleanCep = cep.replace(/\D/g, '')
            const payload = {
                nome,
                endereco,
                cep: cleanCep,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                capacidade_total: parseInt(capacidade_total, 10) || 0,
                capacidade_atual: parseInt(capacidade_atual, 10) || 0,
                aceita_pets: aceita_pets.toLowerCase() === 'sim' || aceita_pets.toLowerCase() === 'true',
                capacidade_pets: parseInt(capacidade_pets, 10) || 0,
                capacidade_atual_pets: parseInt(capacidade_atual_pets, 10) || 0,
                contato,
                gerente_id,
                verificacao,
            }

            await api.post("/abrigos", payload)
            alert("Abrigo registrado com sucesso!")
            navigate("/")
        } catch (error) {
            console.error("Erro ao registrar abrigo:", error.response ? error.response.data : error.message)
            if (error.response && error.response.data) {
                alert(`Erro ao registrar abrigo: ${JSON.stringify(error.response.data)}`)
            }
        }
    }


    return (<>
    <Header />
        <div className={s.registroContainer}>
            <form className={s.registroForm} onSubmit={handleSubmit}>
                <h1>Registro de Abrigos</h1>
                <label htmlFor="nome">Nome do Abrigo:</label>
                <input type="text" id="nome" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
                <label htmlFor="endereco">Endereço:</label>
                <input type="text" id="endereco" placeholder="Endereço" value={endereco} onChange={(e) => setEndereco(e.target.value)} disabled />
                <label htmlFor="cep">CEP:</label>
                <input type="text" id="cep" placeholder="CEP" value={cep} onChange={(e) => setCep(e.target.value)}  />
                {/* <button type="button" onClick={buscarEndereco}>Buscar Endereço</button> */}
                <label htmlFor="latitude">Latitude:</label>
                <input type="text" id="latitude" placeholder="Latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} disabled />
                <label htmlFor="longitude">Longitude:</label>
                <input type="text" id="longitude" placeholder="Longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} disabled />
                <label htmlFor="capacidade_total">Capacidade Total:</label>
                <input type="number" id="capacidade_total" placeholder="Capacidade Total" value={capacidade_total} onChange={(e) => setCapacidade_total(e.target.value)} />
                <label htmlFor="capacidade_atual">Capacidade Atual:</label>
                <input type="number" id="capacidade_atual" placeholder="Capacidade Atual" value={capacidade_atual} onChange={(e) => setCapacidade_atual(e.target.value)} />
                <label htmlFor="aceita_pets">Aceita Pets (Sim/Não):</label>
                <select id="aceita_pets" value={aceita_pets} onChange={(e) => setAceita_pets(e.target.value)}>
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                </select>
                <label htmlFor="capacidade_pets">Capacidade para Pets:</label>
                <input type="number" id="capacidade_pets" placeholder="Capacidade para Pets" value={capacidade_pets} onChange={(e) => setCapacidade_pets(e.target.value)} />
                <label htmlFor="capacidade_atual_pets">Capacidade Atual para Pets:</label>
                <input type="number" id="capacidade_atual_pets" placeholder="Capacidade Atual para Pets" value={capacidade_atual_pets} onChange={(e) => setCapacidade_atual_pets(e.target.value)} />
                <label htmlFor="contato">Contato:</label>
                <input type="text" id="contato" placeholder="Contato" value={contato} onChange={(e) => setContato(e.target.value)} />
                <label htmlFor="gerente_id">ID do Gerente:</label>
                <input type="number" id="gerente_id" placeholder="ID do Gerente" value={gerente_id} onChange={(e) => setGerente_id(e.target.value)} disabled />
                <button type="submit">Registrar Abrigo</button>
            </form>
        </div>
        <Footer />
    </>
    )
}

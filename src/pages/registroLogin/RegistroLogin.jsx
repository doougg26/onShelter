import { useNavigate } from "react-router-dom"
import api from "../../services/api"
import { useState } from "react"
import s from "./RegistroLogin.module.scss"

export default function RegistroLogin() {
//nome_completo, telefone, email, hash_senha, role

    const navigate = useNavigate()
    const [nomeCompleto, setNomeCompleto] = useState("")
    const [telefone, setTelefone] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const role = "user"// problema de segurança, modificar depois

    async function handleSubmit(e) {
        e.preventDefault()

        try {
            await api.post("/usuarios", {
                nome_completo: nomeCompleto,
                telefone: telefone,
                email: email,
                hash_senha: password,
                role: role
            })
            alert("Registro bem-sucedido!")
            navigate("/login")
        } catch (error) {
            console.error("Erro ao fazer registro:", error)
            alert(error.message)
        }
    }

  return (
    <div className={s.registroLoginContainer}>
        <form className={s.registroLoginForm} onSubmit={handleSubmit}>
            <h1>Registro</h1>
            <input type="text" placeholder="Nome Completo" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} />
            <input type="text" placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
            <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Registrar</button>
            <h6>Já tem uma conta? <button onClick={() => (navigate("/login"))}>Faça login</button></h6>
        </form> 
    </div>
  )
}
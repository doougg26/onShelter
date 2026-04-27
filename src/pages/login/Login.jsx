import s from "./Login.module.scss"
import api from "../../services/api"
import { useContext,useState } from "react"
import { AuthContext } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"
export default function Login() {

  const { login } = useContext(AuthContext)
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [hash_senha, setHashSenha] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const resposta = await api.post("/login", { email, hash_senha })
      login(resposta.data.token)
      alert("Login bem-sucedido!")
      navigate("/")
    } catch (error) {
      alert("Erro ao fazer login:", error.response?.data?.message || error.message)
    }
  }

  return (
    <div className={s.loginContainer}>
        <form className={s.loginForm} onSubmit={handleSubmit}>
            <h1>Login</h1>
            <label htmlFor="email">Email:</label>
            <input type="text" id="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <label htmlFor="hash_senha">Senha:</label>
            <input type="password" id="hash_senha" placeholder="Senha" value={hash_senha} onChange={(e) => setHashSenha(e.target.value)} />
            <button type="submit">Entrar</button>
            <h6>Não tem uma conta? <button onClick={() => (navigate("/register"))}>Cadastre-se</button></h6>
        </form>
    </div>
  )
}
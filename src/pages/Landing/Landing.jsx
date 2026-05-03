import Header from "../../components/header/Header"
import Footer from "../../components/footer/Footer"
import { useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"
import s from "./Landing.module.scss"
import { useRef } from "react"
import { FcAbout, FcQuestions } from "react-icons/fc";
import { FaHandsHelping, FaPhone  } from "react-icons/fa";
import { FaPersonShelter } from "react-icons/fa6";





export default function Landing() {
  const { token } = useContext(AuthContext)
  const isLoggedIn = !!token

  const navigate = useNavigate()
const secaoRef = {
      sobre: useRef(null),
    contato: useRef(null)
  }
const rolarPara = (secao) => {  secaoRef[secao].current.scrollIntoView({ behavior: "smooth" })
}
const handleNavigateHome = () => {
  navigate("/home")
}

const handleNavigateRegister = () => {
  navigate("/register")
}

const handleNavigateLogin = () => {
  navigate("/login")
}

  return (<>
    <Header onNavigate={rolarPara} />
  <section className={s.main} >
    <div className={s.landing}>
      <h1>Bem-vindo ao OnShelter</h1>
      <p>Conectando pessoas e abrigos para um futuro melhor</p>
      {isLoggedIn && <button onClick={handleNavigateHome}>Comece por aqui</button>}
        {!isLoggedIn && <button onClick={handleNavigateRegister}>Registre-se para usar o serviço</button>}
        {!isLoggedIn && <button onClick={handleNavigateLogin}>É Usuario? login</button>}
    </div>
    <div className={s.boxSobre } ref={secaoRef.sobre}>
      <h2>Sobre o OnShelter</h2>
      <FcAbout size={80} />
      <p>O OnShelter é uma plataforma sem fins lucrativos que conecta pessoas em situação de rua com abrigos disponíveis, promovendo uma rede de apoio e solidariedade em momentos de necessidade.</p>
    </div>
    <div className={s.boxComoFunciona}>
      <h2>Como Funciona</h2>
      <FcQuestions size={80} color="skyblue" />
      <p>Usuários podem se cadastrar para encontrar abrigos próximos ou oferecer vagas em seus próprios abrigos. A plataforma facilita a comunicação e o acesso a recursos essenciais para quem precisa.</p>
    </div>
    <div className={s.boxAjuda}>
      <h2>Está desabrigado?</h2>
      <FaHandsHelping size={80} color="skyblue" />
      <p>Estamos aqui para ajudar! Se você tiver dúvidas ou precisar de suporte, não hesite em nos contatar.</p>
    </div>
    <div className={s.boxMissao} >
      <h2>Nossa Missão</h2>
      <FaPersonShelter size={80} color="skyblue" />
      <p>Facilitar o acesso a abrigos e recursos para pessoas em situação de rua, promovendo dignidade, segurança e oportunidades de recomeço.</p>
    </div>
    <div className={s.boxContato} ref={secaoRef.contato}>
      <h2>Contato</h2>
      <FaPhone size={80} color="skyblue" />
      <p>Entre em contato conosco para saber mais sobre como ajudar ou se precisar de assistência:
        <br />Email:
        <a href="mailto:contato@onshelter.org">contato@onshelter.org</a>
      </p>
    </div>

  </section>
  <Footer />
  </>
  )
}
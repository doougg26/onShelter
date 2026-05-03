import Header from "../../components/header/Header"
import Footer from "../../components/footer/Footer"
import { useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"
import s from "./Landing.module.scss"
import { useRef } from "react"
import { FaHandsHelping, FaPhone, FaArrowRight, FaCheck } from "react-icons/fa"
import { FaPersonShelter } from "react-icons/fa6"
import { MdLocalActivity, MdQuestionAnswer } from "react-icons/md"
import backgroundImg from "../../assets/img/background.jpg"





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
    <div className={s.landing} style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${backgroundImg})` }}>
      <div className={s.landingContent}>
        <h1>Bem-vindo ao OnShelter</h1>
        <p>Conectando pessoas e abrigos para um futuro melhor</p>
        <div className={s.buttonGroup}>
          {isLoggedIn && <button className={s.primaryBtn} onClick={handleNavigateHome}><FaArrowRight /> Comece por aqui</button>}
          {!isLoggedIn && <button className={s.primaryBtn} onClick={handleNavigateRegister}><FaArrowRight /> Registre-se para usar o serviço</button>}
          {!isLoggedIn && <button className={s.secondaryBtn} onClick={handleNavigateLogin}>É Usuário? Login</button>}
        </div>
      </div>
    </div>

    <div className={s.boxSection} ref={secaoRef.sobre}>
      <MdLocalActivity className={s.sectionIcon} />
      <h2>Sobre o OnShelter</h2>
      <p>O OnShelter é uma plataforma sem fins lucrativos que conecta pessoas em situação de rua com abrigos disponíveis, promovendo uma rede de apoio e solidariedade em momentos de necessidade.</p>
      <ul className={s.featureList}>
        <li><FaCheck /> Rede de solidariedade</li>
        <li><FaCheck /> Acesso fácil a abrigos</li>
        <li><FaCheck /> Suporte 24/7</li>
      </ul>
    </div>

    <div className={s.boxSection} style={{ backgroundColor: '#f0f4f8' }}>
      <MdQuestionAnswer className={s.sectionIcon} />
      <h2>Como Funciona</h2>
      <p>Usuários podem se cadastrar para encontrar abrigos próximos ou oferecer vagas em seus próprios abrigos. A plataforma facilita a comunicação e o acesso a recursos essenciais para quem precisa.</p>
      <ul className={s.featureList}>
        <li><FaCheck /> Cadastro rápido e seguro</li>
        <li><FaCheck /> Localização em tempo real</li>
        <li><FaCheck /> Comunicação direta</li>
      </ul>
    </div>

    <div className={s.boxSection}>
      <FaHandsHelping className={s.sectionIcon} />
      <h2>Está desabrigado?</h2>
      <p>Estamos aqui para ajudar! Se você tiver dúvidas ou precisar de suporte, não hesite em nos contatar. Nossa equipe está disponível para orientá-lo no processo.</p>
      <ul className={s.featureList}>
        <li><FaCheck /> Assistência imediata</li>
        <li><FaCheck /> Dicas e orientações</li>
        <li><FaCheck /> Abrigos verificados</li>
      </ul>
    </div>

    <div className={s.boxSection} style={{ backgroundColor: '#f0f4f8' }}>
      <FaPersonShelter className={s.sectionIcon} />
      <h2>Nossa Missão</h2>
      <p>Facilitar o acesso a abrigos e recursos para pessoas em situação de rua, promovendo dignidade, segurança e oportunidades de recomeço.</p>
      <ul className={s.featureList}>
        <li><FaCheck /> Dignidade garantida</li>
        <li><FaCheck /> Segurança em primeiro lugar</li>
        <li><FaCheck /> Oportunidades reais</li>
      </ul>
    </div>

    <div className={s.boxSection} ref={secaoRef.contato}>
      <FaPhone className={s.sectionIcon} />
      <h2>Contato</h2>
      <p>Entre em contato conosco para saber mais sobre como ajudar ou se precisar de assistência:</p>
      <div className={s.contactInfo}>
        <p><strong>Email:</strong> <a href="mailto:contato@onshelter.org">contato@onshelter.org</a></p>
        <p><strong>Telefone:</strong> <a href="tel:+551198765432">(11) 98765-4321</a></p>
      </div>
    </div>

  </section>
  <Footer />
  </>
  )
}
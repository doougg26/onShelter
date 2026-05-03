import s from "./Footer.module.scss"
import { FaFacebook, FaInstagram, FaTwitter, FaHeart, FaPaw } from "react-icons/fa"

export default function Footer({ onNavigate } ) {
    const currentYear = new Date().getFullYear()
    
    return (
        <>
        <footer className={s.footer}>
            <div className={s.footerContent}>
                <div className={s.footerSection}>
                    <h3><FaPaw /> OnShelter</h3>
                    <p>Conectando pessoas com abrigos para fazer a diferença na vida de quem precisa.</p>
                </div>
                


                <div className={s.footerSection}>
                    <h4>Redes Sociais</h4>
                    <div className={s.socialLinks}>
                        <a href="#" aria-label="Facebook" title="Facebook"><FaFacebook /></a>
                        <a href="#" aria-label="Instagram" title="Instagram"><FaInstagram /></a>
                        <a href="#" aria-label="Twitter" title="Twitter"><FaTwitter /></a>
                    </div>
                </div>

                <div className={s.footerSection}>
                    <h4>Contato</h4>
                    <p>📧 contato@onshelter.com</p>
                    <p>📱 (11) 98765-4321</p>
                </div>
            </div>

            <div className={s.footerBottom}>
                <p>Powered By&copy; {currentYear} Vai na web. Todos os direitos reservados. <FaHeart className={s.heart} /> Feito com amor</p>
            </div>
        </footer>   
        </>
    )
}
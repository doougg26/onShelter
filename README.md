# 📱 Documentação - OnShelter

**Versão:** 1.0.0  
**Tecnologia:** React 19 + Vite

---

## 🎯 Visão Geral

O **OnShelter** é uma plataforma web desenvolvida em React que conecta pessoas desabrigadas com abrigos disponíveis e serviços de resgate de pets.A ideia surgiu a partir dos recentes cenários de calamidade causados por enchentes no Brasil. Pensando na urgência de salvar vidas e minimizar o pânico durante a evacuação, decidi focar no problema da **desinformação e na falta de centralização de dados** durante o momento de crise. Quando a água sobe, a informação clara é o ativo mais valioso para a sobrevivência e para o resgate seguro.
Durante enchentes e desastres naturais, milhares de famílias precisam abandonar suas casas às pressas. O problema crítico é que **as pessoas não sabem para onde ir**. 

Muitas vezes, abrigos ficam superlotados enquanto outros têm vagas sobrando, simplesmente porque a informação não chega a quem precisa. Além disso, o abandono e a perda de animais de estimação (pets) disparam, pois muitas famílias não sabem quais abrigos aceitam animais. Por fim, as doações acabam sendo mal distribuídas, gerando excesso de roupas em um local e falta de água potável em outro.

A proposta é uma aplicação web centralizada e de fácil acesso (projetada para conexões lentas) que conecta pessoas desabrigadas, voluntários e gestores de abrigos.


---

## 📁 Estrutura de Pastas

## 🔑 Conceitos Principais

### **1. Autenticação e Contexto**

A autenticação é gerenciada através do **Context API**:

```javascript
import { AuthContext } from "../../context/AuthContext"

// Dentro de um componente
const { token, logout } = useContext(AuthContext)
```

O token JWT é armazenado no `localStorage` e usado em todas as requisições à API.

### **2. Roles de Usuário**

Existem 3 roles diferentes com permissões específicas:

| Role | Permissões |
|------|-----------|
| **user** | Consultar dados próprios, registrar-se como desabrigado |
| **manager** | Gerenciar abrigo próprio, usuários e pets do abrigo |
| **admin** | Acesso total ao painel administrativo, gerenciar tudo |

### **3. Rotas Protegidas**

As rotas são protegidas de acordo com a autenticação:

```javascript
<Route path="/profile" element={<PrivateRoute><Usuario /></PrivateRoute>} />
<Route path="/admin" element={<AdminRoute><AdminPainel /></AdminRoute>} />
```

---

## 🛣️ Rotas Disponíveis

### **Rotas Públicas**

| Rota | Página | Descrição |
|------|--------|-----------|
| `/` | Landing | Página inicial com botões de ação |
| `/login` | Login | Fazer login na aplicação |
| `/register` | RegistroLogin | Cadastro de novo usuário |

### **Rotas de Registro (Públicas)**

| Rota | Página | Descrição |
|------|--------|-----------|
| `/register/desabrigado` | RegistroDesabrigados | Registrar-se como pessoa desabrigada |
| `/register/pet` | RegistroPets | Registrar um pet |
| `/register/shelter` | RegistroAbrigos | Registrar um abrigo (managers/admins) |

### **Rotas Protegidas (Requer Login)**

| Rota | Página | Descrição |
|------|--------|-----------|
| `/home` | Home | Homepage após autenticação |
| `/profile` | Usuario | Perfil do usuário logado |
| `/desabrigados` | Desabrigados | Consultar desabrigados, pets e abrigos |
| `/desabrigados/:id/abrigos-proximos` | AbrigosMaisProximos | Ver abrigos próximos para um desabrigado |

### **Rotas de Admin (Requer role: admin/manager)**

| Rota | Página | Descrição |
|------|--------|-----------|
| `/admin` | AdminPainel | Painel principal de administração |
| `/admin/usuarios` | GerenciaUsuarios | Gerenciar usuários |
| `/admin/abrigos` | GerenciaAbrigos | Gerenciar abrigos |
| `/admin/pets` | GerenciaPets | Gerenciar pets |
| `/admin/desabrigados` | GerenciaDesabrigados | Gerenciar desabrigados |

---

## 📄 Páginas Principais

### **Landing**
- **Arquivo:** `src/pages/Landing/Landing.jsx`
- **Descrição:** Primeira página renderizada da aplicação
- **Funcionalidades:**
  - Introdução da plataforma
  - Botão de registro só aparece para usuários não logados
  - Espaçamento de 20px entre boxes

### **Login**
- **Arquivo:** `src/pages/login/Login.jsx`
- **Descrição:** Autenticação de usuários
- **Funcionalidades:**
  - Email e senha
  - Redireciona para `/home` após sucesso

### **Registro de Desabrigados**
- **Arquivo:** `src/pages/registroDesabrigados/RegistroDesabrigados.jsx`
- **Descrição:** Formulário de registro para pessoas desabrigadas
- **Funcionalidades:**
  - Preenchimento automático de dados do usuário
  - Geolocalização automática (latitude/longitude)
  - Busca de CEP
  - Após registro, redireciona para página de abrigos próximos com `?from=cadastro`

### **Abrigos Mais Próximos**
- **Arquivo:** `src/pages/registroDesabrigados/AbrigosMaisProximos.jsx`
- **Descrição:** Mostra abrigos ordenados por proximidade
- **Funcionalidades:**
  - Cálculo de distância usando Haversine
  - Botão "Entrar no abrigo" **desabilitado** se acessado via consulta (`?from=consulta`)
  - Botão "Entrar no abrigo" **habilitado** se acessado após cadastro (`?from=cadastro`)

### **Consulta de Desabrigados, Pets e Abrigos**
- **Arquivo:** `src/components/Desabrigados/Desabrigados.jsx`
- **Descrição:** Página de consulta pública
- **Funcionalidades:**
  - Lista pessoas desabrigadas
  - Lista pets perdidos/encontrados
  - Lista abrigos com vagas disponíveis
  - Acesso a abrigos próximos através de parâmetro `?from=consulta`

### **Perfil do Usuário**
- **Arquivo:** `src/pages/Usuario/Usuario.jsx`
- **Descrição:** Gerenciamento de dados pessoais
- **Funcionalidades por Role:**
  - **User:** Ver/editar dados pessoais e desabrigado
  - **Manager:** Gerenciar abrigo próprio, usuários e pets do abrigo
  - **Admin:** Gerenciar tudo

### **Painel Admin**
- **Arquivo:** `src/pages/Admin/AdminPainel.jsx`
- **Descrição:** Hub central de administração
- **Funcionalidades:**
  - Acesso rápido a todas as páginas de gerenciamento
  - Visível apenas para admins e managers

---

## 🧩 Componentes Principais

### **Header**
- **Arquivo:** `src/components/header/Header.jsx`
- **Funcionalidades:**
  - Navegação responsiva
  - Exibe nome do usuário (se manager/admin)
  - Nome do usuário clicável leva para `/profile`
  - Botões condicionais por autenticação
  - Botão de logout

### **Footer**
- **Arquivo:** `src/components/footer/Footer.jsx`
- **Funcionalidades:**
  - Informações de contato
  - Links úteis
  - Copyright

---

## 🔐 Autenticação e Segurança

### **Como Funciona**

1. **Login:** Usuário envia email e senha
2. **Token JWT:** API retorna token que é armazenado em `localStorage`
3. **Requisições:** Token é enviado no header `Authorization: Bearer <token>`
4. **Verificação:** Frontend decodifica token para obter `id`, `email` e `role`
5. **Proteção:** Rotas verificam se usuário está autenticado

### **Exemplo de Requisição com Autenticação**

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
})

// Adiciona token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
```

---

## 📡 Comunicação com a API

### **Arquivo Base**
- **Arquivo:** `src/services/api.js`
- **Descrição:** Configuração do Axios para comunicação com backend

### **Exemplo de Chamada à API**

```javascript
import api from "../../services/api"

// GET
const response = await api.get('/desabrigados')

// POST
const response = await api.post('/desabrigados', {
  nome_completo: 'João',
  contato: '11999999999'
})

// PUT
const response = await api.put(`/desabrigados/${id}`, {
  status: 'ABRIGADO'
})

// DELETE
const response = await api.delete(`/desabrigados/${id}`)
```

---

## 🗺️ Geolocalização

O frontend usa a **Geolocation API** do navegador para obter coordenadas:

```javascript
const buscarLocalizacao = () => {
  navigator.geolocation.getCurrentPosition((position) => {
    setLatitude(position.coords.latitude.toString())
    setLongitude(position.coords.longitude.toString())
  })
}
```

### **Cálculo de Distância**

Usa a fórmula de **Haversine** para calcular distância entre dois pontos (latitude/longitude):

```javascript
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Raio da Terra em km
  // ... cálculo matemático ...
  return distancia_em_km
}
```

---

## 🎨 Estilos

### **Estrutura CSS**

- **Estilos Globais:** `src/style/globalStyle.scss`
- **Módulos CSS:** Cada página/componente tem seu próprio `*.module.scss`

### **Exemplo**

```scss
// src/pages/Landing/Landing.module.scss
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.boxContainer {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}
```

---

## ⚠️ Estados de Erro

O frontend tratacertos erros comuns:

```javascript
if (loading) {
  return <p>Carregando...</p>
}

if (error) {
  return <p>Erro: {error}</p>
}
```

---

## 🔄 Fluxo de Dados

### **Exemplo: Registro de Desabrigado**

1. Usuário preenche formulário em `/register/desabrigado`
2. Frontend faz requisição `POST /desabrigados` com os dados
3. API salva no banco de dados
4. Frontend redireciona para `/desabrigados/{id}/abrigos-proximos?from=cadastro`
5. Página carrega abrigos próximos ordenados por distância
6. Usuário pode clicar em "Entrar no abrigo" para se registrar nele
7. API incrementa `capacidade_atual` do abrigo
8. Usuário é redirecionado para home

---

## 🚀 Como Executar

### **Instalação**

```bash
# Na pasta frontend
cd onShelter_f/onShelter
npm install
```

### **Desenvolvimento**

```bash
npm run dev
# Abre em http://localhost:5173
```

### **Build para Produção**

```bash
npm run build
npm run preview
```

---

## 📚 Dependências Principais

| Dependência | Versão | Uso |
|-------------|--------|-----|
| React | 19.2.5 | Framework UI |
| React Router | 7.14.2 | Roteamento |
| Axios | 1.15.2 | Requisições HTTP |
| JWT Decode | 4.0.0 | Decodificar tokens |
| SASS | 1.99.0 | Estilos avançados |

---

## 🐛 Troubleshooting

### **Problema: Token expirado**
- **Solução:** Fazer logout e login novamente

### **Problema: Não consegue acessar geolocalização**
- **Solução:** Permitir permissão no navegador ou inserir manualmente

### **Problema: Erros de CORS**
- **Solução:** Verificar configuração de CORS na API

---


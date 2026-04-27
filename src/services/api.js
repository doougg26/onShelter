import axios from "axios"; 

const api = axios.create({
  baseURL: "http://localhost:3000/",
  headers: {
    "Content-Type": "application/json",
  },
});

// const cepApi = axios.create({
//   baseURL: "https://brasilapi.com.br/api/cep/v2/",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });



api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

export default  api ;
// export { cepApi };
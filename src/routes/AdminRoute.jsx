import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import {jwtDecode} from "jwt-decode"

export default function AdminRoute({ children }) {
  const { token } = useContext(AuthContext)

  if (!token) {
    return <Navigate to="/login" />
  }

  const decoded = jwtDecode(token)
  if (decoded.role !== "admin" && decoded.role !== "manager") {
    return <Navigate to="/" />
  }

  return children
}

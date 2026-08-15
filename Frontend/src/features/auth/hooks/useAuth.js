import { useContext } from "react";
import { AuthContext } from "../auth.context.jsx";

export const useAuth = () => useContext(AuthContext);

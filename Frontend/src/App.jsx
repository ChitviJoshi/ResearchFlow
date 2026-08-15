import AppRoutes from "./app.routes.jsx";
import { AuthProvider } from "./features/auth/auth.context.jsx";

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;

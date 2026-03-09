import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { authApi } from "../api/axios";
import axios from "axios";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Obtener cookie CSRF
            // Dentro de tu función handleLogin, antes del POST:
            await authApi.get('/sanctum/csrf-cookie', { withCredentials: true });
            // 2. Realizar login
            const res = await api.post("/login", { email, password });

            // 3. Procesar respuesta (Asumimos JSON limpio del backend)
            const { user, token } = res.data;

            if (user && token) {
                localStorage.setItem("token", token);
                localStorage.setItem("role", user.role);

                navigate(user.role === "admin" ? "/admin/dashboard" : "/client/dashboard");
            }
        } catch (err) {
            console.error("Error en login:", err);
            alert("Credenciales incorrectas o error de conexión.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans">
            {/* SECCIÓN IZQUIERDA: Marca y Mensaje */}
            <div className="w-full md:w-1/2 bg-gradient-to-br from-[#0c516e] to-[#084055] text-white flex flex-col items-center justify-center p-12 relative overflow-hidden">
                <div className="relative z-10 text-center md:text-left">
                    <h1 className="text-5xl font-extrabold mb-6">Bienvenido</h1>
                    <p className="text-xl text-cyan-100 max-w-sm">Gestiona tus operaciones de forma segura y eficiente desde tu panel centralizado.</p>
                </div>
            </div>

            {/* SECCIÓN DERECHA: Formulario */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-10 bg-white shadow-2xl">
                <div className="w-full max-w-sm space-y-8">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Iniciar Sesión</h2>
                        <p className="text-slate-500 mt-2">Accede a tu cuenta de KoonSystem</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <input
                            type="email"
                            placeholder="Correo Electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0c516e] outline-none transition"
                            required
                        />
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0c516e] outline-none transition"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? 'Ocultar' : 'Mostrar'}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-xl text-white font-bold transition ${loading ? 'bg-slate-400' : 'bg-[#0c516e] hover:bg-[#084055] shadow-lg hover:shadow-xl'}`}
                        >
                            {loading ? "Autenticando..." : "Ingresar"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
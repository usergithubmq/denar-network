import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaLock, FaEnvelope, FaEye, FaEyeSlash, FaShieldAlt } from "react-icons/fa";
import logo from '../assets/kf3d.png'

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await authApi.get('/sanctum/csrf-cookie');
            const res = await authApi.post("/login", { email, password });

            const { user, token } = res.data;
            if (user && token) {
                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(user));
                localStorage.setItem("role", user.role);

                // NUEVA LÓGICA DE REDIRECCIÓN POR ROL
                if (user.role === "admin") {
                    navigate("/admin/dashboard");
                } else if (user.role === "cliente") {
                    navigate("/client/dashboard");
                } else if (user.role === "cliente_final") {
                    // 👈 Aquí es donde sucede la magia para el usuario de la App/Agencia
                    navigate("/my/dashboard");
                } else {
                    // Por si acaso cae un rol no definido
                    navigate("/login");
                }
            }

        } catch (err) {
            setError("Credenciales no válidas. Intente de nuevo.");
            console.error("Error en login:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] p-4 overflow-hidden relative">
            {/* Decoración de fondo (Blur Orbs) */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-teal-200 rounded-full blur-[120px] opacity-50" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#0c516e] rounded-full blur-[120px] opacity-20" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-5xl flex flex-col md:flex-row bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white overflow-hidden"
            >
                {/* SECCIÓN IZQUIERDA: Identidad Visual */}
                <div className="w-full md:w-1/2 bg-[#0c516e] p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute rotate-45 top-10 left-10 w-64 h-64 border-4 border-white rounded-full" />
                        <div className="absolute rotate-45 bottom-20 right-10 w-40 h-40 border-8 border-white rounded-3xl" />
                    </div>

                    <div className="relative z-10">
                        <motion.h1
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-1xl font-normal tracking-tighter mb-1"
                        >
                            KOON<span className="text-teal-400">SYSTEM</span>
                        </motion.h1>
                        <div className="h-1 w-12 bg-teal-400 rounded-full" />
                    </div>
                    <div className="relative h-32 w-full flex justify-center items-center">
                        {/* 1. El contenedor padre DEBE tener una altura definida (ej. h-32) 
          para que el resto del contenido sepa dónde empezar.
    */}
                        <img
                            src={logo}
                            alt="Koon System"
                            className="absolute h-[480%] w-auto max-w-none object-contain opacity-90 pointer-events-none"
                        />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-normal leading-tight mb-6">Seguridad en cada transacción.</h2>
                        <p className="text-cyan-100  font-light max-w-xs leading-relaxed">
                            Panel de control inteligente para la gestión de activos y cuentas CLABE.
                        </p>
                    </div>

                    <div className="relative z-10 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-400">
                        <FaShieldAlt /> 256-bit AES Encryption
                    </div>
                </div>

                {/* SECCIÓN DERECHA: Formulario Pro */}
                <div className="w-full md:w-1/2 p-12 md:p-16 bg-white flex flex-col justify-center">
                    <div className="mb-10">
                        <h3 className="text-3xl font-normal text-slate-800 tracking-tight">Bienvenido</h3>
                        <p className="text-slate-400 font-medium mt-1">Ingresa tus credenciales de acceso</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm font-bold rounded-r-xl"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="group space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Corporativo</label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0c516e] transition-colors" />
                                <input
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none ring-0 focus:bg-white focus:ring-4 focus:ring-[#0c516e]/5 focus:border-[#0c516e] transition-all duration-300 font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                                    required
                                />
                            </div>
                        </div>

                        <div className="group space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña de acceso</label>
                            <div className="relative">
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0c516e] transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none ring-0 focus:bg-white focus:ring-4 focus:ring-[#0c516e]/5 focus:border-[#0c516e] transition-all duration-300 font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0c516e] transition-colors"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button type="button" className="text-xs font-bold text-slate-400 hover:text-[#0c516e] transition-colors uppercase tracking-wider">
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02, translateY: -2 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className={`w-full py-5 rounded-[1.2rem] text-white font-black tracking-widest uppercase text-xs transition-all flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(12,81,110,0.2)] ${loading
                                ? 'bg-slate-300 cursor-not-allowed'
                                : 'bg-[#0c516e] hover:bg-[#084158] hover:shadow-[0_15px_30px_rgba(12,81,110,0.3)]'
                                }`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : "Ingresar al Panel"}
                        </motion.button>
                    </form>

                    <p className="text-center mt-10 text-[10px] text-slate-300 font-bold uppercase tracking-[0.3em]">
                        Koon Finansen © 2026
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
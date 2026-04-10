import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authApi } from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaLock, FaEnvelope, FaEye, FaEyeSlash, FaShieldAlt, FaArrowRight, FaSpinner } from "react-icons/fa";
import ForgotPasswordModal from "./components/ForgotPasswordModal";

export default function Login() {
    const { slug } = useParams();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isBrandingLoading, setIsBrandingLoading] = useState(!!slug);
    const [error, setError] = useState("");

    // ESTADO DEL BRANDING (Valores por defecto de Denar)
    const [brand, setBrand] = useState({
        name: "DENAR",
        color: "#22d3ee",
        logo: "/denarTexto.png", // Asegúrate que esté en /public
        slogan: "La infraestructura líquida para el capital inteligente.",
        network: "denar.network"
    });

    // CARGA DE BRANDING REAL DESDE LA API
    useEffect(() => {
        const fetchBranding = async () => {
            if (!slug) return;
            try {
                // AGREGAMOS /api ANTES DE /branding
                const res = await authApi.get(`/api/branding/${slug}`);

                if (res.data) {
                    setBrand({
                        name: res.data.name,
                        color: res.data.color,
                        // El logo ya viene con asset() desde tu controlador
                        logo: res.data.logo || "/denarTexto.png",
                        slogan: res.data.slogan || "Bienvenido al nodo de pagos.",
                        network: res.data.network || `${slug}`
                    });
                }
            } catch (err) {
                console.warn("Nodo no personalizado o error de conexión. Usando Denar Core.");
                // Opcional: Si el slug no existe, podrías redirigir al login normal
                // navigate('/login'); 
            } finally {
                setIsBrandingLoading(false);
            }
        };
        fetchBranding();
    }, [slug]);

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
                const routes = { admin: "/admin/dashboard", cliente: "/client/dashboard", cliente_final: "/my/dashboard" };
                navigate(routes[user.role] || "/login");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Acceso denegado. Verifica tus credenciales.");
        } finally {
            setLoading(false);
        }
    };

    // Pantalla de carga sutil para evitar parpadeo de colores
    if (isBrandingLoading) {
        return (
            <div className="min-h-screen bg-[#051d26] flex items-center justify-center">
                <FaSpinner className="animate-spin text-white/20 text-2xl" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#051d26] p-6 overflow-hidden relative font-sans transition-colors duration-1000"
            style={{
                // Aumentamos la opacidad del color de la marca para que brille detrás del card
                backgroundColor: '#051d26',
                backgroundImage: `radial-gradient(circle at center, ${brand.color}90 0%, #051d26 100%)`
            }}
        >

            {/* ORBE DE FONDO DINÁMICO */}
            <div
                className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[140px] animate-pulse transition-all duration-1000"
                style={{ backgroundColor: `${brand.color}22` }}
            />

            {/* REJILLA DINÁMICA */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none transition-all duration-1000"
                style={{
                    backgroundImage: `linear-gradient(${brand.color} 1px, transparent 1px), linear-gradient(90deg, ${brand.color} 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[1100px] flex flex-col md:flex-row bg-white/[0.02] backdrop-blur-3xl rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.6)] border border-white/10 overflow-hidden relative z-10"
            >
                {/* SECCIÓN IZQUIERDA: IDENTIDAD */}
                <div className="w-full md:w-[45%] p-12 bg-gradient-to-br from-white/[0.05] to-transparent flex flex-col justify-between relative border-r border-white/5">
                    <div className="relative flex justify-center items-center py-10">
                        <motion.img
                            key={brand.logo}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: [0, -15, 0] }}
                            transition={{ opacity: { duration: 0.5 }, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
                            src={brand.logo}
                            className="w-64 h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                        />
                    </div>

                    <div className="relative z-10 space-y-4">
                        <p className="text-md text-white/80 font-light leading-snug max-w-xs">
                            "{brand.slogan}"
                        </p>
                        <div className="flex items-center gap-4 text-[9px] font-bold text-white/40 tracking-[0.2em] uppercase">
                            <div className="flex items-center gap-2 border border-white/10 px-3 py-1 rounded-full bg-white/5">
                                <FaShieldAlt style={{ color: brand.color }} /> Protocol 256-AES
                            </div>
                            <span>DENAR v2.6</span>
                        </div>
                    </div>
                </div>

                {/* SECCIÓN DERECHA: FORMULARIO */}
                <div className="w-full md:w-[55%] p-12 md:p-20 bg-transparent flex flex-col justify-center">
                    <div className="mb-12">
                        <h3 className="text-4xl font-light text-white tracking-tight">Acceso</h3>
                        <p className="text-white/40 font-medium mt-2 text-sm">Inicia sesión en el nodo de <span className="text-white">{brand.name}</span>.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-8">
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-red-500/10 border border-red-500/50 p-5 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center gap-3"
                                >
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-6">
                            {/* EMAIL */}
                            <div className="group relative">
                                <label className="absolute -top-2.5 left-4 bg-[#051d26] px-2 text-[9px] font-black uppercase tracking-[0.2em] z-10 transition-all"
                                    style={{ color: `${brand.color}cc` }}>
                                    Identificador
                                </label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-14 pr-6 py-5 bg-white/[0.03] border border-white/10 rounded-2xl text-white outline-none transition-all duration-500 focus:bg-white/[0.07]"
                                        onFocus={(e) => e.target.style.borderColor = brand.color}
                                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                        placeholder="usuario@dominio.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* PASSWORD */}
                            <div className="group relative">
                                <label className="absolute -top-2.5 left-4 bg-[#051d26] px-2 text-[9px] font-black uppercase tracking-[0.2em] z-10 transition-all"
                                    style={{ color: `${brand.color}cc` }}>
                                    Security Key
                                </label>
                                <div className="relative">
                                    <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-14 pr-14 py-5 bg-white/[0.03] border border-white/10 rounded-2xl text-white outline-none transition-all duration-500 focus:bg-white/[0.07]"
                                        onFocus={(e) => e.target.style.borderColor = brand.color}
                                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                    <button
                                        type="button" // Importante que sea type button para que no dispare el submit del login
                                        onClick={() => setShowForgotModal(true)}
                                        className="text-cyan-300 hover:text-cyan-500 text-sm transition-colors"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </button>
                                </div>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01, y: -2 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={loading}
                            className={`w-full py-6 rounded-2xl text-[10px] font-black tracking-[0.3em] uppercase transition-all flex items-center justify-center gap-4 relative overflow-hidden group
                                ${loading ? 'bg-white/10 text-white/20' : 'bg-white text-[#051d26]'}`}
                        >
                            {loading ? (
                                <FaSpinner className="animate-spin text-xl" />
                            ) : (
                                <>
                                    <span>Inicializar Sesión</span>
                                    <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
                                </>
                            )}
                            <div
                                className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-1000 group-hover:left-full opacity-30"
                                style={{ background: `linear-gradient(90deg, transparent, ${brand.color}, transparent)` }}
                            />
                        </motion.button>
                    </form>
                    <ForgotPasswordModal
                        isOpen={showForgotModal}
                        onClose={() => setShowForgotModal(false)}
                    />

                    <div className="mt-12 flex flex-col items-center gap-2 opacity-20">
                        {slug && <span className="text-[8px] font-bold text-white uppercase tracking-[0.3em]">Operated by Denar Network</span>}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
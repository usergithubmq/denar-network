import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ShieldCheck, Lock, Eye, EyeOff, ArrowRight, RefreshCcw } from "lucide-react";

const ResetPassword = () => {
    const { token } = useParams();
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email");
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: "", text: "" });

    // Efecto de entrada suave
    useEffect(() => {
        document.title = "Denar | Security Update";
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: "", text: "" });

        try {
            await axios.post("http://localhost:8000/api/reset-password", {
                token,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });

            setStatus({ type: "success", text: "Protocolos de seguridad actualizados. Redirigiendo..." });
            setTimeout(() => navigate("/login"), 2500);
        } catch (error) {
            setStatus({
                type: "error",
                text: error.response?.data?.message || "Fallo en la sincronización de credenciales."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-[#020c10] overflow-hidden font-sans">

            {/* --- BACKGROUND LAYER: Video & Canvas Effect --- */}
            <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-30 scale-110">
                <source src="/video/us.mp4" type="video/mp4" />
            </video>

            {/* Gradientes de superposición para legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#020c10]/90 via-[#020c10]/40 to-[#020c10]/90"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#020c10_100%)]"></div>

            <div className="relative z-10 w-full max-w-md p-4 animate-in fade-in zoom-in duration-700">

                {/* --- LOGO HERO (Similar al Home) --- */}
                <div className="flex justify-center mb-1 drop-shadow-[0_0_25px_rgba(96,226,255,0.9)]">
                    <img
                        src="/denarTexto.png"
                        alt="Denar Logo"
                        className="h-20 md:h-28 object-contain animate-pulse select-none"
                        style={{ filter: 'brightness(1.1) contrast(1.1)' }}
                    />
                </div>

                {/* --- MAIN CARD: Glassmorphism Ultra --- */}
                <div className="relative group">
                    {/* Borde Neón Animado Exterior */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-[2.5rem] blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>

                    <div className="relative bg-[#051d26]/60 backdrop-blur-[24px] border border-white/5 p-8 rounded-[2rem] shadow-2xl overflow-hidden">

                        {/* Decoración de esquina superior */}
                        <div className="absolute top-0 right-0 p-4">
                            <RefreshCcw className={`w-4 h-4 text-cyan-500/30 ${loading ? 'animate-spin' : ''}`} />
                        </div>

                        <div className="mb-8">
                            <h2 className="text-2xl font-light text-white tracking-[0.1em] uppercase">
                                Actualizar <span className="font-black text-[#60e2ff]">Acceso</span>
                            </h2>
                            <div className="h-px w-12 bg-cyan-500 mt-2"></div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Input: Password */}
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-[0.3em] text-cyan-500/70 font-bold ml-1">Nueva Clave</label>
                                <div className="relative group/input">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/input:text-[#60e2ff] transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="w-full bg-[#020c10]/50 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-white outline-none focus:border-cyan-500/50 focus:bg-[#020c10]/80 transition-all text-sm tracking-widest"
                                        placeholder="••••••••"
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#60e2ff] transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Input: Confirmación */}
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-[0.3em] text-cyan-500/70 font-bold ml-1">Verificación</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 focus-within:text-[#60e2ff]" />
                                    <input
                                        type="password"
                                        className="w-full bg-[#020c10]/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-cyan-500/50 focus:bg-[#020c10]/80 transition-all text-sm tracking-widest"
                                        placeholder="••••••••"
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Feedback Message */}
                            {status.text && (
                                <div className={`p-4 rounded-2xl text-[11px] uppercase tracking-wider flex items-center gap-3 animate-in slide-in-from-bottom-2 ${status.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                                    }`}>
                                    <div className="relative flex h-2 w-2">
                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status.type === "success" ? "bg-green-400" : "bg-red-400"}`}></span>
                                        <span className={`relative inline-flex rounded-full h-2 w-2 ${status.type === "success" ? "bg-green-400" : "bg-red-400"}`}></span>
                                    </div>
                                    {status.text}
                                </div>
                            )}

                            {/* Action Button: Liquid Style */}
                            <button
                                disabled={loading}
                                className="group relative w-full h-[60px] bg-white text-[#051d26] rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[#60e2ff]/20 transition-all active:scale-[0.97] overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-[#60e2ff] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    {loading ? "Sincronizando..." : (
                                        <>
                                            Reconfigurar Credenciales
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>
                    </div>
                </div>

                {/* Footer Copy */}
                <div className="mt-12 text-center">
                    <a href="https://denar.network" className="text-slate-600 hover:text-cyan-500 text-[10px] uppercase tracking-[0.4em] transition-colors">
                        DENAR NETWORK — 2026
                    </a>
                </div>
            </div>

            {/* Inyectamos estilos de animación específicos */}
            <style jsx>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
                input::placeholder {
                    letter-spacing: normal;
                }
            `}</style>
        </div>
    );
};

export default ResetPassword;
import { useState } from "react";
import axios from "axios";

const ForgotPasswordModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    if (!isOpen) return null; // No renderiza nada si está cerrado

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            await axios.post("http://localhost:8000/api/forgot-password", { email });
            setMessage({ type: "success", text: "¡Listo! Revisa tu correo (Mailtrap)." });
            setTimeout(() => { onClose(); setMessage({ type: "", text: "" }); }, 3000);
        } catch (error) {
            setMessage({ type: "error", text: error.response?.data?.message || "Error al enviar el link." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay con Blur */}
            <div className="absolute inset-0 bg-[#051d26]/70 backdrop-blur-md" onClick={onClose}></div>

            {/* Contenido del Modal */}
            <div className="relative bg-[#051d26]/100 border border-cyan-500/40 p-8 rounded-2xl w-full max-w-md shadow-[0_0_50px_rgba(6,182,212,0.15)] animate-in fade-in zoom-in duration-300">
                <h2 className="text-2xl font-bold text-white mb-2">Recuperar Acceso</h2>
                <p className="text-slate-400 text-sm mb-6">Enviaremos un enlace de restauración a tu correo institucional.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs uppercase tracking-widest text-cyan-500 font-bold">Email de usuario</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-3 mt-1 text-white outline-none focus:border-cyan-500 transition-all"
                            placeholder="ejemplo@denar.network"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {message.text && (
                        <p className={`text-xs p-2 rounded ${message.type === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                            {message.text}
                        </p>
                    )}

                    <div className="flex gap-4 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-slate-400 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-[#60e2ff] hover:bg-cyan-500 text-white py-2 rounded-lg font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] disabled:opacity-50 transition-all"
                        >
                            {loading ? "Enviando..." : "Enviar Enlace"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
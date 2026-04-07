import React, { useState, useEffect } from "react";
import { FaLock, FaCheckCircle, FaExclamationTriangle, FaEye, FaEyeSlash, FaCheck, FaTimes } from "react-icons/fa";
import api from "../../../api/axios";

export default function PasswordResetModal({ isOpen, onSuccess }) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // 👈 Nuevo estado
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Validaciones en tiempo real
    const checks = {
        length: password.length >= 10,
        upper: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
        symbol: /[^A-Za-z0-9]/.test(password),
    };

    const strength = Object.values(checks).filter(Boolean).length * 25;

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!Object.values(checks).every(Boolean)) {
            setError("Tu contraseña no cumple con todos los requisitos de seguridad.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setLoading(true);
        try {
            await api.post("/auth/update-first-password", { password });
            const user = JSON.parse(localStorage.getItem('user'));
            localStorage.setItem('user', JSON.stringify({ ...user, must_change_password: false }));
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || "Error al actualizar la contraseña");
        } finally {
            setLoading(false);
        }
    };

    const getStrengthColor = () => {
        if (strength <= 25) return "bg-red-500";
        if (strength <= 50) return "bg-orange-500";
        if (strength <= 75) return "bg-yellow-500";
        return "bg-teal-500";
    };

    const Requirement = ({ met, text }) => (
        <div className={`flex items-center gap-2 text-[11px] transition-colors ${met ? 'text-teal-600 font-bold' : 'text-slate-400'}`}>
            {met ? <FaCheck className="text-[10px]" /> : <FaTimes className="text-[10px]" />}
            {text}
        </div>
    );

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />

            <div className="relative bg-white/95 backdrop-blur-2xl border border-white/50 p-8 rounded-3xl shadow-2xl w-full max-w-md transform transition-all animate-in zoom-in duration-300">
                <div className="flex flex-col items-center text-center mb-6">
                    {/* Logo un poco más grande (h-28) */}
                    <div className="h-28 flex items-center justify-center px-4">
                        <img
                            src="/denarTexto.png"
                            alt="Denar Network"
                            className="h-full object-contain filter drop-shadow-sm contrast-110"
                        />
                    </div>
                    <p className="text-slate-600 text-sm font-light mt-2">
                        Configura tu acceso
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Primera Contraseña */}
                    <div className="space-y-3">
                        <div className="relative">
                            <FaLock className="absolute left-3 top-4 text-slate-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Nueva contraseña"
                                className="w-full pl-10 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#051d26] outline-none transition-all text-slate-800 font-medium"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-4 text-slate-400 hover:text-[#051d26] transition-colors"
                            >
                                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                            </button>
                        </div>

                        {/* Checklist y Barra de Fuerza */}
                        <div className="grid grid-cols-2 gap-2 px-1">
                            <Requirement met={checks.length} text="10+ Caracteres" />
                            <Requirement met={checks.upper} text="Una Mayúscula" />
                            <Requirement met={checks.number} text="Un Número" />
                            <Requirement met={checks.symbol} text="Un Símbolo (!@#)" />
                        </div>

                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1">
                            <div className={`h-full transition-all duration-500 ${getStrengthColor()}`} style={{ width: `${strength}%` }} />
                        </div>
                    </div>

                    {/* Confirmar Contraseña (con Segundo Ojo) */}
                    <div className="relative">
                        <FaLock className="absolute left-3 top-4 text-slate-400" />
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirmar contraseña"
                            className={`w-full pl-10 pr-20 py-3.5 bg-white border rounded-xl focus:ring-2 outline-none transition-all text-slate-800 font-medium ${confirmPassword && password === confirmPassword
                                ? 'border-teal-500 focus:ring-teal-500'
                                : 'border-slate-200 focus:ring-[#051d26]'
                                }`}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        {/* Grupo de iconos a la derecha */}
                        <div className="absolute right-3 top-4 flex items-center gap-2">
                            {confirmPassword && password === confirmPassword && (
                                <FaCheckCircle className="text-teal-500 animate-pulse" />
                            )}
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="text-slate-400 hover:text-[#051d26] transition-colors pl-1 border-l border-slate-100"
                            >
                                {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-[11px] border border-red-100">
                            <FaExclamationTriangle className="flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-xl transform transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#051d26] hover:bg-[#0b2d3a]'
                            }`}
                    >
                        {loading ? "Sincronizando..." : "Activar Mi Cuenta"}
                    </button>
                </form>

                <p className="text-center text-slate-400 text-[10px] uppercase tracking-widest mt-8 font-bold">
                    Denar Network Security Center © 2026
                </p>
            </div>
        </div>
    );
}
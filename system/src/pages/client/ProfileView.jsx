import React, { useState, useRef, useEffect } from 'react';
import api from "../../api/axios";
import { motion } from "framer-motion";
import {
    FaCamera, FaSave, FaBuilding, FaCheckCircle, FaSpinner,
    FaLock, FaEye, FaEyeSlash, FaPalette, FaLink, FaQuoteLeft
} from "react-icons/fa";

export default function ProfileView({ clienteInfo, onUpdate }) {
    const [profileData, setProfileData] = useState({
        nombre_comercial: '', nombre_legal: '', rfc: '', logo: null,
        slug: '', primary_color: '#0c516e', login_slogan: ''
    });

    const [passData, setPassData] = useState({ password: '', password_confirmation: '' });
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingPass, setLoadingPass] = useState(false);
    const [successProfile, setSuccessProfile] = useState(false);
    const brandColor = clienteInfo?.primary_color || "#60e2ff";
    const [successPass, setSuccessPass] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const fileInputRef = useRef(null);
    const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://app.denar.network';
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (clienteInfo) {
            setProfileData({
                nombre_comercial: clienteInfo.nombre_comercial || '',
                nombre_legal: clienteInfo.nombre_legal || '',
                rfc: clienteInfo.rfc || '',
                slug: clienteInfo.slug || '',
                primary_color: clienteInfo.primary_color || '#0c516e',
                login_slogan: clienteInfo.login_slogan || '',
                logo: null
            });
            if (clienteInfo.logo_url) setPreview(`${baseUrl}/storage/${clienteInfo.logo_url}`);
        }
    }, [clienteInfo, baseUrl]);

    const checks = {
        length: passData.password.length >= 10,
        upper: /[A-Z]/.test(passData.password),
        number: /[0-9]/.test(passData.password),
        symbol: /[!@#$%^&*(),.?":{}|<>]/.test(passData.password),
        match: passData.password.length > 0 && passData.password === passData.password_confirmation
    };

    const isPassStrong = Object.values(checks).every(Boolean);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoadingProfile(true);
        const data = new FormData();
        Object.keys(profileData).forEach(key => {
            if (key === 'logo') { if (profileData.logo instanceof File) data.append('logo', profileData.logo); }
            else { data.append(key, profileData[key]); }
        });

        try {
            await api.post("/client/profile-update", data, { headers: { 'Content-Type': 'multipart/form-data' } });
            setSuccessProfile(true);
            setTimeout(() => setSuccessProfile(false), 3000);
            if (onUpdate) onUpdate();
        } catch (err) { alert("Error: " + (err.response?.data?.message || "Error de red")); }
        finally { setLoadingProfile(false); }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (!isPassStrong) return;

        setLoadingPass(true);
        try {
            await api.post("/client/change-password", {
                password: passData.password,
                password_confirmation: passData.password_confirmation
            });
            setSuccessPass(true);
            setPassData({ password: '', password_confirmation: '' });
            setTimeout(() => setSuccessPass(false), 3000);
        } catch (err) {
            alert(err.response?.data?.message || "Error al actualizar credenciales.");
        } finally {
            setLoadingPass(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-4 py-6 px-4 font-sans text-slate-800">

            {/* SECCIÓN 1: BRANDING & IDENTIDAD (COMPACTA) */}
            <form onSubmit={handleUpdateProfile} className="bg-[#d3e0e5] rounded-2xl shadow-sm border border-[#b8bfc0] overflow-hidden">
                <div className="bg-[#051d26] px-6 py-4 flex items-center justify-between border-b border-[#60e2ff]"
                    style={{
                        // 1. Animación más lenta (8s para un barrido cinematográfico)
                        animation: 'shimmer-slow 8s linear infinite',
                        // 2. Gradiente con el color del cliente al 80% de opacidad (cc) 
                        // 3. El centro (50%) ahora es más ancho para que el color resalte
                        backgroundImage: `linear-gradient(90deg, #051a22 0%, ${brandColor}cc 20%, #062b3b 100%)`,
                        backgroundSize: '200% 100%',
                        borderBottom: `5px solid ${brandColor}66` // Borde más presente
                    }}>
                    <div className="flex items-center gap-4">
                        <div className="relative group w-14 h-14 shrink-0">
                            <div
                                onClick={() => fileInputRef.current.click()}
                                className="w-full h-full rounded-xl bg-slate-800 border border-slate-700 overflow-hidden cursor-pointer flex items-center justify-center relative"
                            >
                                {preview ? <img src={preview} className="w-full h-full object-cover" alt="Logo" /> : <FaBuilding className="text-slate-600" size={20} />}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"><FaCamera size={14} /></div>
                            </div>
                        </div>
                    </div>
                    <button
                        type="submit" disabled={loadingProfile}
                        className="bg-[#57c2ce] hover:bg-[#0a4158] text-white px-6 py-2 rounded-lg font-light text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {loadingProfile ? <FaSpinner className="animate-spin" /> : successProfile ? <FaCheckCircle /> : <FaSave />}
                        {successProfile ? 'Sincronizado' : 'Guardar'}
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                    <Field label="URL Custom (Slug)" icon={<FaLink />} value={profileData.slug}
                        onChange={v => setProfileData({ ...profileData, slug: v.toLowerCase().replace(/\s+/g, '-') })} prefix="/login/" />

                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><FaPalette /> Color Login</label>
                        <div className="flex gap-2">
                            <input type="color" className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer"
                                value={profileData.primary_color} onChange={e => setProfileData({ ...profileData, primary_color: e.target.value })} />
                            <input className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px] font-bold uppercase outline-none focus:bg-white"
                                value={profileData.primary_color} onChange={e => setProfileData({ ...profileData, primary_color: e.target.value })} />
                        </div>
                    </div>

                    <Field label="Slogan de Bienvenida" icon={<FaQuoteLeft />} value={profileData.login_slogan}
                        onChange={v => setProfileData({ ...profileData, login_slogan: v })} placeholder="Frase para login..." />

                    <div className="md:col-span-3 h-px bg-slate-100 my-1" />

                    <Field label="Nombre Comercial" value={profileData.nombre_comercial} onChange={v => setProfileData({ ...profileData, nombre_comercial: v })} />
                    <Field label="RFC" value={profileData.rfc} readOnly />
                    <Field label="Razón Social / Nombre Legal" value={profileData.nombre_legal} onChange={v => setProfileData({ ...profileData, nombre_legal: v })} span={2} />
                </div>
                <input type="file" ref={fileInputRef} onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) { setProfileData({ ...profileData, logo: file }); setPreview(URL.createObjectURL(file)); }
                }} className="hidden" accept="image/*" />
            </form>

            {/* SECCIÓN 2: SEGURIDAD (COMPACTA) */}
            <div className="bg-[#d3e0e5] rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-[#051d26] px-6 py-3 border-b border-slate-200 flex items-center gap-3 text-white">
                    <FaLock size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Protocolo de Acceso</span>
                </div>

                {/* CAMBIO: Vinculamos la función handleUpdatePassword */}
                <form onSubmit={handleUpdatePassword} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-4">
                        <div className="relative">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Nueva Contraseña</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold outline-none focus:bg-white focus:border-[#0c516e]"
                                value={passData.password}
                                onChange={e => setPassData({ ...passData, password: e.target.value })}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[34px] text-slate-300 hover:text-slate-600">
                                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                            </button>
                        </div>
                        <div className="relative">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Confirmar Contraseña</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-bold outline-none transition-all ${passData.password_confirmation ? (checks.match ? 'border-emerald-500 bg-emerald-50/10' : 'border-rose-400 bg-rose-50/10') : 'bg-slate-50 border-slate-200'}`}
                                value={passData.password_confirmation}
                                onChange={e => setPassData({ ...passData, password_confirmation: e.target.value })}
                            />
                        </div>

                        {/* BOTÓN: Ahora mostrará el spinner y reaccionará al envío */}
                        <button
                            type="submit"
                            disabled={!isPassStrong || loadingPass}
                            className={`w-full py-3 rounded-xl text-white font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${!isPassStrong || loadingPass ? 'bg-[#b4f2ee] text-slate-500 cursor-not-allowed' : 'bg-[#57c2ce] hover:bg-[#094158] shadow-lg shadow-slate-200'}`}
                        >
                            {loadingPass ? <FaSpinner className="animate-spin" /> : successPass ? <><FaCheckCircle /> Actualizado</> : "Actualizar Credenciales"}
                        </button>
                    </div>

                    {/* Indicadores de fuerza (se mantienen igual) */}
                    <div className="grid grid-cols-1 gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        {Object.entries({ "10+ Caracteres": checks.length, "Mayúscula": checks.upper, "Números": checks.number, "Símbolo": checks.symbol, "Coinciden": checks.match }).map(([label, met]) => (
                            <div key={label} className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${met ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                    {met && <FaCheckCircle className="text-white text-[10px]" />}
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-wider ${met ? 'text-slate-900' : 'text-slate-300'}`}>{label}</span>
                            </div>
                        ))}
                    </div>
                </form>
            </div>
        </div>
    );
}

function Field({ label, value, onChange, readOnly = false, span = 1, icon, prefix, placeholder }) {
    return (
        <div className={`space-y-1 ${span === 2 ? 'md:col-span-2' : ''}`}>
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">{icon} {label}</label>
            <div className={`flex items-center rounded-xl border border-slate-200 overflow-hidden transition-all ${readOnly ? 'bg-slate-50' : 'focus-within:ring-1 focus-within:ring-[#0c516e] bg-slate-50 focus-within:bg-white'}`}>
                {prefix && <span className="pl-3 text-[10px] text-slate-500 font-bold">{prefix}</span>}
                <input
                    readOnly={readOnly} placeholder={placeholder}
                    className="w-full px-3 py-2.5 bg-transparent text-[12px] font-bold outline-none text-slate-700"
                    value={value} onChange={e => onChange && onChange(e.target.value)}
                />
            </div>
        </div>
    );
}
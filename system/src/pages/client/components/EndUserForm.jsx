import React, { useState } from "react";
import { FaSearch, FaSpinner, FaCalculator, FaCheckCircle, FaUserShield, FaIdCard, FaEnvelope, FaHashtag, FaBirthdayCake, FaMapMarkerAlt, FaVenusMars, FaMoneyBillWave } from "react-icons/fa";
import api, { authApi } from "../../../api/axios";

function InputField({ label, value, onChange, icon }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                {icon} {label}
            </label>
            <input
                type="number"
                value={value}
                onChange={e => onChange(e.target.value)}
                className="p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-sm font-bold text-[#0c516e] focus:border-teal-500 focus:bg-white outline-none transition-all"
            />
        </div>
    );
}

export default function EndUserForm({ onUserCreated }) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [tempData, setTempData] = useState(null);
    const [formData, setFormData] = useState({
        document_value: "",
        email: "",
        referencia_interna: "",
        // Limpiamos los estados financieros a lo mínimo necesario
        monto_normal: 0,
        moratoria: 0,
    });

    const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;

    const handleValidate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authApi.get('/sanctum/csrf-cookie', { withCredentials: true });
            const res = await api.post("/client/validate-pagador", {
                type: "CURP",
                value: formData.document_value
            });
            setTempData(res.data.data);
            setStep(2);
        } catch (err) {
            console.error("Error validación:", err);
            alert("Error al validar: " + (err.response?.data?.message || "Revisa la CURP"));
        } finally { setLoading(false); }
    };

    const handleConfirmAndCreate = async () => {
        setLoading(true);
        try {
            // 1. Crear el Pagador (EndUser)
            const userRes = await api.post("/client/end-users", {
                name: `${tempData?.nombre} ${tempData?.apellidoPaterno} ${tempData?.apellidoMaterno}`,
                email: formData.email,
                referencia_interna: formData.referencia_interna,
                document_value: formData.document_value
            });

            // 2. Generar el Plan de Pago (Solo con lo que pediste)
            await api.post("/client/plan-pago/generar", {
                user_id: userRes.data.pagador.id,
                cuenta_beneficiario: userRes.data.pagador.clabe_stp,
                referencia_contrato: formData.referencia_interna,
                monto_normal: Number(formData.monto_normal),
                moratoria: Number(formData.moratoria),
                estado: 'pendiente'
            });

            alert("✅ ¡Éxito! Pagador y Plan de Pagos creados.");
            resetForm();
            if (onUserCreated) onUserCreated();
        } catch (err) {
            alert("Error: " + (err.response?.data?.error || "Revisa la consola"));
        } finally { setLoading(false); }
    };

    const resetForm = () => {
        setStep(1);
        setFormData({ document_value: "", email: "", referencia_interna: "", monto_normal: 0, moratoria: 0 });
        setTempData(null);
    };

    return (
        <div className="bg-white p-8 rounded-[2rem] border-2 border-teal-500/10 shadow-2xl mb-10 overflow-hidden">
            {step === 1 ? (
                <form onSubmit={handleValidate} className="space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                        <h3 className="text-md font-medium text-[#0c516e] flex items-center gap-2 uppercase tracking-tighter">
                            <FaUserShield className="text-teal-500" /> Nuevo Pagador
                        </h3>
                        <span className="text-[10px] font-bold bg-teal-50 text-teal-600 px-3 py-1 rounded-full uppercase tracking-widest">Paso 1: Validación</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-medium text-slate-400 uppercase flex items-center gap-2"><FaIdCard /> CURP</label>
                            <input
                                required
                                type="text"
                                maxLength={18}
                                placeholder="CURP de 18 dígitos"
                                value={formData.document_value}
                                onChange={e => setFormData({ ...formData, document_value: e.target.value.toUpperCase().replace(/[^a-zA-Z0-9]/g, "") })}
                                className={`p-4 rounded-2xl border-2 transition-all text-sm ${curpRegex.test(formData.document_value) ? "border-slate-100 focus:border-teal-500" : "border-red-100 focus:border-red-500"}`}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-medium text-slate-400 uppercase flex items-center gap-2"><FaEnvelope /> Email</label>
                            <input
                                required
                                type="email"
                                placeholder="correo@cliente.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="p-4 rounded-2xl border-2 border-slate-100 text-sm focus:border-teal-500 outline-none transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-medium text-slate-400 uppercase flex items-center gap-2"><FaHashtag /> Referencia</label>
                            <input
                                type="text"
                                placeholder="Contrato-001"
                                value={formData.referencia_interna}
                                onChange={e => setFormData({ ...formData, referencia_interna: e.target.value })}
                                className="p-4 rounded-2xl border-2 border-slate-100 text-sm focus:border-teal-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <button disabled={loading} className="w-full md:w-auto float-right bg-[#0c516e] text-white px-12 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-[#0a435c] transition-all shadow-lg">
                        {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />} VALIDAR IDENTIDAD
                    </button>
                </form>
            ) : (
                <div className="animate-in slide-in-from-right-4 duration-300">
                    {/* Header de Usuario Validado */}
                    <div className="bg-gradient-to-r from-[#0c516e] to-[#146c91] p-6 rounded-[1.5rem] mb-8 text-white shadow-xl relative overflow-hidden">
                        <div className="flex items-center gap-5 relative z-10 mb-6">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                                <FaCheckCircle className="text-teal-300" size={30} />
                            </div>
                            <div>
                                <p className="text-teal-300 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Usuario Validado</p>
                                <h4 className="text-xl font-black">{tempData?.nombre} {tempData?.apellidoPaterno} {tempData?.apellidoMaterno}</h4>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/10 pt-4 relative z-10">
                            <div className="text-[10px] font-bold text-teal-200 uppercase flex items-center gap-2"><FaBirthdayCake /> {tempData?.fechaNacimiento}</div>
                            <div className="text-[10px] font-bold text-teal-200 uppercase flex items-center gap-2"><FaMapMarkerAlt /> {tempData?.estadoNacimiento}</div>
                            <div className="text-[10px] font-bold text-teal-200 uppercase flex items-center gap-2"><FaVenusMars /> {tempData?.sexo}</div>
                        </div>
                    </div>

                    {/* CONFIGURACIÓN FINANCIERA LIMPIA */}
                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 mb-8">
                        <h5 className="text-[#0c516e] font-black text-xs mb-6 uppercase flex items-center gap-2 tracking-widest">
                            <FaCalculator className="text-teal-500" /> Configuración de Cobro
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InputField
                                label="Monto de Mensualidad (Normal)"
                                icon={<FaMoneyBillWave className="text-teal-500" />}
                                value={formData.monto_normal}
                                onChange={v => setFormData({ ...formData, monto_normal: v })}
                            />
                            <InputField
                                label="Monto de Moratoria (Recargo)"
                                icon={<FaMoneyBillWave className="text-red-400" />}
                                value={formData.moratoria}
                                onChange={v => setFormData({ ...formData, moratoria: v })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-6 items-center">
                        <button onClick={() => setStep(1)} className="text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-red-500 transition-colors">← Corregir Datos</button>
                        <button onClick={handleConfirmAndCreate} disabled={loading} className="bg-teal-600 text-white px-12 py-4 rounded-2xl font-black text-sm hover:bg-teal-700 shadow-lg active:scale-95 transition-all">
                            {loading ? <FaSpinner className="animate-spin" /> : "ACTIVAR CUENTA Y PLAN"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
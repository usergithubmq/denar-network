import React, { useState } from "react";
import {
    FaSearch, FaSpinner, FaCalculator, FaCheckCircle, FaUserShield,
    FaIdCard, FaEnvelope, FaHashtag, FaMoneyBillWave,
    FaBuilding, FaFileInvoiceDollar, FaTimes, FaPlus, FaUserPlus
} from "react-icons/fa";
import api, { authApi } from "../../../api/axios";

export default function EndUserForm({ onUserCreated }) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [tempData, setTempData] = useState(null);

    // CORRECCIÓN: Añadidos campos para la lógica de STP
    const [formData, setFormData] = useState({
        document_value: "",
        email: "",
        referencia_interna: "",
        credito: 0,
        monto_normal: 0,
        moratoria: 0,
        monto_libre: true, // Por defecto libre
        monto_fijo: 0      // Monto para Match STP
    });

    const rfcRegex = /^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/;

    const handleValidate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authApi.get('/sanctum/csrf-cookie', { withCredentials: true });
            const res = await api.post("/client/validate-pagador", {
                type: "RFC",
                value: formData.document_value
            });
            setTempData(res.data.data);
            setStep(2);
        } catch (err) {
            const msg = err.response?.data?.message || "Error al validar RFC con el SAT";
            alert("Validación: " + msg);
        } finally { setLoading(false); }
    };

    const handleConfirmAndCreate = async () => {
        setLoading(true);
        try {
            // El monto a enviar depende de si es libre o fijo
            const montoFinal = formData.monto_libre ? 0 : Number(formData.monto_fijo);

            const res = await api.post("/client/end-users", {
                name: tempData?.nombre_o_razon_social || "Usuario Nuevo",
                email: formData.email,
                referencia_interna: formData.referencia_interna,
                document_value: formData.document_value
            });

            const newPagador = res.data.data;

            await api.post("/client/plan-pago/generar", {
                user_id: newPagador.user_id,
                cuenta_beneficiario: newPagador.clabe_stp,
                referencia_contrato: formData.referencia_interna,
                credito: Number(formData.credito),
                monto_normal: montoFinal,
                moratoria: Number(formData.moratoria),
                monto_libre: formData.monto_libre, // Enviamos bandera a tu DB
                estado: 'pendiente'
            });

            alert("✅ ¡Éxito! Pagador y Configuración STP creados.");
            resetForm();
            if (onUserCreated) onUserCreated();
        } catch (err) {
            alert("Error: " + (err.response?.data?.error || "Error al procesar el registro"));
        } finally { setLoading(false); }
    };

    const resetForm = () => {
        setStep(1);
        setFormData({
            document_value: "", email: "", referencia_interna: "",
            monto_normal: 0, moratoria: 0, monto_libre: true, monto_fijo: 0
        });
        setTempData(null);
    };

    return (
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl mb-10 overflow-hidden">
            {step === 1 ? (
                <form onSubmit={handleValidate} className="space-y-10">
                    {/* HEADER */}
                    <div className="flex justify-between items-center border-b border-slate-50 pb-8">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-2xl font-normal text-[#0c516e] flex items-center gap-3 tracking-tight">
                                <FaUserShield className="text-teal-500/50" size={24} />
                                Registro de Pagador
                            </h3>
                            <p className="text-[11px] font-normal text-slate-400 uppercase tracking-[0.2em] ml-9">
                                Validación Fiscal & Enlace de Cuentas STP
                            </p>
                        </div>
                        <span className="text-[10px] font-medium bg-slate-50 text-slate-500 border border-slate-100 px-4 py-2 rounded-full uppercase tracking-tighter">
                            Paso 1: Identificación
                        </span>
                    </div>

                    {/* GRID DE INPUTS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="flex flex-col gap-3">
                            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <FaIdCard className="text-teal-500/40" /> RFC Fiscal
                            </label>
                            <input
                                required
                                type="text"
                                maxLength={13}
                                placeholder="ABCD900101XXX"
                                value={formData.document_value}
                                onChange={e => setFormData({ ...formData, document_value: e.target.value.toUpperCase() })}
                                className={`h-14 px-6 rounded-2xl border-2 transition-all text-base font-normal outline-none
                                ${rfcRegex.test(formData.document_value) ? "border-slate-100 bg-white text-slate-800 focus:border-teal-500" : "border-red-50 bg-red-50/30 text-red-700"}`}
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <FaEnvelope className="text-teal-500/40" /> Email Notificaciones
                            </label>
                            <input
                                required
                                type="email"
                                placeholder="usuario@empresa.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="h-14 px-6 rounded-2xl border-2 border-slate-100 bg-white text-slate-800 text-base font-normal focus:border-teal-500 outline-none transition-all"
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <FaHashtag className="text-teal-500/40" /> Ref. Contrato
                            </label>
                            <input
                                type="text"
                                placeholder="ID-INTERNO"
                                value={formData.referencia_interna}
                                onChange={e => setFormData({ ...formData, referencia_interna: e.target.value })}
                                className="h-14 px-6 rounded-2xl border-2 border-slate-100 bg-white text-slate-800 text-base font-normal focus:border-teal-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button disabled={loading} className="w-full md:w-auto min-w-[280px] bg-[#0c516e] text-white px-12 py-4 rounded-2xl font-medium text-sm flex items-center justify-center gap-3 hover:bg-[#083b50] transition-all shadow-xl disabled:opacity-50">
                            {loading ? <FaSpinner className="animate-spin" /> : <FaSearch className="text-teal-400" />}
                            <span className="tracking-widest">Registrar</span>
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                    {/* CARD DE RESULTADO SAT */}
                    <div className="bg-[#0c516e] p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/20">
                                <FaCheckCircle className="text-teal-300" size={36} />
                            </div>
                            <div>
                                <span className="text-teal-300 text-[10px] font-bold uppercase tracking-[0.3em]">Validación Exitosa</span>
                                <h4 className="text-2xl font-normal tracking-tight uppercase mt-1">
                                    {tempData?.nombre_o_razon_social || "Nombre no disponible"}
                                </h4>
                                <p className="text-white/50 font-mono text-xs mt-2 tracking-widest uppercase">RFC: {tempData?.rfc}</p>
                            </div>
                        </div>
                    </div>

                    {/* CONFIGURACIÓN STP */}
                    <div className="space-y-8">
                        <div className="flex flex-col gap-1 border-l-4 border-teal-500 pl-6">
                            <h4 className="text-lg font-normal text-[#0c516e] flex items-center gap-3">
                                <FaFileInvoiceDollar className="text-teal-500/50" /> Configuración de Match STP
                            </h4>
                            <p className="text-[11px] text-slate-400 uppercase tracking-widest font-normal">Define la regla de cobro para esta CLABE</p>
                        </div>

                        {/* ACTUALIZADO: Grid de 2 filas para acomodar el nuevo campo */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                            {/* NUEVO: INPUT DE CRÉDITO TOTAL */}
                            <div className="flex flex-col gap-3">
                                <label className="text-[11px] font-medium text-slate-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <FaMoneyBillWave className="text-teal-500/40" /> Límite de Crédito Total
                                </label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-light">$</span>
                                    <input
                                        type="number"
                                        value={formData.credito}
                                        onChange={e => setFormData({ ...formData, credito: e.target.value })}
                                        className="h-14 pl-10 pr-6 w-full rounded-2xl border-2 border-slate-200 bg-white text-slate-800 text-lg font-normal focus:border-teal-500 outline-none"
                                        placeholder="50000.00"
                                    />
                                </div>
                            </div>

                            {/* MODALIDAD DE PAGO */}
                            <div className="flex flex-col gap-4">
                                <label className="text-[11px] font-medium text-slate-500 uppercase tracking-widest ml-1">Modalidad de Pago Mensual</label>
                                <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, monto_libre: true, monto_fijo: 0 })}
                                        className={`flex-1 py-3 text-[10px] font-medium rounded-xl transition-all ${formData.monto_libre ? "bg-white text-[#0c516e] shadow-md" : "text-slate-400 hover:text-slate-600"}`}
                                    >
                                        MONTO LIBRE
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, monto_libre: false })}
                                        className={`flex-1 py-3 text-[10px] font-medium rounded-xl transition-all ${!formData.monto_libre ? "bg-white text-[#0c516e] shadow-md" : "text-slate-400 hover:text-slate-600"}`}
                                    >
                                        MONTO FIJO
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* SEGUNDA FILA: MONTO FIJO Y MENSAJE DE AYUDA */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                            <div className={`flex flex-col gap-3 transition-all duration-500 ${formData.monto_libre ? 'opacity-20 grayscale pointer-events-none' : 'opacity-100'}`}>
                                <label className="text-[11px] font-medium text-slate-600 uppercase tracking-widest ml-1">Monto de Mensualidad Exacta ($)</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-light">$</span>
                                    <input
                                        type="number"
                                        disabled={formData.monto_libre}
                                        value={formData.monto_fijo}
                                        onChange={e => setFormData({ ...formData, monto_fijo: e.target.value })}
                                        className="h-14 pl-10 pr-6 w-full rounded-2xl border-2 border-slate-200 bg-white text-slate-800 text-lg font-normal focus:border-teal-500 outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="bg-teal-50/50 border border-teal-100 p-5 rounded-[1.5rem]">
                                <p className="text-[11px] leading-relaxed text-teal-800 font-normal">
                                    {formData.monto_libre
                                        ? "⚠️ Esta CLABE aceptará transferencias por cualquier monto."
                                        : `✅ Solo permitirá abonos exactos de $${formData.monto_fijo || '0.00'}.`}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-8 items-center pt-6">
                        <button onClick={() => setStep(1)} className="text-slate-400 font-medium uppercase text-[10px] tracking-[0.2em] hover:text-red-500 transition-colors">← Corregir Datos</button>
                        <button onClick={handleConfirmAndCreate} disabled={loading} className="bg-teal-600 text-white px-12 py-4 rounded-2xl font-medium text-sm hover:bg-teal-700 shadow-xl active:scale-95 transition-all flex items-center gap-3">
                            {loading ? <FaSpinner className="animate-spin" /> : <FaUserPlus className="text-teal-200" />}
                            <span className="tracking-widest">CREAR ACCESO Y CLABE STP</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
import React, { useState, useEffect } from "react";
import {
    FaSearch, FaSpinner, FaCalculator, FaCheckCircle, FaUserShield,
    FaIdCard, FaEnvelope, FaHashtag, FaUserPlus, FaCalendarAlt,
    FaPercentage, FaEdit, FaExclamationTriangle
} from "react-icons/fa";
import api, { authApi } from "../../../api/axios";

export default function EndUserForm({ onUserCreated }) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [tempData, setTempData] = useState(null);

    const [formData, setFormData] = useState({
        document_value: "",
        email: "",
        referencia_interna: "",
        valor_factura: "",
        credito: "",
        enganche: 0,
        plazo_credito_meses: 12,
        monto_libre: true,
        tipo_moratoria: "fijo",
        moratoria: 0,
        monto_normal: "",
        monto_normal_final: "",
        fecha_vencimiento: "",
        fecha_limite_habil: ""
    });

    useEffect(() => {
        if (formData.credito && formData.plazo_credito_meses) {
            const cuotaSugerida = (Number(formData.credito) / Number(formData.plazo_credito_meses)).toFixed(2);
            const hoy = new Date();
            const proximoMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 28);
            const fechaVencStr = proximoMes.toISOString().split('T')[0];
            const fechaLimit = new Date(proximoMes);
            fechaLimit.setDate(fechaLimit.getDate() + 5);
            const fechaLimitStr = fechaLimit.toISOString().split('T')[0];

            setFormData(prev => ({
                ...prev,
                monto_normal: prev.monto_normal === "" ? cuotaSugerida : prev.monto_normal,
                monto_normal_final: prev.monto_normal_final === "" ? cuotaSugerida : prev.monto_normal_final,
                fecha_vencimiento: fechaVencStr,
                fecha_limite_habil: fechaLimitStr
            }));
        }
    }, [formData.credito, formData.plazo_credito_meses]);

    const handleValidate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authApi.get('/sanctum/csrf-cookie', { withCredentials: true });
            const res = await api.post("/client/validate-pagador", {
                type: "RFC", value: formData.document_value
            });
            setTempData(res.data.data);
            setStep(2);
        } catch (err) {
            alert("Validación: " + (err.response?.data?.message || "Error al validar RFC"));
        } finally { setLoading(false); }
    };

    const handleConfirmAndCreate = async () => {
        setLoading(true);
        try {
            // Log para que tú veas en consola si los datos están ahí antes de irse
            console.log("Enviando a EndUsers:", {
                name: tempData?.nombre_o_razon_social,
                email: formData.email,
                referencia_interna: formData.referencia_interna,
                document_value: formData.document_value
            });

            const resUser = await api.post("/client/end-users", {
                name: tempData?.nombre_o_razon_social || "Usuario Nuevo",
                email: formData.email,
                referencia_interna: formData.referencia_interna, // <--- Laravel pide este
                document_value: formData.document_value          // <--- Laravel pide este
            });

            const newPagador = resUser.data.data;

            // SEGUNDA PETICIÓN: Ahora sí, el Plan de Pago
            await api.post("/client/plan-pago/generar", {
                user_id: newPagador.user_id,
                cuenta_beneficiario: newPagador.clabe_stp,
                referencia_contrato: newPagador.referencia_interna, // Usamos lo que devolvió el server
                valor_factura: Number(formData.valor_factura) || 0,
                credito: Number(formData.credito) || 0,
                enganche: Number(formData.enganche) || 0,
                plazo_credito_meses: Number(formData.plazo_credito_meses) || 1,
                monto_libre: formData.monto_libre,
                monto_normal: formData.monto_libre ? 0 : Number(formData.monto_normal),
                monto_normal_final: formData.monto_libre ? 0 : Number(formData.monto_normal_final),
                fecha_vencimiento: formData.monto_libre ? null : formData.fecha_vencimiento,
                fecha_limite_habil: formData.monto_libre ? null : formData.fecha_limite_habil,
                moratoria: Number(formData.moratoria) || 0,
                tipo_moratoria: formData.tipo_moratoria,
                estado: 'pendiente'
            });

            alert("✅ Registro y Plan de Pago generados.");
            resetForm();
        } catch (err) {
            // Esto te dirá exactamente qué campo falló si vuelve a pasar
            const errorMsg = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join(", ")
                : (err.response?.data?.error || "Error desconocido");

            alert("❌ Error: " + errorMsg);
            console.error("Error completo:", err.response?.data);
        } finally { setLoading(false); }
    };

    const resetForm = () => {
        setStep(1);
        setFormData({
            document_value: "", email: "", referencia_interna: "",
            valor_factura: "", credito: "", enganche: 0,
            plazo_credito_meses: 12, monto_libre: true,
            tipo_moratoria: "fijo", moratoria: 0,
            monto_normal: "", monto_normal_final: "",
            fecha_vencimiento: "", fecha_limite_habil: ""
        });
        setTempData(null);
    };

    return (
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl mb-10 overflow-hidden relative">
            {step === 1 ? (
                <form onSubmit={handleValidate} className="space-y-10">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-8">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-2xl font-bold text-[#0c516e] flex items-center gap-3 tracking-tight">
                                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                                    <FaUserShield className="text-teal-600" size={20} />
                                </div>
                                Registro de Pagador
                            </h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Denar Network</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col gap-3">
                            <label className="text-[10px] font-black text-[#0c516e] uppercase tracking-widest flex items-center gap-2"><FaIdCard className="text-teal-500" /> RFC Fiscal</label>
                            <input required type="text" maxLength={13} placeholder="ABCD900101XXX" value={formData.document_value} onChange={e => setFormData({ ...formData, document_value: e.target.value.toUpperCase() })} className="h-14 px-6 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-slate-800 font-mono focus:border-teal-500 outline-none transition-all" />
                        </div>
                        <div className="flex flex-col gap-3">
                            <label className="text-[10px] font-black text-[#0c516e] uppercase tracking-widest flex items-center gap-2"><FaEnvelope className="text-teal-500" /> Email</label>
                            <input required type="email" placeholder="notificaciones@cliente.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="h-14 px-6 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-slate-800 focus:border-teal-500 outline-none" />
                        </div>
                        <div className="flex flex-col gap-3">
                            <label className="text-[10px] font-black text-[#0c516e] uppercase tracking-widest flex items-center gap-2"><FaHashtag className="text-teal-500" /> Ref. Contrato</label>
                            <input required type="text" placeholder="CONT-2026" value={formData.referencia_interna} onChange={e => setFormData({ ...formData, referencia_interna: e.target.value })} className="h-14 px-6 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-slate-800 focus:border-teal-500 outline-none" />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button disabled={loading} className="bg-[#0c516e] text-white px-12 py-4 rounded-2xl font-black text-[11px] tracking-[0.2em] flex items-center gap-4 hover:shadow-lg active:scale-95 transition-all">
                            {loading ? <FaSpinner className="animate-spin" /> : <FaSearch className="text-[#60e2ff]" />}
                            VALIDAR Y CONTINUAR
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="bg-gradient-to-r from-[#0c516e] to-[#063143] p-8 rounded-[2rem] text-white shadow-xl flex items-center gap-8 relative overflow-hidden">
                        <div className="w-16 h-16 bg-[#60e2ff] rounded-2xl flex items-center justify-center">
                            <FaCheckCircle className="text-[#0c516e]" size={28} />
                        </div>
                        <div>
                            <span className="text-[#60e2ff] text-[9px] font-black uppercase tracking-[0.4em]">SAT OK</span>
                            <h4 className="text-xl font-bold uppercase mt-1 leading-tight">{tempData?.nombre_o_razon_social}</h4>
                            <p className="text-white/40 font-mono text-[10px] mt-1 tracking-widest">RFC: {tempData?.rfc}</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* 01. ORIGINACIÓN */}
                        <div className="space-y-6">
                            <h4 className="text-[11px] font-black text-[#0c516e] uppercase tracking-[0.3em] flex items-center gap-3 bg-slate-50 p-3 rounded-lg w-fit">
                                <FaCalculator className="text-teal-500" /> 01. Originación
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {/* VALOR FACTURA */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Valor Factura</label>
                                    <input
                                        type="number"
                                        value={formData.valor_factura}
                                        onChange={e => setFormData({ ...formData, valor_factura: e.target.value })}
                                        className="h-12 px-4 rounded-xl border-2 border-slate-100 bg-white font-bold text-[#0c516e] outline-none focus:border-[#0c516e] transition-colors"
                                        placeholder="$0.00"
                                    />
                                </div>

                                {/* ENGANCHE */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Enganche</label>
                                    <input
                                        type="number"
                                        value={formData.enganche}
                                        onChange={e => setFormData({ ...formData, enganche: e.target.value })}
                                        className="h-12 px-4 rounded-xl border-2 border-slate-100 bg-white font-bold text-[#0c516e] outline-none focus:border-[#0c516e] transition-colors"
                                        placeholder="$0.00"
                                    />
                                </div>

                                {/* FINANCIAMIENTO */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter text-teal-600">Monto inicial Crédito</label>
                                    <input
                                        type="number"
                                        value={formData.credito}
                                        onChange={e => setFormData({ ...formData, credito: e.target.value })}
                                        className="h-12 px-4 rounded-xl border-2 border-teal-100 bg-white font-bold text-[#0c516e] outline-none focus:border-teal-500 transition-colors shadow-sm shadow-teal-100/50"
                                    />
                                </div>

                                {/* PLAZO */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Plazo (Meses)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.plazo_credito_meses}
                                        onChange={e => setFormData({ ...formData, plazo_credito_meses: e.target.value })}
                                        className="h-12 px-4 rounded-xl border-2 border-slate-100 bg-white font-bold text-[#0c516e] outline-none focus:border-[#0c516e] transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 02. REGLAS DE COBRO STP */}
                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center block">Reglas de Cobro STP</label>
                            <div className="flex p-1 bg-white rounded-xl border border-slate-200 max-w-md mx-auto">
                                <button onClick={() => setFormData({ ...formData, monto_libre: true })} className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${formData.monto_libre ? "bg-[#0c516e] text-white shadow-md" : "text-slate-400"}`}>LIBRE</button>
                                <button onClick={() => setFormData({ ...formData, monto_libre: false })} className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${!formData.monto_libre ? "bg-[#0c516e] text-white shadow-md" : "text-slate-400"}`}>FIJO / MATCH</button>
                            </div>
                        </div>

                        {/* 03. CONTROL DE MONTOS, VIGENCIA Y MORATORIA */}
                        {!formData.monto_libre && (
                            <div className="space-y-6 pt-6 border-t border-slate-100 animate-in zoom-in-95 duration-500">
                                <h4 className="text-[11px] font-black text-[#0c516e] uppercase tracking-[0.3em] flex items-center gap-3 bg-slate-50 p-3 rounded-lg w-fit">
                                    <FaEdit className="text-blue-500" /> 03. Control de Montos y Vigencia
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Cuota Ordinaria</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.monto_normal}
                                            onChange={e => setFormData({ ...formData, monto_normal: e.target.value })}
                                            className="h-12 px-4 rounded-xl border-2 border-teal-500/30 bg-white font-bold text-[#0c516e] focus:border-teal-500 outline-none"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Cuota Final / Ajuste</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.monto_normal_final}
                                            onChange={e => setFormData({ ...formData, monto_normal_final: e.target.value })}
                                            className="h-12 px-4 rounded-xl border-2 border-orange-500/30 bg-white font-bold text-[#0c516e] focus:border-orange-500 outline-none"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">1er Vencimiento</label>
                                        <input
                                            type="date"
                                            value={formData.fecha_vencimiento}
                                            onChange={e => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                                            className="h-12 px-4 rounded-xl border-2 border-blue-50 bg-blue-50/20 font-bold text-[#0c516e] focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Límite de Pago</label>
                                        <input
                                            type="date"
                                            value={formData.fecha_limite_habil}
                                            onChange={e => setFormData({ ...formData, fecha_limite_habil: e.target.value })}
                                            className="h-12 px-4 rounded-xl border-2 border-red-50 bg-red-50/20 font-bold text-[#0c516e] focus:border-red-500 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* MORATORIA INTEGRADA: Solo visible tras definir la vigencia */}
                                <div className="bg-red-50/30 p-6 rounded-3xl border border-red-100 flex flex-col md:flex-row items-center gap-6">
                                    <div className="flex items-center gap-4 min-w-[200px]">
                                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                                            <FaExclamationTriangle size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Penalización</p>
                                            <p className="text-[8px] text-red-400 font-bold uppercase italic leading-tight">Post-Fecha Límite</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-1 gap-3 w-full">
                                        <select value={formData.tipo_moratoria} onChange={e => setFormData({ ...formData, tipo_moratoria: e.target.value })} className="h-12 px-3 rounded-xl border-2 border-white bg-white shadow-sm font-black text-[10px] text-[#0c516e] outline-none w-32">
                                            <option value="fijo">$ CARGO FIJO</option>
                                            <option value="porcentaje">% SOBRE CUOTA</option>
                                        </select>
                                        <div className="relative flex-1">
                                            <input type="number" value={formData.moratoria} onChange={e => setFormData({ ...formData, moratoria: e.target.value })} className="h-12 px-4 w-full rounded-xl border-2 border-white bg-white shadow-sm font-bold text-red-600 outline-none" placeholder="0.00" />
                                            {formData.tipo_moratoria === 'porcentaje' && <FaPercentage className="absolute right-4 top-1/2 -translate-y-1/2 text-red-300" size={12} />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center pt-8 border-t border-slate-100">
                        <button onClick={() => setStep(1)} className="text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-red-500 underline underline-offset-8 transition-all">← Regresar</button>
                        <button onClick={handleConfirmAndCreate} disabled={loading} className="bg-[#0c516e] text-white px-10 py-5 rounded-[1.5rem] font-black text-[11px] tracking-[0.2em] shadow-2xl hover:bg-[#063143] active:scale-95 transition-all flex items-center gap-4">
                            {loading ? <FaSpinner className="animate-spin" /> : <FaUserPlus className="text-[#60e2ff]" />}
                            GENERAR ACCESO Y CLABE STP
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
import React, { useState } from "react";
import { FaSearch, FaSpinner, FaCalculator, FaCheckCircle, FaUserShield, FaIdCard, FaEnvelope, FaHashtag, FaBirthdayCake, FaMapMarkerAlt, FaVenusMars } from "react-icons/fa";
import api from "../../../api/axios";

function InputField({ label, value, onChange }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">{label}</label>
            <input
                type="number"
                value={value}
                onChange={e => onChange(e.target.value)}
                className="p-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-[#0c516e] focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition"
            />
        </div>
    );
}

export default function EndUserForm({ onUserCreated }) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [tempData, setTempData] = useState(null);
    const [docType, setDocType] = useState("CURP");

    const [formData, setFormData] = useState({
        document_value: "",
        email: "",
        referencia_interna: "",
        valor_vehiculo: 250000,
        enganche: 50000,
        dia_pago: 5,
        meses_enganche: 1,
        comision_apertura: 2500,
        cargo_gps: 0,
        cargo_seguro: 0,
        plazo_meses: 12,
        descuento_pronto_pago: 500
    });

    const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;

    const montoFinanciadoCalculado = Number(formData.valor_vehiculo) - Number(formData.enganche);
    const capitalMensual = montoFinanciadoCalculado / Number(formData.plazo_meses);
    const pagoMensualNormal = capitalMensual + Number(formData.cargo_gps) + Number(formData.cargo_seguro);
    const primerPagoTotal = pagoMensualNormal + Number(formData.comision_apertura);

    const handleValidate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post("/client/validate-pagador", {
                type: "CURP",
                value: formData.document_value
            });
            console.log("RESPUESTA COMPLETA:", res.data);
            setTempData(res.data.data);
            setStep(2);
        } catch (err) {
            const msg = err.response?.data?.error || err.message || "Error desconocido";
            alert("Error: " + msg + "\nDatos crudos: " + JSON.stringify(err.response?.data));
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmAndCreate = async () => {
        setLoading(true);
        try {
            const userRes = await api.post("/client/end-users", {
                name: `${tempData?.nombre} ${tempData?.apellidoPaterno} ${tempData?.apellidoMaterno}`,
                email: formData.email,
                referencia_interna: formData.referencia_interna,
                document_value: formData.document_value
            });

            await api.post("/client/plan-pago/generar", {
                user_id: userRes.data.user_id,
                cuenta_beneficiario: userRes.data.pagador.clabe_stp,
                referencia_contrato: formData.referencia_interna,
                clabe: userRes.data.pagador.clabe_stp,
                monto_total: Number(formData.valor_vehiculo),
                plazo_meses: parseInt(formData.plazo_meses),
                dia_pago: parseInt(formData.dia_pago) || 5,
                descuento_pronto_pago: Number(formData.descuento_pronto_pago),
                valor_total_vehiculo: Number(formData.valor_vehiculo),
                enganche_pagado: Number(formData.enganche),
                meses_enganche: parseInt(formData.meses_enganche),
                comision_apertura: Number(formData.comision_apertura),
                cargo_gps: Number(formData.cargo_gps),
                cargo_seguro: Number(formData.cargo_seguro),
                monto_final_financiado: Number(montoFinanciadoCalculado),
                plazo_credito_meses: parseInt(formData.plazo_meses),
                monto_normal: pagoMensualNormal,
                primer_pago: primerPagoTotal,
                estado: 'pendiente'
            });

            alert("✅ ¡Éxito! Usuario y Plan de Pagos creados.");
            resetForm();
            if (onUserCreated) onUserCreated();
        } catch (err) {
            alert("Error al generar el plan: " + (err.response?.data?.message || "Revisa la consola"));
        } finally { setLoading(false); }
    };

    const resetForm = () => {
        setStep(1);
        setFormData({ document_value: "", email: "", referencia_interna: "", valor_vehiculo: 250000, enganche: 50000, meses_enganche: 1, comision_apertura: 2500, cargo_gps: 0, cargo_seguro: 0, plazo_meses: 12, descuento_pronto_pago: 500 });
        setTempData(null);
    };

    return (
        <div className="bg-white p-8 rounded-[2rem] border-2 border-teal-500/10 shadow-2xl mb-10 overflow-hidden">
            {step === 1 ? (
                <form onSubmit={handleValidate} className="space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                        <h3 className="text-md font-medium text-[#0c516e] flex items-center gap-2 uppercase tracking-tighter">
                            <FaUserShield className="text-teal-500" /> Nuevo Usuario
                        </h3>
                        <span className="text-[10px] font-bold bg-teal-50 text-teal-600 px-3 py-1 rounded-full uppercase tracking-widest">Paso 1: Validación</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-medium text-slate-400 uppercase flex items-center gap-2">
                                <FaIdCard /> CURP
                            </label>
                            <input
                                required
                                type="text"
                                maxLength={18} // 1. Restricción estricta de longitud
                                placeholder="XXXX000000XXXXXX00"
                                value={formData.document_value}
                                // 2. Limpieza con Regex: Solo permite letras y números, convierte a mayúsculas
                                onChange={e => {
                                    const val = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
                                    setFormData({ ...formData, document_value: val });
                                }}
                                // 3. Estilo visual de validación (el borde cambia si el formato parece incorrecto)
                                className={`p-4 rounded-2xl border-2 transition-all uppercase font-normal text-sm 
            ${!formData.document_value || curpRegex.test(formData.document_value)
                                        ? "border-slate-100 focus:border-teal-500 text-[#0c516e]"
                                        : "border-red-300 focus:border-red-500 text-red-600"}`}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-medium text-slate-400 uppercase flex items-center gap-2"><FaEnvelope /> Email</label>
                            <input
                                required
                                type="email"
                                placeholder="correo@ejemplo.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="p-4 rounded-2xl border-2 border-slate-100 text-sm font-normal text-[#0c516e] focus:border-teal-500 outline-none transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-medium text-slate-400 uppercase flex items-center gap-2"><FaHashtag /> Referencia</label>
                            <input
                                type="text"
                                placeholder="Ref-001"
                                value={formData.referencia_interna}
                                onChange={e => setFormData({ ...formData, referencia_interna: e.target.value })}
                                className="p-4 rounded-2xl border-2 border-slate-100 text-sm font-normal text-[#0c516e] focus:border-teal-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <button disabled={loading} className="w-full md:w-auto float-right bg-[#0c516e] text-white px-12 py-4 rounded-2xl font-normal text-sm flex items-center justify-center gap-3 hover:bg-[#0a435c] transition-all shadow-lg shadow-blue-900/10">
                        {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />} VALIDAR IDENTIDAD
                    </button>
                </form>
            ) : (
                <div className="animate-in slide-in-from-right-4 duration-300">
                    <div className="bg-gradient-to-r from-[#0c516e] to-[#146c91] p-6 rounded-[1.5rem] mb-8 text-white shadow-xl relative overflow-hidden">
                        <div className="flex items-center gap-5 relative z-10 mb-6">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                                <FaCheckCircle className="text-teal-300" size={30} />
                            </div>
                            <div>
                                <p className="text-teal-300 text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1">Usuario Validado</p>
                                <h4 className="text-xl font-black">{tempData?.nombre} {tempData?.apellidoPaterno} {tempData?.apellidoMaterno}</h4>
                            </div>
                        </div>

                        {/* NUEVO BLOQUE DE DETALLES INTEGRADO */}
                        {/* NUEVO BLOQUE DE DETALLES INTEGRADO - ANCHO */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/10 pt-4 relative z-10">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-teal-200 uppercase whitespace-nowrap">
                                <FaBirthdayCake className="shrink-0" /> {tempData?.fechaNacimiento}
                            </div>

                            {/* AQUÍ ESTÁ EL CAMBIO: Quitamos el substring y ajustamos el ancho */}
                            <div className="flex items-center gap-2 text-[10px] font-bold text-teal-200 uppercase md:col-span-1">
                                <FaMapMarkerAlt className="shrink-0" />
                                <span className="truncate">{tempData?.estadoNacimiento}</span>
                            </div>

                            <div className="flex items-center gap-2 text-[10px] font-bold text-teal-200 uppercase justify-start md:justify-end">
                                <FaVenusMars className="shrink-0" /> {tempData?.sexo}
                            </div>
                        </div>
                        <FaUserShield className="absolute -right-4 -bottom-4 text-white/5" size={120} />
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mb-8 text-left">
                        <h5 className="text-[#0c516e] font-black text-sm mb-8 uppercase flex items-center gap-2 tracking-widest">
                            <FaCalculator className="text-teal-500" /> Configuración Financiera
                        </h5>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InputField label="Valor Vehículo" value={formData.valor_vehiculo} onChange={v => setFormData({ ...formData, valor_vehiculo: v })} />
                                <InputField label="Enganche" value={formData.enganche} onChange={v => setFormData({ ...formData, enganche: v })} />
                                <InputField label="Meses Enganche" value={formData.meses_enganche} onChange={v => setFormData({ ...formData, meses_enganche: v })} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InputField label="Comisión Apertura" value={formData.comision_apertura} onChange={v => setFormData({ ...formData, comision_apertura: v })} />
                                <InputField label="Plazo (Meses)" value={formData.plazo_meses} onChange={v => setFormData({ ...formData, plazo_meses: v })} />
                                <InputField label="Día de Pago" value={formData.dia_pago} onChange={v => setFormData({ ...formData, dia_pago: v })} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField label="Cargo GPS" value={formData.cargo_gps} onChange={v => setFormData({ ...formData, cargo_gps: v })} />
                                <InputField label="Cargo Seguro" value={formData.cargo_seguro} onChange={v => setFormData({ ...formData, cargo_seguro: v })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-8 mt-8">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monto a Financiar</p>
                                <p className="text-2xl font-black text-[#0c516e]">
                                    ${new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2 }).format(montoFinanciadoCalculado)}
                                </p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Pago Mensual (Mes 2+)</p>
                                <p className="text-2xl font-black text-slate-700">
                                    ${new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2 }).format(pagoMensualNormal)}
                                </p>
                            </div>
                            <div className="bg-[#0c516e] p-6 rounded-2xl shadow-xl shadow-[#0c516e]/20 group">
                                <p className="text-[10px] font-bold text-teal-300 uppercase tracking-widest mb-1">Primer Pago (Con Comisión)</p>
                                <p className="text-2xl font-black text-white group-hover:scale-105 transition-transform">
                                    ${new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2 }).format(primerPagoTotal)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-6 items-center">
                        <button onClick={() => setStep(1)} className="text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-red-500 transition-colors">← Corregir Datos</button>
                        <button onClick={handleConfirmAndCreate} disabled={loading} className="bg-teal-600 text-white px-12 py-4 rounded-2xl font-black text-sm hover:bg-teal-700 shadow-lg shadow-teal-900/20 active:scale-95 transition-all">
                            {loading ? <FaSpinner className="animate-spin" /> : "ACTIVAR CRÉDITO"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
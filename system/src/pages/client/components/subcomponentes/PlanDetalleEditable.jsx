import React, { useState } from "react";
import {
    FaWallet, FaChartLine, FaCalendarAlt, FaEdit, FaSave,
    FaTimes, FaSpinner, FaInfoCircle, FaLock, FaExclamationCircle
} from "react-icons/fa";
import api from "../../../../api/axios";

export default function PlanDetalleEditable({ user, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // 1. Cargamos TODOS los campos necesarios asegurando que monto_normal_final se capture
    const [editData, setEditData] = useState({
        monto_normal: user.montoNormal || user.paymentPlan?.monto_normal || 0,
        monto_normal_final: user.paymentPlan?.monto_normal_final || 0, // Sincronización directa
        moratoria: user.moratoria || user.paymentPlan?.moratoria || 0,
        fecha_vencimiento: user.fechaVencimiento ? user.fechaVencimiento.split('T')[0] : (user.paymentPlan?.fecha_vencimiento || ""),
        fecha_limite_habil: user.paymentPlan?.fecha_limite_habil ? user.paymentPlan.fecha_limite_habil.split('T')[0] : ""
    });

    const handleSave = async () => {
        setLoading(true);

        const mNormalFinal = parseFloat(editData.monto_normal_final) || 0;
        // 2. Sanitización completa para el API
        const sanitizedData = {
            monto_normal: editData.monto_normal === "" ? 0 : editData.monto_normal,
            monto_normal_final: mNormalFinal,
            moratoria: editData.moratoria === "" ? 0 : editData.moratoria,
            fecha_vencimiento: editData.fecha_vencimiento,
            fecha_limite_habil: editData.fecha_limite_habil,
            monto_libre: mNormalFinal > 0 ? 0 : 1
        };

        try {
            const response = await api.put(`/client/plan-pago/actualizar/${user.paymentPlan.id}`, sanitizedData);

            if (response.data.success) {
                setIsEditing(false);
                if (typeof onUpdate === 'function') {
                    onUpdate(); // Esto refresca la tabla principal
                }
            } else {
                throw new Error(response.data.message || "Error en la validación");
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || "Error al actualizar";
            alert("❌ No se pudo actualizar: " + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

    return (
        <div className="bg-slate-50/80 rounded-[2rem] border border-slate-200 p-6 animate-in fade-in duration-500 shadow-inner">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#0c516e] rounded-xl flex items-center justify-center">
                        <FaInfoCircle className="text-[#60e2ff]" size={14} />
                    </div>
                    <h3 className="text-[10px] font-black text-[#0c516e] uppercase tracking-[0.2em]">Gestión y Ajustes del Plan</h3>
                </div>

                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:shadow-md transition-all active:scale-95">
                        <FaEdit className="text-[#0c516e]" size={12} />
                        <span className="text-[9px] font-black text-[#0c516e] tracking-wider uppercase">Modificar Valores</span>
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={() => setIsEditing(false)} className="px-3 py-2 text-[9px] font-black text-slate-400 hover:text-red-500 uppercase">Cancelar</button>
                        <button onClick={handleSave} disabled={loading} className="bg-[#0c516e] text-white px-5 py-2 rounded-xl text-[9px] font-black tracking-widest flex items-center gap-2 shadow-lg">
                            {loading ? <FaSpinner className="animate-spin" /> : <FaSave className="text-[#60e2ff]" />}
                            GUARDAR CAMBIOS
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* 1. Crédito Base (Lectura) */}
                <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">Monto Inicial Crédito</span>
                    <p className="text-lg font-black text-[#0c516e]">{formatCurrency(user.paymentPlan.credito)}</p>
                    <div className="mt-2 pt-2 border-t border-slate-50 flex justify-between">
                        <span className="text-[8px] font-bold text-slate-300 uppercase">Ref: {user.referencia_interna}</span>
                        <FaLock className="text-slate-200" size={10} />
                    </div>
                </div>

                {/* 2. Cuotas Ordinaria y Final (Editable) */}
                <div className={`bg-white border p-4 rounded-2xl shadow-sm transition-all ${isEditing ? 'border-teal-500 ring-4 ring-teal-500/5' : 'border-slate-100'}`}>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">Mensualidad</span>
                    {isEditing ? (
                        <div className="space-y-2">
                            <div>
                                <label className="text-[7px] font-black text-teal-600 uppercase">Ordinaria</label>
                                <input type="number" step="0.01" className="w-full h-9 px-2 rounded-lg font-bold text-slate-900 border border-slate-200 focus:border-teal-500 outline-none text-sm bg-white" value={editData.monto_normal} onChange={(e) => setEditData({ ...editData, monto_normal: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[7px] font-black text-orange-600 uppercase">Redondeo / Ajuste</label>
                                <input type="number" step="0.01" className="w-full h-9 px-2 rounded-lg font-bold text-slate-900 border border-slate-200 focus:border-orange-500 outline-none text-sm bg-white" value={editData.monto_normal_final} onChange={(e) => setEditData({ ...editData, monto_normal_final: e.target.value })} />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-lg font-black text-teal-700">{formatCurrency(editData.monto_normal)}</p>
                            <p className="text-[10px] font-bold text-orange-600">Final redondeado: {formatCurrency(editData.monto_normal_final)}</p>
                        </div>
                    )}
                </div>

                {/* 3. Fechas (Editable) */}
                <div className={`bg-white border p-4 rounded-2xl shadow-sm transition-all ${isEditing ? 'border-blue-500 ring-4 ring-blue-500/5' : 'border-slate-100'}`}>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">Vigencia</span>
                    {isEditing ? (
                        <div className="space-y-2">
                            <div>
                                <label className="text-[7px] font-black text-blue-600 uppercase">Vencimiento</label>
                                <input type="date" className="w-full h-9 px-2 rounded-lg font-bold text-slate-900 border border-slate-200 outline-none text-xs bg-white" value={editData.fecha_vencimiento} onChange={(e) => setEditData({ ...editData, fecha_vencimiento: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[7px] font-black text-red-600 uppercase">Límite Hábil</label>
                                <input type="date" className="w-full h-9 px-2 rounded-lg font-bold text-slate-900 border border-slate-200 outline-none text-xs bg-white" value={editData.fecha_limite_habil} onChange={(e) => setEditData({ ...editData, fecha_limite_habil: e.target.value })} />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <p className="text-[11px] font-black text-slate-700 uppercase leading-none">Vence: {editData.fecha_vencimiento}</p>
                            <p className="text-[11px] font-black text-red-600 uppercase mt-2">Límite: {editData.fecha_limite_habil}</p>
                        </div>
                    )}
                </div>

                {/* 4. Moratoria (Editable) */}
                <div className={`bg-white border p-4 rounded-2xl shadow-sm transition-all ${isEditing ? 'border-red-500 ring-4 ring-red-500/5' : 'border-slate-100'}`}>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">Penalización</span>
                    {isEditing ? (
                        <div className="flex flex-col h-full justify-center">
                            <label className="text-[7px] font-black text-red-600 uppercase mb-1">Monto de Mora</label>
                            <input type="number" step="0.01" className="w-full h-10 px-3 rounded-lg font-black text-red-600 border border-red-100 focus:border-red-500 outline-none text-base bg-white" value={editData.moratoria} onChange={(e) => setEditData({ ...editData, moratoria: e.target.value })} />
                        </div>
                    ) : (
                        <div className="flex flex-col h-full justify-center">
                            <p className="text-xl font-black text-red-500">{formatCurrency(editData.moratoria)}</p>
                            <p className="text-[7px] font-bold text-red-300 uppercase mt-1">Cargo post-vencimiento</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
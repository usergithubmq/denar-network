import React, { useState, useRef } from 'react';
import api from "../../api/axios";
import { FaCamera, FaSave, FaBuilding } from "react-icons/fa";

export default function ProfileView({ clienteInfo, onUpdate }) {
    const [formData, setFormData] = useState({
        nombre_comercial: clienteInfo?.nombre_comercial || '',
        nombre_legal: clienteInfo?.nombre_legal || '',
        rfc: clienteInfo?.rfc || '',
        logo: null
    });

    const [preview, setPreview] = useState(
        clienteInfo?.logo_url ? `http://localhost:8000/storage/${clienteInfo.logo_url}` : null
    );

    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, logo: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('nombre_comercial', formData.nombre_comercial);
        data.append('nombre_legal', formData.nombre_legal);
        data.append('rfc', formData.rfc);

        // Solo enviamos el archivo si el usuario seleccionó uno nuevo
        if (formData.logo instanceof File) {
            data.append('logo', formData.logo);
        }

        try {
            await api.post("/client/profile-update", data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            alert("¡Perfil actualizado con éxito!");
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error(err.response?.data);
            const errorMsg = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join('\n')
                : err.response?.data?.message || "Error al actualizar";
            alert("Error:\n" + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <FaBuilding className="text-teal-600" /> Editar Perfil
            </h2>

            <div className="flex flex-col items-center mb-6">
                <div onClick={() => fileInputRef.current.click()} className="relative cursor-pointer group">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-md flex items-center justify-center">
                        {preview ? (
                            <img src={preview} className="w-full h-full object-cover" alt="Logo" />
                        ) : (
                            <FaCamera className="text-gray-400" size={30} />
                        )}
                    </div>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-full transition-opacity text-white text-sm">
                        Cambiar
                    </div>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />
            </div>

            <div className="space-y-4">
                <input
                    className="w-full p-3 rounded-xl border border-gray-200"
                    placeholder="Nombre Comercial"
                    value={formData.nombre_comercial}
                    onChange={e => setFormData({ ...formData, nombre_comercial: e.target.value })}
                />
                <input
                    className="w-full p-3 rounded-xl border border-gray-200"
                    placeholder="RFC"
                    value={formData.rfc}
                    onChange={e => setFormData({ ...formData, rfc: e.target.value })}
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {loading ? "Guardando..." : <><FaSave /> Guardar Cambios</>}
            </button>
        </form>
    );
}
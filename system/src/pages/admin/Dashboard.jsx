import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api, { authApi } from "../../api/axios";

// Componentes Core Fraccionados
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import ClientList from "./components/ClientList";
import Estadisticas from "./components/Estadisticas";
import LogsSistema from "./components/LogsSistema";
import FormClienteModal from "./components/modal/FormClienteModal";

export default function Dashboard() {
    const navigate = useNavigate();
    const [view, setView] = useState("dashboard");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Este estado servirá para forzar el re-renderizado de las listas en tiempo real
    const [refreshKey, setRefreshKey] = useState(0);

    // Estado inicial del formulario
    const initialFormState = {
        nombre_comercial: "",
        email: "",
        rfc: "",
        clabe_stp_intermedia: "",
        tipo_cliente: 'empresa',
        first_last: "",
        second_last: "",
        password: "password123"
    };

    const [formData, setFormData] = useState(initialFormState);

    // 1. FUNCIÓN DE REFRESCO (Visible para todo el componente)
    const refreshData = useCallback(() => {
        console.log("Refrescando datos del sistema...");
        setRefreshKey(prev => prev + 1); // Incrementamos la clave para forzar actualización
    }, []);

    // 2. EFECTO INICIAL
    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!formData.clabe_stp_intermedia) {
            alert("Error: No has seleccionado un nodo (Tronco STP)");
            return;
        }

        setLoading(true);
        try {
            await authApi.get("/sanctum/csrf-cookie");

            const generatedSlug = formData.nombre_comercial
                .toLowerCase()
                .trim()
                .replace(/ /g, '-')
                .replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(2, 7);

            const dataToSync = { ...formData, slug: generatedSlug };

            await api.post("/admin/clients", dataToSync);

            // Si llegamos aquí, fue exitoso. Retornamos true para que el modal sepa qué hacer.
            return true;
        } catch (err) {
            console.error("Error Detallado:", err.response?.data);
            const msg = err.response?.data?.message || "Error de conexión";
            alert(`Error: ${msg}`);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const pageTransition = {
        initial: { opacity: 0, y: 10, scale: 0.99 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -10, scale: 1.01 },
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
    };

    return (
        <div className="h-screen w-screen bg-[#051d26] flex font-sans overflow-hidden text-[#051d26]">

            <AdminSidebar view={view} setView={setView} handleLogout={handleLogout} />

            <main className="flex-1 ml-64 flex flex-col h-screen bg-[#f8fafc] relative overflow-hidden">
                <AdminHeader view={view} openModal={() => setIsModalOpen(true)} />

                <div className="flex-1 overflow-y-auto p-5 relative custom-scrollbar">
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(#051d26 1.5px, transparent 0)', backgroundSize: '40px 40px' }} />

                    <AnimatePresence mode="wait">
                        {view === "dashboard" && (
                            <motion.div key={`dash-${refreshKey}`} {...pageTransition} className="flex flex-col gap-10 pb-20">
                                <Estadisticas key={`stats-${refreshKey}`} />
                                <LogsSistema key={`logs-${refreshKey}`} />
                            </motion.div>
                        )}

                        {view === "list" && (
                            <motion.div key={`list-${refreshKey}`} {...pageTransition} className="w-full pb-20">
                                <ClientList key={`clist-${refreshKey}`} />
                            </motion.div>
                        )}

                        {view === "logs" && (
                            <motion.div key={`logs-full-${refreshKey}`} {...pageTransition} className="w-full pb-20">
                                <LogsSistema />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* MODAL CONECTADO CORRECTAMENTE */}
            <FormClienteModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setFormData(initialFormState); // Reseteamos al cerrar
                }}
                formData={formData}
                setFormData={setFormData}
                handleSubmit={handleSubmit}
                loading={loading}
                onClientCreated={refreshData} // Pasamos nuestra función de refresco
            />
        </div>
    );
}
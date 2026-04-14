import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
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

    // Estado inicial del formulario
    const initialFormState = {
        nombre_comercial: "",
        email: "",
        rfc: "",
        clabe_stp_intermedia: "", // CAMPO CRÍTICO
        tipo_cliente: 'empresa', // <--- CAMBIO AQUÍ
        first_last: "",
        second_last: "",
        password: "password123"
    };

    const [formData, setFormData] = useState(initialFormState);

    const handleLogout = () => { navigate("/login"); };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        // Validación manual antes de disparar
        if (!formData.clabe_stp_intermedia) {
            alert("Error: No has seleccionado un nodo (Tronco STP)");
            return;
        }

        setLoading(true);
        try {
            await authApi.get("/sanctum/csrf-cookie");

            // Generar slug basado en el nuevo nombre de campo
            const generatedSlug = formData.nombre_comercial
                .toLowerCase()
                .trim()
                .replace(/ /g, '-')
                .replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(2, 7);

            const dataToSync = { ...formData, slug: generatedSlug };

            // Enviar a la ruta que definimos en el Controller
            await api.post("/admin/clients", dataToSync);

            alert("¡Nodo Aprovisionado con Éxito!");
            setIsModalOpen(false);
            setFormData(initialFormState);
            setView("list");
        } catch (err) {
            console.error("Error Detallado:", err.response?.data);
            const msg = err.response?.data?.message || "Error de conexión";
            const errors = err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join('\n') : "";
            alert(`Error: ${msg}\n${errors}`);
        } finally {
            setLoading(false);
        }
    };

    // Configuración de animación para cambios de vista
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
                    {/* Grid tecnológico de fondo sutil */}
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(#051d26 1.5px, transparent 0)', backgroundSize: '40px 40px' }} />

                    <AnimatePresence mode="wait">
                        {/* VISTA 1: DASHBOARD UNIFICADO (Stats + Logs debajo) */}
                        {view === "dashboard" && (
                            <motion.div
                                key="dash"
                                {...pageTransition}
                                className="flex flex-col gap-10 pb-20" // Flex col para apilar verticalmente
                            >
                                {/* PARTE SUPERIOR: Telemetría comprimida */}
                                <Estadisticas />
                                <LogsSistema />

                            </motion.div>
                        )}

                        {/* VISTA 2: DIRECTORIO DE CLIENTES (Sigue siendo independiente si quieres) */}
                        {view === "list" && (
                            <motion.div key="list" {...pageTransition} className="w-full pb-20">
                                <ClientList />
                            </motion.div>
                        )}

                        {/* VISTA 3: Si quisieras ver los Logs solos en pantalla completa */}
                        {view === "logs" && (
                            <motion.div key="logs" {...pageTransition} className="w-full pb-20">
                                <LogsSistema />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <FormClienteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                formData={formData}
                setFormData={setFormData}
                handleSubmit={handleSubmit}
                loading={loading}
            />
        </div>
    );
}
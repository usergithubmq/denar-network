import React from 'react';
import { motion } from 'framer-motion';
import { FaWallet, FaHistory, FaHeadset, FaSignOutAlt, FaUserCog } from 'react-icons/fa';

// Recibimos clienteInfo como prop desde el Dashboard o Layout
const KoonSidebar = ({ vistaActual, setVistaActual, handleLogout, clienteInfo }) => {

    /**
     * Construye la URL correcta de la imagen.
     * Limpia el path por si Laravel lo guarda como 'public/logos/...' 
     * y añade un timestamp para evitar cache si se cambia el logo.
     */
    const getLogoUrl = (path) => {
        if (!path) return null;

        // Si ya es una URL completa (http...), la respetamos
        if (path.startsWith('http')) return `${path}?t=${Date.now()}`;

        // Limpiamos el prefijo 'public/' que a veces devuelve la BD
        const cleanPath = path.replace('public/', '');

        // Construimos la ruta al storage de Laravel
        return `http://localhost:8000/storage/${cleanPath}?t=${Date.now()}`;
    };

    const itemVariants = {
        hidden: { x: -20, opacity: 0 },
        visible: { x: 0, opacity: 1 }
    };

    const NavButton = ({ id, icon: Icon, label }) => {
        const isActive = vistaActual === id;
        return (
            <motion.button
                variants={itemVariants}
                whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.08)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setVistaActual(id)}
                className={`relative w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${isActive
                    ? 'bg-gradient-to-r from-white/15 to-transparent border-l-4 border-teal-400'
                    : 'text-slate-400 hover:text-white'
                    }`}
            >
                <Icon className={`text-lg ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
                <span className={`text-sm tracking-tight ${isActive ? 'font-bold text-white' : 'font-medium'}`}>
                    {label}
                </span>
            </motion.button>
        );
    };

    return (
        <aside className="w-64 bg-[#051d26] hidden md:flex flex-col text-white fixed h-full z-50 border-r border-white/5 shadow-2xl">

            {/* SECCIÓN DE BRANDING: Logo del Cliente o KOONPAY */}
            <div className="p-8 mb-4 relative overflow-hidden">
                <div className="relative z-10 min-h-[60px] flex flex-col justify-center">
                    {clienteInfo?.logo_url ? (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col"
                        >
                            <img
                                src={getLogoUrl(clienteInfo.logo_url)}
                                alt="Logo Empresa"
                                className="h-50 w-auto mb-2 object-contain filter drop-shadow-2xl"
                                onError={(e) => {
                                    // Fallback si la imagen no carga
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }}
                            />
                            {/* Fallback visual interno si falla el src */}
                            <h1 className="hidden text-xl font-black text-white/50">{clienteInfo.nombre}</h1>

                            <p className="text-[7px] font-black text-teal-500/50 uppercase tracking-[0.4em] ml-1">
                                Terminal de Usuario
                            </p>
                        </motion.div>
                    ) : (
                        // Marca por defecto si no hay información de empresa
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-black tracking-tighter text-teal-400">
                                KOON<span className="text-white">PAY</span>
                            </h1>
                            <p className="text-[8px] font-black text-teal-500/50 uppercase tracking-[0.4em]">
                                User Terminal
                            </p>
                        </div>
                    )}
                </div>

                {/* Efecto decorativo de luz */}
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-teal-500/5 blur-[50px] rounded-full pointer-events-none" />
            </div>

            {/* NAVEGACIÓN */}
            <motion.nav initial="hidden" animate="visible" className="flex-1 px-4 space-y-2">
                <div className="px-4 mb-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Finanzas</div>
                <NavButton id="dashboard" icon={FaWallet} label="Mi Billetera" />
                <NavButton id="history" icon={FaHistory} label="Movimientos" />

                <div className="pt-8 px-4 mb-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Cuenta</div>
                <NavButton id="profile" icon={FaUserCog} label="Ajustes" />
                <NavButton id="support" icon={FaHeadset} label="Soporte" />
            </motion.nav>

            {/* BOTÓN DE LOGOUT */}
            <div className="p-6 border-t border-white/5">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-4 rounded-xl text-white hover:bg-red-500/10 transition-all group"
                >
                    <FaSignOutAlt className="text-red-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
};

export default KoonSidebar;
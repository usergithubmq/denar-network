import React from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaUsers, FaFileInvoiceDollar, FaSignOutAlt, FaShieldAlt } from 'react-icons/fa';

const KoonSidebar = ({ vistaActual, setVistaActual, clienteInfo, handleLogout, getLogoUrl }) => {

    // Animaciones para los botones
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
                    ? 'bg-gradient-to-r from-white/15 to-transparent shadow-[10px_0_30px_rgba(0,0,0,0.1)] border-l-4 border-teal-400'
                    : 'text-slate-400 hover:text-white'
                    }`}
            >
                <Icon className={`text-lg transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
                <span className={`text-sm tracking-tight ${isActive ? 'font-normal text-white' : 'font-medium'}`}>
                    {label}
                </span>
                {isActive && (
                    <motion.div
                        layoutId="activeGlow"
                        className="absolute right-4 w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_10px_#2dd4bf]"
                    />
                )}
            </motion.button>
        );
    };

    return (
        <aside className="w-64 bg-[#051d26] hidden md:flex flex-col text-white shadow-[10px_0_50px_rgba(0,0,0,0.2)] fixed h-full z-50 border-r border-white/5">
            {/* --- LOGO AREA CON REFLEJO --- */}
            <div className="p-8 mb-4 relative overflow-hidden">
                <div className="relative z-10">
                    {clienteInfo?.logo_url ? (
                        <motion.img
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            src={`${getLogoUrl(clienteInfo.logo_url)}?${Date.now()}`}
                            alt="Logo Empresa"
                            className="h-26 w-auto mb-2 object-contain filter drop-shadow-2xl"
                        />
                    ) : (
                        <h1 className="text-3xl font-black tracking-tighter text-teal-400 uppercase">
                            KOON<span className="text-white"> SYSTEM</span>
                        </h1>
                    )}
                    <p className="text-[9px] font-black text-teal-500/50 uppercase tracking-[0.4em] ml-1">
                        Terminal de Control
                    </p>
                </div>
                {/* Efecto de luz de fondo */}
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-teal-500/10 blur-[50px] rounded-full" />
            </div>

            {/* --- NAVEGACIÓN --- */}
            <motion.nav
                initial="hidden"
                animate="visible"
                variants={{
                    visible: { transition: { staggerChildren: 0.1 } }
                }}
                className="flex-1 px-4 space-y-2"
            >
                <div className="px-4 mb-4 text-[10px] font-black text-white uppercase tracking-[0.2em]">
                    Menú Principal
                </div>

                <NavButton id="profile" icon={FaUser} label="Mi Perfil" />
                <NavButton id="pagadores" icon={FaUsers} label="Mis Clientes" />
                <NavButton id="reporte" icon={FaFileInvoiceDollar} label="Reporte de Pagos" />

                {/* Sección Extra: Seguridad */}
                <div className="pt-8 px-4 mb-4 text-[10px] font-black text-white uppercase tracking-[0.2em]">
                    Soporte & Seguridad
                </div>
                <div className="px-4 py-3 bg-white/5 rounded-2xl border border-white/5 mx-2">
                    <div className="flex items-center gap-2 text-teal-400 mb-1">
                        <FaShieldAlt size={12} />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Nivel de Seguridad</span>
                    </div>
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1.5 }}
                            className="h-full bg-teal-400 shadow-[0_0_10px_#2dd4bf]"
                        />
                    </div>
                </div>
            </motion.nav>

            {/* --- FOOTER / SALIR --- */}
            <div className="p-6 border-t border-white/5 bg-black/10">
                <motion.button
                    whileHover={{ scale: 1.02, color: "#fca5a5" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between p-4 rounded-xl text-white hover:bg-red-500/10 transition-all duration-300"
                >
                    <div className="flex items-center gap-3">
                        <FaSignOutAlt className="text-lg" />
                        <span className="text-xs font-black uppercase tracking-widest">Salir</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                </motion.button>

                <div className="mt-4 text-center">
                    <span className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.3em]">
                        Koon Finansen © 2026
                    </span>
                </div>
            </div>
        </aside>
    );
};

export default KoonSidebar;
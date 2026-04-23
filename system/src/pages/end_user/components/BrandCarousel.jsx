// src/pages/end_user/components/BrandCarousel.jsx
import React from 'react';
import { motion } from 'framer-motion';

import tienda1 from '../../../assets/tiendas/tienda1.png';
import tienda2 from '../../../assets/tiendas/tienda2.png';
import tienda3 from '../../../assets/tiendas/tienda3.png';
import tienda4 from '../../../assets/tiendas/tienda4.png';
import tienda5 from '../../../assets/tiendas/tienda5.png';
import tienda6 from '../../../assets/tiendas/tienda6.png';
import tienda7 from '../../../assets/tiendas/tienda7.png';

const brands = [
    { name: 'OXXO', logo: tienda1 },
    { name: 'KIOSKO', logo: tienda2 },
    { name: 'Farmacias del ahorro', logo: tienda3 },
    { name: 'TIENDA4', logo: tienda4 },
    { name: 'TIENDA5', logo: tienda5 },
    { name: 'TIENDA6', logo: tienda6 },
    { name: 'TIENDA7', logo: tienda7 },
];

const BrandCarousel = () => {
    // Multiplicamos el array para asegurar que el scroll sea infinito y sin saltos
    const repeatedBrands = [...brands, ...brands, ...brands, ...brands];

    return (
        <div className="relative w-full overflow-hidden bg-white/10 py-8 rounded-[2rem] border border-white/10 backdrop-blur-sm shadow-sm">
            <motion.div
                className="flex gap-16 items-center w-20" // w-max es clave para que no se amontonen
                animate={{ x: [0, -1500] }} // Ajustamos el recorrido
                transition={{
                    duration: 20, // Más lento (antes era 20)
                    repeat: Infinity,
                    ease: "linear"
                }}
            >
                {repeatedBrands.map((brand, index) => (
                    <div key={index} className="flex-shrink-0 flex items-center justify-center">
                        <img
                            src={brand.logo}
                            alt={brand.name}
                            className="h-10 w-auto object-contain transition-transform hover:scale-110 duration-300"
                        />
                    </div>
                ))}
            </motion.div>

            {/* Efecto de desvanecido a los lados (Fade) para que se vea más premium */}
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#f8fafc] to-transparent z-10"></div>
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#f8fafc] to-transparent z-10"></div>
        </div>
    );
};

export default BrandCarousel;
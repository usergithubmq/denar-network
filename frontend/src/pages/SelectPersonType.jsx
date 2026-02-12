import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function SelectPersonType() {
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState("");
    const [isHovering, setIsHovering] = useState({ fisica: false, moral: false });

    // Recuperar selección previa si existe
    useEffect(() => {
        const savedType = localStorage.getItem("person_type");
        if (savedType) {
            setSelectedType(savedType);
        }
    }, []);

    const chooseType = (type) => {
        setSelectedType(type);
        localStorage.setItem("person_type", type);
        // Podrías añadir un pequeño delay para mostrar feedback visual
        setTimeout(() => {
            navigate("/register");
        }, 300);
    };

    const handleMouseEnter = (type) => {
        setIsHovering(prev => ({ ...prev, [type]: true }));
    };

    const handleMouseLeave = (type) => {
        setIsHovering(prev => ({ ...prev, [type]: false }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center px-4 py-8">

            {/* Header con logo */}
            <div className="text-center mb-10 md:mb-16">
                <div className="mb-4">
                    <h1 className="text-1xl md:text-2xl font-extrabold text-[#279a94] mb-2">
                        KOON <span className="text-[#0c516e]">FINANCEN</span>
                    </h1>
                    <p className="text-gray-600 text-lg">Sistema de préstamos inteligentes</p>
                </div>

                <div className="max-w-2xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 ">
                        Selecciona tu tipo de persona
                    </h2>

                </div>
            </div>

            {/* Indicador visual */}
            <div className="mb-8 flex items-center justify-center">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#0c516e] text-white flex items-center justify-center font-bold">
                        1
                    </div>
                    <div className="w-24 h-1 bg-[#0c516e]"></div>
                    <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center font-bold">
                        2
                    </div>
                </div>
                <div className="ml-6">
                    <span className="text-sm font-medium text-[#0c516e]">Tipo de Persona</span>
                    <span className="text-sm text-gray-500 mx-2">→</span>
                    <span className="text-sm font-medium text-gray-400">Registro</span>
                </div>
            </div>

            {/* Tarjetas de selección */}
            <div className="flex flex-col md:flex-row gap-8 mb-12 w-full max-w-6xl">
                {/* Persona Física */}
                <div
                    className={`flex-1 cursor-pointer transition-all duration-300 ${selectedType === "fisica" ? 'transform scale-105' : ''}`}
                    onClick={() => chooseType("fisica")}
                    onMouseEnter={() => handleMouseEnter("fisica")}
                    onMouseLeave={() => handleMouseLeave("fisica")}
                >
                    <div className={`
                        h-full rounded-2xl shadow-xl border-2 overflow-hidden
                        ${selectedType === "fisica"
                            ? 'border-[#0c516e] bg-gradient-to-br from-blue-50 to-white'
                            : 'border-gray-200 bg-white hover:border-blue-300'
                        }
                        ${isHovering.fisica && selectedType !== "fisica" ? 'transform translate-y-[-5px] shadow-2xl' : ''}
                        transition-all duration-300
                    `}>
                        {/* Header de la tarjeta */}
                        <div className={`
                            p-6 text-center
                            ${selectedType === "fisica"
                                ? 'bg-gradient-to-r from-[#0c516e] to-[#16698c]'
                                : 'bg-gradient-to-r from-[#0c516e] to-[#16698c]'
                            }
                        `}>
                            <div className="flex items-center justify-center mb-2">
                                <div className={`
                                    w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3
                                    ${selectedType === "fisica"
                                        ? 'border-white bg-white'
                                        : 'border-white'
                                    }
                                `}>
                                    {selectedType === "fisica" && (
                                        <div className="w-2 h-2 rounded-full bg-[#0c516e]"></div>
                                    )}
                                </div>
                                <h3 className="text-2xl font-bold text-white">Persona Física</h3>
                            </div>
                            <p className="text-blue-100">Ideal para personas individuales</p>
                        </div>

                        {/* Contenido de la tarjeta */}
                        <div className="p-8">
                            <div className="mb-6">
                                <div className="flex items-start mb-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                                        <span className="text-[#0c516e] font-bold">✓</span>
                                    </div>
                                    <p className="text-gray-700">Profesionistas independientes</p>
                                </div>
                                <div className="flex items-start mb-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                                        <span className="text-[#0c516e] font-bold">✓</span>
                                    </div>
                                    <p className="text-gray-700">Empleados con ingresos fijos</p>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                                        <span className="text-[#0c516e] font-bold">✓</span>
                                    </div>
                                    <p className="text-gray-700">Sin constitución empresarial</p>
                                </div>
                            </div>

                            {/* Indicador de selección */}
                            {selectedType === "fisica" && (
                                <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center">
                                    <span className="text-[#279a94] font-medium flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Seleccionado
                                    </span>
                                </div>
                            )}

                            {/* Botón de acción */}
                            <button
                                className={`
                                    w-full py-4 rounded-xl font-bold text-lg mt-3
                                    ${selectedType === "fisica"
                                        ? 'bg-gradient-to-r from-[#0c516e] to-[#1c749a] text-white'
                                        : 'bg-gradient-to-r from-[#0c516e] to-[#16678a] text-white hover:from-blue-600 hover:to-blue-700'
                                    }
                                    transition-all duration-300 transform hover:scale-[1.02]
                                `}
                                onClick={() => chooseType("fisica")}
                            >
                                {selectedType === "fisica" ? 'Continuar' : 'Seleccionar'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Persona Moral */}
                <div
                    className={`flex-1 cursor-pointer transition-all duration-300 ${selectedType === "moral" ? 'transform scale-105' : ''}`}
                    onClick={() => chooseType("moral")}
                    onMouseEnter={() => handleMouseEnter("moral")}
                    onMouseLeave={() => handleMouseLeave("moral")}
                >
                    <div className={`
                        h-full rounded-2xl shadow-xl border-2 overflow-hidden
                        ${selectedType === "moral"
                            ? 'border-[#279a94] bg-gradient-to-br from-emerald-50 to-white'
                            : 'border-gray-200 bg-white hover:border-emerald-300'
                        }
                        ${isHovering.moral && selectedType !== "moral" ? 'transform translate-y-[-5px] shadow-2xl' : ''}
                        transition-all duration-300
                    `}>
                        {/* Header de la tarjeta */}
                        <div className={`
                            p-6 text-center
                            ${selectedType === "moral"
                                ? 'bg-gradient-to-r from-[#279a94] to-[#279a94]'
                                : 'bg-gradient-to-r from-[#279a94] to-[#279a94]'
                            }
                        `}>
                            <div className="flex items-center justify-center mb-2">
                                <div className={`
                                    w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3
                                    ${selectedType === "moral"
                                        ? 'border-white bg-white'
                                        : 'border-white'
                                    }
                                `}>
                                    {selectedType === "moral" && (
                                        <div className="w-2 h-2 rounded-full bg-[#279a94]"></div>
                                    )}
                                </div>
                                <h3 className="text-2xl font-bold text-white">Persona Moral</h3>
                            </div>
                            <p className="text-emerald-100">Para empresas constituidas</p>
                        </div>

                        {/* Contenido de la tarjeta */}
                        <div className="p-8">
                            <div className="mb-6">
                                <div className="flex items-start mb-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3 mt-1">
                                        <span className="text-[#279a94] font-bold">✓</span>
                                    </div>
                                    <p className="text-gray-700">Sociedades mercantiles (SA, SRL)</p>
                                </div>
                                <div className="flex items-start mb-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3 mt-1">
                                        <span className="text-[#279a94] font-bold">✓</span>
                                    </div>
                                    <p className="text-gray-700">Empresas con RFC propio</p>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3 mt-1">
                                        <span className="text-[#279a94] font-bold">✓</span>
                                    </div>
                                    <p className="text-gray-700">Con acta constitutiva</p>
                                </div>
                            </div>

                            {/* Indicador de selección */}
                            {selectedType === "moral" && (
                                <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center">
                                    <span className="text-[#279a94] font-medium flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Seleccionado
                                    </span>
                                </div>
                            )}

                            {/* Botón de acción */}
                            <button
                                className={`
                                    w-full py-4 rounded-xl font-bold text-lg mt-3
                                    ${selectedType === "moral"
                                        ? 'bg-gradient-to-r from-[#279a94] to-[#279a94] text-white'
                                        : 'bg-gradient-to-r from-[#279a94] to-[#279a94] text-white hover:from-emerald-600 hover:to-emerald-700'
                                    }
                                    transition-all duration-300 transform hover:scale-[1.02]
                                `}
                                onClick={() => chooseType("moral")}
                            >
                                {selectedType === "moral" ? 'Continuar' : 'Seleccionar'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer informativo */}
            <div className="max-w-2xl text-center text-gray-500">
                <p className="mb-2">
                    <span className="font-medium text-gray-700">Tu selección se guarda automáticamente</span>
                    - puedes cambiar esta opción más adelante si es necesario.
                </p>
                <p className="text-sm">
                    Al continuar, aceptas nuestros
                    <a href="#" className="text-blue-600 hover:underline mx-1">Términos de Servicio</a>
                    y
                    <a href="#" className="text-blue-600 hover:underline ml-1">Política de Privacidad</a>
                </p>
            </div>

            {/* Indicador de progreso (mobile) */}
            <div className="fixed bottom-4 left-4 md:hidden">
                <div className="bg-white rounded-full shadow-lg px-4 py-2 flex items-center">
                    <div className="w-2 h-2 rounded-full bg-[#279a94] mr-2"></div>
                    <span className="text-sm font-medium text-gray-700">Paso 1 de 2</span>
                </div>
            </div>
        </div>
    );
}
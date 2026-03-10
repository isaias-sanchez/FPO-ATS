import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import {
    Clock, MapPin, FileText, ChevronRight, ClipboardCheck, AlertTriangle,
    ShieldAlert, Wind, Users, CheckCircle2, XCircle, Activity, Zap,
    Droplets, UserCheck, Check, Trash2, Save, Leaf, PenLine, RotateCcw,
    Minus, BookOpen, HardHat, Glasses, Ear, Shirt, Shield, Hand, Footprints
} from 'lucide-react';
import { DocsIcons, RiskIcons } from './icons/IconsDocs';
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';

// Componente para renderizar íconos dinámicos del carrusel
const DynamicIcon = ({ iconKey, className, type = 'docs' }) => {
    const IconSet = type === 'risk' ? RiskIcons : DocsIcons;
    const IconComponent = IconSet[iconKey];
    return IconComponent ? <IconComponent className={className} /> : <FileText className={className} />;
};

// ──────────────────────────────────────────────
// Datos estáticos del formulario
// ──────────────────────────────────────────────

const DOCUMENTOS_BASICOS = [
    { text: 'Existe una planificación escrita de la actividad a realizar', iconKey: 'planificacion' },
    { text: 'Existe un procedimiento/instructivo documentado y divulgado para la ejecución de la actividad', iconKey: 'procedimiento' },
    { text: 'Conocen los trabajadores las labores a realizar', iconKey: 'labores' },
    { text: 'Conocen los trabajadores las rutas de evacuación', iconKey: 'evacuacion' },
    { text: 'Conocen los trabajadores el plan de emergencias', iconKey: 'emergencias' },
    { text: 'Se realizó verificación del estado de las herramientas a utilizar', iconKey: 'herramientas' },
    { text: 'Disposición anímica, mental y física para la labor del grupo de trabajo', iconKey: 'disposicion' },
    { text: 'Existen condiciones atmosféricas óptimas para la actividad', iconKey: 'clima' },
    { text: 'Demarcación y señalización del área de trabajo', iconKey: 'senalizacion' },
    { text: '¿Conocen los trabajadores los aspectos e impactos ambientales asociados a las actividades?', iconKey: 'ambiental' },
];

const MATRIZ_AMBIENTAL = [
    {
        aspecto: 'Generación de residuos aprovechables y no aprovechables',
        impactos: [
            { impacto: 'Contaminación del agua, aire y suelos', controles: ['Recicla', 'Reutiliza', 'Reduce'] },
            { impacto: 'Sobrecarga de rellenos sanitarios', controles: ['Recicla', 'Reutiliza', 'Reduce'] },
        ],
    },
    {
        aspecto: 'Generación de residuos peligrosos',
        impactos: [
            { impacto: 'Contaminación del aire y suelos', controles: ['Almacenamiento temporal en bolsas rojas'] },
        ],
    },
    {
        aspecto: 'Residuos de construcción y/o demolición (RCD)',
        impactos: [
            { impacto: 'Contaminación del agua y suelos', controles: ['Separación en la fuente'] },
            { impacto: 'Alteración paisajística', controles: ['Acopio temporal (Lonas)'] },
        ],
    },
    {
        aspecto: 'Consumo de sustancias químicas',
        impactos: [
            { impacto: 'Agotamiento de materias primas', controles: ['Hojas de seguridad', 'Rotulación del producto'] },
        ],
    },
    {
        aspecto: 'Emisiones atmosféricas',
        impactos: [
            { impacto: 'Alteración en la calidad del aire', controles: ['Última fecha mantenimiento vehículo'] },
        ],
    },
];

const RIESGOS_BENTO = [
    {
        id: 'biologicos',
        titulo: 'Biológico',
        iconKey: 'biologico',
        colorClass: 'green',
        items: [
            { nombre: 'Mordedura y picadura de animales', controles: ['Análisis de la zona de trabajo', 'Evitar el contacto con animales', 'Evitar el uso de perfumes dulces'] },
            { nombre: 'Virus - Bacterias', controles: ['Lavado de manos', 'Uso de tapabocas si presenta síntomas', 'Consumo de agua tratada'] }
        ],
        colSpan: 'md:col-span-1'
    },
    {
        id: 'fisicos',
        titulo: 'Físico',
        iconKey: 'fisico',
        colorClass: 'sky',
        items: [
            { nombre: 'Radiaciones no ionizantes (Exposición a sol)', controles: ['Hidratación constante', 'Uso de dotación manga larga', 'Disminuir tiempo de exposición al sol'] },
            { nombre: 'Ruido', controles: ['Uso de protección auditiva, inserción o copa'] }
        ],
        colSpan: 'md:col-span-1'
    },
    {
        id: 'psicosocial',
        titulo: 'Psicosocial',
        iconKey: 'psicosocial',
        colorClass: 'amber',
        items: [
            { nombre: 'Condiciones de la tarea', controles: ['Organización del tiempo', 'Cumplimiento del procedimiento'] },
            { nombre: 'Grupo de trabajo', controles: ['Trabajo en equipo', 'Respeto y trato cordial'] }
        ],
        colSpan: 'md:col-span-1'
    },
    {
        id: 'biomecanico',
        titulo: 'Biomecánico',
        iconKey: 'biomecanico',
        colorClass: 'sky',
        items: [
            { nombre: 'Manipulación manual de cargas', controles: ['No levantar más del peso permitido', 'Distribuir la carga'] },
            { nombre: 'Postura prolongada', controles: ['Realizar pausas activas', 'Tomar posturas adecuadas'] }
        ],
        colSpan: 'md:col-span-1'
    },
    {
        id: 'mecanicos',
        titulo: 'Mecánico',
        iconKey: 'mecanico',
        colorClass: 'orange',
        items: [
            { nombre: 'Selección de herramienta adecuada para la tarea', controles: ['Uso de herramientas en buen estado'] },
            { nombre: 'Uso de EPP adecuados en buen estado para la tarea', controles: ['Uso de barreras de protección'] }
        ],
        colSpan: 'md:col-span-1'
    },
    {
        id: 'electrico',
        titulo: 'Eléctrico',
        iconKey: 'electrico',
        colorClass: 'yellow',
        items: [
            { nombre: 'Identificar el nivel de tensión a intervenir', controles: ['Seleccionar los equipos y herramientas adecuados', 'Inspeccionar los equipos y EPP dieléctricos', 'Uso de guantes adecuados al nivel de tensión', 'Uso de dotación ignífuga', 'Uso de careta Arc Flash', 'Respetar distancias de seguridad', 'Cumplimiento de las 5 RO'] }
        ],
        colSpan: 'md:col-span-1'
    },
    {
        id: 'locativo',
        titulo: 'Condiciones de Seguridad - Locativo',
        iconKey: 'locativo',
        colorClass: 'orange',
        items: [
            { nombre: 'Análisis de la zona de trabajo', controles: ['Señalizar las zonas de trabajo y desniveles', 'Caminar por zonas seguras', 'Usar calzado adecuado para la labor', 'Respetar las señalizaciones del entorno'] }
        ],
        colSpan: 'md:col-span-1'
    },
    {
        id: 'transito',
        titulo: 'Accidentes de tránsito',
        iconKey: 'transito',
        colorClass: 'yellow',
        items: [
            { nombre: 'Inspección preoperacional del vehículo', controles: ['No exceder los límites de velocidad establecidos', 'Respetar las señalizaciones en la vía', 'Cumplimiento de las normas de tránsito', 'Uso obligatorio del cinturón', 'No usar equipos celulares o distracciones bidireccionales', 'Aplicar normas de manejo defensivo', 'Mantener la concentración en la vía'] }
        ],
        colSpan: 'md:col-span-1'
    },
    {
        id: 'publico',
        titulo: 'Público',
        iconKey: 'publico',
        colorClass: 'blue',
        items: [
            { nombre: 'Ante un atraco, asalto o similares no colocar resistencia', controles: ['Aplicar técnicas de manejo de emociones', 'Mantener un trato cordial hacia los usuarios', 'Evitar confrontaciones con terceros'] }
        ],
        colSpan: 'md:col-span-1'
    },
    {
        id: 'alturas',
        titulo: 'Trabajo en Alturas (>2m)',
        iconKey: 'mecanico',
        colorClass: 'orange',
        items: [
            { nombre: 'Realizar inspección de los ECC (Equipos Contra Caída)', controles: ['Uso adecuado de los ECC', 'Diligenciar permiso de trabajo', 'Diligenciar lista de chequeo de TSA (Trabajo Seguro en Alturas)', 'Instalación adecuada del equipo de rescate'] }
        ],
        colSpan: 'md:col-span-1'
    },
    {
        id: 'tecnologico',
        titulo: 'Tecnológicos',
        iconKey: 'tecnologico',
        colorClass: 'green',
        items: [
            { nombre: 'Fallo y emergencias', controles: ['Validar que se cuenta con extintor vigente y recargado'] }
        ],
        colSpan: 'md:col-span-1'
    },
    {
        id: 'naturales',
        titulo: 'Fenómenos naturales',
        iconKey: 'natural',
        colorClass: 'blue',
        items: [
            { nombre: 'Lluvias, inundaciones, etc.', controles: ['Suspender actividades por prevención'] },
            { nombre: 'Sismos, terremotos, deslizamientos, etc.', controles: ['Aplicar técnicas de evacuación'] }
        ],
        colSpan: 'md:col-span-1'
    }
];

const EPP_LABELS = {
    casco: 'Casco con barbuquejo',
    gafas: 'Protección visual',
    auditiva: 'Protección auditiva',
    respiratoria: 'Protección respiratoria',
    guantes: 'Guantes diélectricos',
    botas: 'Botas de seguridad',
    ropa: 'Ropa adecuada (ignífuga/dieléctrica)',
    mangas: 'Mangas dieléctricas',
    arnes: 'Equipos contra caída (ECC)',
};

// Municipios del departamento de Atlántico con su zona de trabajo
const ATLANTICO_MUNICIPIOS = [
    "Barranquilla", "Soledad", "Malambo", "Galapa", "Puerto Colombia",
    "Luruaco", "Sabanalarga", "Polonuevo", "Baranoa", "Usiacurí",
    "Campo de la Cruz", "Candelaria", "Manatí", "Repelón", "Santa Lucía", "Suán"
];

const MUNICIPIO_ZONA = {
    "Barranquilla": "Zona Norte", "Soledad": "Zona Norte", "Malambo": "Zona Norte",
    "Galapa": "Zona Norte", "Puerto Colombia": "Zona Norte",
    "Luruaco": "Zona Centro", "Sabanalarga": "Zona Centro", "Polonuevo": "Zona Centro",
    "Baranoa": "Zona Centro", "Usiacurí": "Zona Centro",
    "Campo de la Cruz": "Zona Sur", "Candelaria": "Zona Sur", "Manatí": "Zona Sur",
    "Repelón": "Zona Sur", "Santa Lucía": "Zona Sur", "Suán": "Zona Sur"
};

// ──────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────

export default function FormapATS() {
    const sigCanvas = useRef(null);

    const [formData, setFormData] = useState({
        // Paso 1
        fecha: '', horaInicio: '', horaFin: '',
        proyecto: '',
        departamento: 'Atlántico', municipio: '', lugarTrabajo: '',
        consignacion: null, permisos: null, permisosDetalle: '',
        // Paso 2
        epp: { casco: { estado: 'ok', novedad: '' }, gafas: { estado: 'ok', novedad: '' }, auditiva: { estado: 'ok', novedad: '' }, respiratoria: { estado: 'ok', novedad: '' }, guantes: { estado: 'ok', novedad: '' }, botas: { estado: 'ok', novedad: '' }, ropa: { estado: 'ok', novedad: '' }, mangas: { estado: 'ok', novedad: '' }, arnes: { estado: 'ok', novedad: '' } },
        documentosBasicos: {},      // { [item.text]: 'C' | 'NC' | 'NA' }
        // Paso 3
        riesgos: [], observaciones: '',
        riesgosControles: {},       // { [bloqueId]: { descripcion: '', metodosControl: [] } }
        // Paso 4: matriz ambiental
        impactosSeleccionados: {},  // { [aspecto|||impacto]: boolean }
        controlesAmbientales: {},
        // Paso 5
        ejecutores: [{ id: 1, nombre: '', cedula: '', cargo: '', firma: null }],
        aceptacionTerminos: false,
    });

    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 5;
    const [showJSON, setShowJSON] = useState(false);
    const [currentDocIndex, setCurrentDocIndex] = useState(0);
    const [expandedAspect, setExpandedAspect] = useState(null); // Estado para el acordeón del Paso 4
    const signatureRefs = useRef({}); // Refs para multiples canvas

    // Estados para Autocompletados (paso 1)
    const [deptSuggestions, setDeptSuggestions] = useState([]);
    const [munSuggestions, setMunSuggestions] = useState([]);
    // Para ocultar la lista al seleccionar
    const [showDeptList, setShowDeptList] = useState(false);
    const [showMunList, setShowMunList] = useState(false);

    // Estado Modal Novedad EPP
    const [novedadModal, setNovedadModal] = useState({ isOpen: false, itemKey: null });

    // ── Manejadores ──

    React.useEffect(() => {
        // Auto-fecha y hora actual al cargar el componente
        const now = new Date();
        const autoFecha = now.toISOString().split('T')[0];
        const autoHora = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        setFormData(prev => ({ ...prev, fecha: autoFecha, horaInicio: autoHora, departamento: 'Atlántico' }));
    }, []);

    const handleLocationInput = (field, value) => {
        handleInputChange(field, value);

        if (field === 'municipio') {
            if (value.length >= 3) {
                const matches = ATLANTICO_MUNICIPIOS.filter(m =>
                    m.toLowerCase().includes(value.toLowerCase())
                );
                setMunSuggestions(matches);
                setShowMunList(true);
            } else {
                setShowMunList(false);
            }
        }
    };

    const selectLocation = (field, value) => {
        handleInputChange(field, value);
        if (field === 'municipio') {
            setShowMunList(false);
            const zona = MUNICIPIO_ZONA[value];
            if (zona) handleInputChange('lugarTrabajo', zona);
        }
    };

    const handleInputChange = (field, value) =>
        setFormData(prev => ({ ...prev, [field]: value }));

    const handleEppChange = (item, value) =>
        setFormData(prev => ({ ...prev, epp: { ...prev.epp, [item]: value } }));

    const handleEppClick = (itemKey) => {
        const current = formData.epp[itemKey];
        if (!current || !current.estado || current.estado === 'na') {
            handleEppChange(itemKey, { estado: 'ok', novedad: '' });
        } else if (current.estado === 'ok') {
            handleEppChange(itemKey, { estado: 'novedad', novedad: '' });
            setNovedadModal({ isOpen: true, itemKey });
        } else if (current.estado === 'novedad') {
            handleEppChange(itemKey, { estado: 'na', novedad: '' });
        }
    };

    const confirmNovedad = (reason) => {
        handleEppChange(novedadModal.itemKey, { estado: 'novedad', novedad: reason });
        setNovedadModal({ isOpen: false, itemKey: null });
    };

    const handleDocChange = (itemText, value) => {
        setFormData(prev => ({
            ...prev,
            documentosBasicos: { ...prev.documentosBasicos, [itemText]: value }
        }));

        // Auto-advance carousel
        if (currentDocIndex < DOCUMENTOS_BASICOS.length - 1) {
            setTimeout(() => {
                setCurrentDocIndex(prev => prev + 1);
            }, 300); // Pequeño retraso para que se vea la selección
        }
    };

    const handleControlChange = (control, value) =>
        setFormData(prev => ({
            ...prev,
            controlesAmbientales: { ...prev.controlesAmbientales, [control]: value }
        }));

    const toggleRiesgo = (item) =>
        setFormData(prev => ({
            ...prev,
            riesgos: prev.riesgos.includes(item)
                ? prev.riesgos.filter(i => i !== item)
                : [...prev.riesgos, item]
        }));

    const handleRiesgoControlChange = (bloqueId, field, value) =>
        setFormData(prev => ({
            ...prev,
            riesgosControles: {
                ...prev.riesgosControles,
                [bloqueId]: { ...prev.riesgosControles[bloqueId], [field]: value }
            }
        }));

    const toggleMetodoControl = (descripcionId, metodo) => {
        const current = formData.riesgosControles[descripcionId]?.metodosControl || [];
        const updated = current.includes(metodo) ? current.filter(m => m !== metodo) : [...current, metodo];
        handleRiesgoControlChange(descripcionId, 'metodosControl', updated);
    };

    const toggleImpacto = (aspecto, impacto) => {
        const impactoKey = `${aspecto}|||${impacto}`;
        const isCurrentlySelected = formData.impactosSeleccionados[impactoKey];
        setFormData(prev => ({
            ...prev,
            impactosSeleccionados: { ...prev.impactosSeleccionados, [impactoKey]: !isCurrentlySelected },
            controlesAmbientales: isCurrentlySelected
                ? Object.fromEntries(Object.entries(prev.controlesAmbientales).filter(([k]) => !k.startsWith(`${impacto}|||`)))
                : prev.controlesAmbientales
        }));
    };

    const addEjecutor = () =>
        setFormData(prev => ({
            ...prev,
            ejecutores: [...prev.ejecutores, { id: Date.now(), nombre: '', cedula: '', cargo: '', firma: null }]
        }));

    const updateEjecutor = (id, field, value) =>
        setFormData(prev => ({
            ...prev,
            ejecutores: prev.ejecutores.map(ej => ej.id === id ? { ...ej, [field]: value } : ej)
        }));

    const removeEjecutor = (id) => {
        if (formData.ejecutores.length > 1) {
            setFormData(prev => ({
                ...prev,
                ejecutores: prev.ejecutores.filter(ej => ej.id !== id)
            }));
            // Limpiar la referencia del canvas eliminado
            delete signatureRefs.current[id];
        }
    };

    const clearSignature = (id) => {
        if (signatureRefs.current[id]) {
            signatureRefs.current[id].clear();
        }
        updateEjecutor(id, 'firma', null);
    };

    const saveSignature = (id) => {
        if (signatureRefs.current[id] && !signatureRefs.current[id].isEmpty()) {
            const signatureData = signatureRefs.current[id].toDataURL('image/png');
            updateEjecutor(id, 'firma', signatureData);
        }
    };

    // ── Validaciones ──

    const isStep1Valid = () => {
        const { fecha, horaInicio, horaFin, departamento, municipio, lugarTrabajo, consignacion, permisos, proyecto } = formData;
        return fecha && horaInicio && horaFin && departamento.trim() && municipio.trim() && lugarTrabajo.trim() && proyecto.trim() && consignacion !== null && permisos !== null;
    };

    const isStep2Valid = () => {
        const eppVals = Object.values(formData.epp);
        // Valid for kill-switch: all items must have a state !== null.
        // If state is 'novedad', it must have a reason string.
        const eppOk = eppVals.every(v => v !== null && v.estado && (v.estado !== 'novedad' || (v.novedad && v.novedad.trim() !== '')));
        const docsOk = DOCUMENTOS_BASICOS.every(d => !!formData.documentosBasicos[d.text]);
        return eppOk && docsOk;
    };

    const isStep3Valid = () => formData.riesgos.length > 0;

    const isStep4Valid = () =>
        Object.values(formData.impactosSeleccionados).some(Boolean) &&
        Object.values(formData.controlesAmbientales).some(v => v === true);

    const isStep5Valid = () => {
        const ejecutoresOk = formData.ejecutores.every(ej => ej.nombre.trim() && ej.cedula.trim() && ej.cargo.trim() && ej.firma);
        return ejecutoresOk && formData.aceptacionTerminos;
    };

    const isCurrentStepValid = () => {
        switch (currentStep) {
            case 1: return isStep1Valid();
            case 2: return isStep2Valid();
            case 3: return isStep3Valid();
            case 4: return isStep4Valid();
            case 5: return isStep5Valid();
            default: return false;
        }
    };

    const nextStep = () => {
        if (isCurrentStepValid() && currentStep < totalSteps) {
            setCurrentStep(p => p + 1);
            window.scrollTo(0, 0);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(p => p - 1);
            window.scrollTo(0, 0);
        }
    };

    const finalizar = () => { if (isStep5Valid()) setShowJSON(true); };

    // ──────────────────────────────────────────────
    // Sub-componentes
    // ──────────────────────────────────────────────

    const TouchToggle = ({ label, value, onChange, icon: Icon }) => (
        <div className="flex flex-col gap-3">
            <label className="font-semibold text-ises-dark flex items-center gap-2 text-sm">
                {Icon && <Icon className="w-5 h-5 text-ises-blue flex-shrink-0" />}
                {label}
            </label>
            <div className="flex gap-3">
                <button type="button" onClick={() => onChange(true)}
                    className={`flex-1 py-4 rounded-xl border-2 font-bold text-lg transition-all
                        ${value === true ? 'border-ises-green bg-ises-green/10 text-ises-green-dark' : 'border-slate-200 bg-white text-slate-400'}`}>
                    SÍ
                </button>
                <button type="button" onClick={() => onChange(false)}
                    className={`flex-1 py-4 rounded-xl border-2 font-bold text-lg transition-all
                        ${value === false ? 'border-ises-dark bg-slate-100 text-ises-dark' : 'border-slate-200 bg-white text-slate-400'}`}>
                    NO
                </button>
            </div>
        </div>
    );

    const EppToggle = ({ label, itemKey }) => {
        const value = formData.epp[itemKey];
        return (
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-medium text-ises-dark text-sm">{label}</span>
                <div className="flex gap-2">
                    <button onClick={() => handleEppChange(itemKey, true)}
                        className={`p-2 rounded-lg border-2 transition-all
                            ${value === true ? 'border-ises-green bg-ises-green/10 text-ises-green-dark' : 'border-slate-200 bg-white text-slate-300'}`}>
                        <CheckCircle2 className="w-6 h-6" />
                    </button>
                    <button onClick={() => handleEppChange(itemKey, false)}
                        className={`p-2 rounded-lg border-2 transition-all
                            ${value === false ? 'border-red-500 bg-red-50 text-red-600' : 'border-slate-200 bg-white text-slate-300'}`}>
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>
            </div>
        );
    };

    // C / NC / NA triple toggle
    const TripleToggle = ({ label, itemKey, onChange, value }) => (
        <div className="flex items-start justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-medium text-ises-dark text-xs leading-tight flex-1 pt-0.5">{label}</span>
            <div className="flex gap-1.5 flex-shrink-0">
                {[
                    { key: 'C', label: 'C', active: 'bg-ises-green text-white border-ises-green' },
                    { key: 'NC', label: 'NC', active: 'bg-red-500 text-white border-red-500' },
                    { key: 'NA', label: 'NA', active: 'bg-slate-500 text-white border-slate-500' },
                ].map(opt => (
                    <button key={opt.key}
                        onClick={() => onChange(itemKey, opt.key)}
                        className={`w-10 h-9 rounded-lg border-2 font-bold text-xs transition-all
                            ${value === opt.key ? opt.active : 'bg-white text-slate-400 border-slate-200'}`}>
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );

    // Componente Carrusel Flashcard
    const FlashcardCarousel = () => {
        const currentDoc = DOCUMENTOS_BASICOS[currentDocIndex];
        const currentValue = formData.documentosBasicos[currentDoc.text];
        const respondidas = Object.keys(formData.documentosBasicos).length;

        return (
            <div className="space-y-4 relative">
                <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Pregunta {currentDocIndex + 1} de {DOCUMENTOS_BASICOS.length}
                    </span>
                    <span className="text-xs font-extrabold text-ises-blue">
                        {respondidas} respondidas
                    </span>
                </div>

                {/* Indicador de progreso de tarjetas */}
                <div className="flex gap-1 mb-4">
                    {DOCUMENTOS_BASICOS.map((doc, idx) => {
                        const isAns = !!formData.documentosBasicos[doc.text];
                        const isCur = idx === currentDocIndex;
                        return (
                            <div key={idx}
                                className={`h-1.5 rounded-full flex-1 transition-all duration-300
                                ${isCur ? 'bg-ises-blue scale-y-150' : isAns ? 'bg-ises-green' : 'bg-slate-200'}`} />
                        )
                    })}
                </div>

                <div className="bg-slate-50 rounded-2xl border-2 border-slate-200 p-6 flex flex-col items-center text-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] min-h-[220px] transition-all duration-300 relative overflow-hidden group">

                    {/* Botones de navegación — siempre visibles */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-2 right-2 flex justify-between">
                        <button onClick={(e) => { e.stopPropagation(); setCurrentDocIndex(p => Math.max(0, p - 1)) }}
                            disabled={currentDocIndex === 0}
                            className={`p-2 rounded-full bg-white shadow-md border border-slate-200 transition-transform active:scale-90
                            ${currentDocIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110'}`}>
                            <ChevronRight className="w-5 h-5 text-slate-600 rotate-180" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setCurrentDocIndex(p => Math.min(DOCUMENTOS_BASICOS.length - 1, p + 1)) }}
                            disabled={currentDocIndex === DOCUMENTOS_BASICOS.length - 1}
                            className={`p-2 rounded-full bg-white shadow-md border border-slate-200 transition-transform active:scale-90
                            ${currentDocIndex === DOCUMENTOS_BASICOS.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110'}`}>
                            <ChevronRight className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>

                    {/* El ícono */}
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4 text-ises-blue relative z-10">
                        {/* Como no importamos los SVGs reales de Iconscout en este archivo de un tirón, si existen en IconsDocs.jsx se renderizan aquí */}
                        <DynamicIcon iconKey={currentDoc.iconKey} className="w-10 h-10" />
                    </div>

                    <h3 className="text-sm font-extrabold text-ises-dark leading-snug mb-6 max-w-[250px] relative z-10">
                        {currentDoc.text}
                    </h3>

                    <div className="flex gap-3 w-full max-w-[280px] mt-auto relative z-10">
                        {[
                            { key: 'C', label: 'CUMPLIÓ', active: 'bg-ises-green text-white border-ises-green shadow-lg shadow-ises-green/30 scale-105' },
                            { key: 'NC', label: 'NO CUMPLIÓ', active: 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/30 scale-105' },
                            { key: 'NA', label: 'NO APLICA', active: 'bg-slate-500 text-white border-slate-500 shadow-lg shadow-slate-500/30 scale-105' },
                        ].map(opt => (
                            <button key={opt.key}
                                onClick={() => handleDocChange(currentDoc.text, opt.key)}
                                className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs transition-all duration-300
                                    ${currentValue === opt.key ? opt.active : 'bg-white text-slate-500 border-slate-300 hover:border-ises-blue hover:text-ises-blue hover:bg-ises-blue/5'}`}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const BentoBoxCategory = ({ bloque }) => {
        const colorMap = {
            green: { text: 'text-ises-green', bg: 'bg-ises-green/10', light: 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:border-ises-green hover:shadow-sm', active: 'bg-ises-green text-white border-ises-green shadow-[0_4px_12px_rgba(153,204,51,0.3)]' },
            amber: { text: 'text-amber-500', bg: 'bg-amber-500/10', light: 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:border-amber-400 hover:shadow-sm', active: 'bg-amber-500 text-white border-amber-500 shadow-[0_4px_12px_rgba(245,158,11,0.3)]' },
            orange: { text: 'text-orange-500', bg: 'bg-orange-500/10', light: 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:border-orange-400 hover:shadow-sm', active: 'bg-orange-500 text-white border-orange-500 shadow-[0_4px_12px_rgba(249,115,22,0.3)]' },
            yellow: { text: 'text-yellow-500', bg: 'bg-yellow-500/10', light: 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:border-yellow-400 hover:shadow-sm', active: 'bg-yellow-500 text-white border-yellow-500 shadow-[0_4px_12px_rgba(234,179,8,0.3)]' },
            blue: { text: 'text-ises-blue', bg: 'bg-ises-blue/10', light: 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:border-ises-blue hover:shadow-sm', active: 'bg-ises-blue text-white border-ises-blue shadow-[0_4px_12px_rgba(0,114,206,0.3)]' },
            sky: { text: 'text-sky-500', bg: 'bg-sky-500/10', light: 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:border-sky-400 hover:shadow-sm', active: 'bg-sky-500 text-white border-sky-500 shadow-[0_4px_12px_rgba(14,165,233,0.3)]' }
        };
        const theme = colorMap[bloque.colorClass] || colorMap.blue;
        // Cuenta descripciones seleccionadas basadas en si el formData.riesgos las tiene incluidas
        const selectedCount = bloque.items.filter(item => formData.riesgos.includes(item.nombre)).length;

        return (
            <div className={`bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4 ${bloque.colSpan} relative overflow-hidden`}>
                <div className="flex items-center gap-3 relative z-10 border-b border-slate-100 pb-3 mb-1">
                    <div className={`p-2.5 rounded-xl ${theme.bg}`}>
                        <DynamicIcon type="risk" iconKey={bloque.iconKey} className={`w-6 h-6 ${theme.text}`} />
                    </div>
                    <div>
                        {/* El nombre del Riesgo */}
                        <h3 className="font-extrabold text-ises-dark text-lg leading-tight uppercase">{bloque.titulo}</h3>
                        <p className="text-xs font-bold text-slate-400 mt-0.5">
                            {selectedCount} Tareas Seleccionadas
                        </p>
                    </div>
                </div>

                {/* Sub-bloques (Descripciones) seleccionables */}
                <div className="flex flex-col gap-3 relative z-10 overflow-visible">
                    {bloque.items.map((item, idx) => {
                        const isSelected = formData.riesgos.includes(item.nombre);
                        const itemId = `${bloque.id}_${idx}`;
                        const metodosControlSeleccionados = formData.riesgosControles[itemId]?.metodosControl || [];

                        return (
                            <div key={idx} className="flex flex-col gap-2">
                                <button
                                    onClick={() => toggleRiesgo(item.nombre)}
                                    className={`text-left text-xs font-bold px-4 py-3.5 rounded-xl border-2 transition-all duration-300 flex items-center justify-between gap-3 shadow-sm
                                        ${isSelected ? theme.active : theme.light}`}>
                                    <span className="leading-snug">{item.nombre}</span>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {isSelected && metodosControlSeleccionados.length > 0 && (
                                            <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px] backdrop-blur-sm border border-white/30 hidden sm:inline-block">
                                                {metodosControlSeleccionados.length} Controles
                                            </span>
                                        )}
                                        {isSelected ? <Check className="w-5 h-5 text-white" strokeWidth={3} /> : <div className="w-4 h-4 rounded-full border border-slate-300 opacity-50" />}
                                    </div>
                                </button>

                                {/* Despliegue de los métodos de control si la descripción está seleccionada */}
                                {isSelected && item.controles && item.controles.length > 0 && (
                                    <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-4 -mt-1 mx-1 shadow-inner animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex justify-between items-center mb-3">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 focus:outline-none">
                                                <ShieldAlert className="w-3.5 h-3.5" /> Métodos de control a aplicar
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-2.5">
                                            {item.controles.map(control => {
                                                const isControlSelected = metodosControlSeleccionados.includes(control);
                                                return (
                                                    <label key={control} className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer group transition-all duration-200 border border-transparent 
                                                        ${isControlSelected ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] border-slate-200 scale-[1.01]' : 'hover:bg-white hover:border-slate-200'}`}>
                                                        <div className="relative flex items-center justify-center mt-0.5 flex-shrink-0">
                                                            <input type="checkbox"
                                                                className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-2 focus:ring-ises-green focus:ring-offset-1 checked:bg-ises-green checked:border-ises-green transition-all"
                                                                checked={isControlSelected}
                                                                onChange={() => toggleMetodoControl(itemId, control)} />
                                                            <Check className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={4} />
                                                        </div>
                                                        <span className={`text-xs font-semibold select-none transition-colors mt-0.5 leading-snug 
                                                            ${isControlSelected ? 'text-ises-dark' : 'text-slate-500 group-hover:text-ises-dark'}`}>
                                                            {control}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const AccordionImpactCategory = ({ aspecto, impactos, isOpen, onToggle }) => {
        const hasSelectedControls = impactos.some(imp =>
            imp.controles.some(ctrl => formData.controlesAmbientales[`${imp.impacto}|||${ctrl}`])
        );
        const hasSelectedImpacts = impactos.some(imp =>
            formData.impactosSeleccionados[`${aspecto}|||${imp.impacto}`]
        );
        const isActive = isOpen || hasSelectedControls || hasSelectedImpacts;

        return (
            <div className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden
                ${isActive ? 'border-ises-green shadow-md ring-1 ring-ises-green/20' : 'border-slate-100 hover:border-slate-300'}`}>

                {/* Cabecera del Acordeón */}
                <button
                    onClick={onToggle}
                    className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors text-left"
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-ises-green/10 text-ises-green' : 'bg-slate-100 text-slate-500'}`}>
                            <Leaf className="w-5 h-5" />
                        </div>
                        <h3 className={`font-extrabold text-sm md:text-base pr-4 transition-colors ${isActive ? 'text-ises-green-dark' : 'text-ises-dark'}`}>
                            {aspecto}
                        </h3>
                    </div>
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                        <div className={`transform transition-transform duration-300 ${isOpen ? '-rotate-90' : 'rotate-90'}`}>
                            <ChevronRight className={`w-5 h-5 ${isActive ? 'text-ises-green' : 'text-slate-400'}`} />
                        </div>
                        {(hasSelectedControls || hasSelectedImpacts) && !isOpen && (
                            <div className="w-1.5 h-1.5 bg-ises-green rounded-full shadow-[0_0_5px_rgba(153,204,51,0.5)]" />
                        )}
                    </div>
                </button>

                {/* Contenido Expandible */}
                <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/50 space-y-4">

                        {/* Paso 1: Seleccionar el impacto ambiental */}
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">1. Selecciona el impacto ambiental:</p>
                            <div className="flex flex-wrap gap-2">
                                {impactos.map(({ impacto }) => {
                                    const impactoKey = `${aspecto}|||${impacto}`;
                                    const isSelected = formData.impactosSeleccionados[impactoKey];
                                    return (
                                        <button key={impacto}
                                            onClick={() => toggleImpacto(aspecto, impacto)}
                                            className={`text-xs font-bold px-3 py-2 rounded-xl border-2 flex items-center gap-1.5 transition-all duration-200
                                                ${isSelected
                                                    ? 'bg-ises-green text-white border-ises-green shadow-[0_4px_12px_rgba(153,204,51,0.3)]'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-ises-green/50 hover:bg-ises-green/5'}`}>
                                            {isSelected && <Check className="w-3 h-3 flex-shrink-0" strokeWidth={3} />}
                                            {impacto}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Paso 2: Métodos de control para impactos seleccionados */}
                        {impactos.filter(({ impacto }) => formData.impactosSeleccionados[`${aspecto}|||${impacto}`]).map(({ impacto, controles }) => (
                            <div key={impacto} className="border border-slate-200 rounded-xl bg-white p-4 shadow-sm">
                                <h4 className="font-extrabold text-sm text-ises-dark mb-3 flex items-start gap-2">
                                    <div className="mt-0.5 p-1 bg-red-50 rounded"><AlertTriangle className="w-4 h-4 text-red-500" /></div>
                                    {impacto}
                                </h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">2. Método de control:</p>
                                <div className="flex flex-wrap gap-2">
                                    {controles.map(control => {
                                        const compositeKey = `${impacto}|||${control}`;
                                        const active = formData.controlesAmbientales[compositeKey];
                                        return (
                                            <button key={compositeKey}
                                                onClick={() => handleControlChange(compositeKey, !active)}
                                                className={`text-left text-[11px] font-bold px-3 py-2 rounded-lg border-2 transition-all duration-300 flex items-center gap-2
                                                    ${active
                                                        ? 'bg-ises-green text-white border-ises-green shadow-[0_4px_12px_rgba(153,204,51,0.3)] scale-105'
                                                        : 'bg-white border-slate-200 text-slate-600 hover:border-ises-green/50 hover:bg-ises-green/5 flex-grow sm:flex-grow-0'}`}>
                                                {active ? <span><Check className="w-3.5 h-3.5" strokeWidth={3} /></span> : null}
                                                <span>{control}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // ──────────────────────────────────────────────
    // Exportaciones PDF y Excel
    // ──────────────────────────────────────────────
    const handleExportPDF = () => {
        const element = document.getElementById('ats-print-view');
        // Usamos html2pdf para generar el PDF directamente sin abrir ventana de imprimir
        const opt = {
            margin: [5, 5, 5, 5],
            filename: `ATS_${formData.fecha || 'SinFecha'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                onclone: async (clonedDoc) => {
                    const style = clonedDoc.createElement('style');
                    style.innerHTML = `
                        #ats-print-view { background-color: #ffffff !important; color: #333333 !important; }
                        #ats-print-view .bg-slate-50 { background-color: #f8fafc !important; }
                        #ats-print-view .bg-slate-100 { background-color: #f1f5f9 !important; }
                        #ats-print-view .bg-slate-200 { background-color: #e2e8f0 !important; }
                        #ats-print-view .bg-slate-300 { background-color: #cbd5e1 !important; }
                        #ats-print-view .border-slate-100 { border-color: #f1f5f9 !important; }
                        #ats-print-view .border-slate-200 { border-color: #e2e8f0 !important; }
                        #ats-print-view .border-slate-300 { border-color: #cbd5e1 !important; }
                        #ats-print-view .border-slate-400 { border-color: #94a3b8 !important; }
                        #ats-print-view .text-slate-300 { color: #cbd5e1 !important; }
                        #ats-print-view .text-slate-400 { color: #94a3b8 !important; }
                        #ats-print-view .text-slate-500 { color: #64748b !important; }
                        #ats-print-view .text-slate-600 { color: #475569 !important; }
                        #ats-print-view .text-ises-dark { color: #333333 !important; }
                        #ats-print-view .border-ises-green { border-color: #99CC33 !important; }
                        #ats-print-view .text-ises-green { color: #99CC33 !important; }
                        #ats-print-view .text-ises-green-dark { color: #7aa329 !important; }
                        #ats-print-view .bg-ises-green { background-color: #99CC33 !important; }
                        #ats-print-view .border-ises-green-dark { border-color: #7aa329 !important; }
                        #ats-print-view .text-amber-500 { color: #f59e0b !important; }
                        #ats-print-view .bg-amber-400 { background-color: #fbbf24 !important; }
                        #ats-print-view .bg-amber-500 { background-color: #f59e0b !important; }
                        #ats-print-view .text-amber-600 { color: #d97706 !important; }
                        #ats-print-view .border-amber-600 { border-color: #d97706 !important; }
                        #ats-print-view .text-amber-700 { color: #b45309 !important; }
                        #ats-print-view .text-red-500 { color: #ef4444 !important; }
                        #ats-print-view .text-red-600 { color: #dc2626 !important; }
                        #ats-print-view .bg-red-500 { background-color: #ef4444 !important; }
                        #ats-print-view .border-red-500 { border-color: #ef4444 !important; }
                        #ats-print-view .text-ises-blue { color: #0099CC !important; }
                        #ats-print-view .bg-white { background-color: #ffffff !important; }
                        #ats-print-view .opacity-50 { opacity: 0.5 !important; }
                    `;
                    clonedDoc.head.appendChild(style);

                    // Función para eliminar declaraciones oklch de texto CSS
                    const stripOklch = (text) => text.replace(/([a-zA-Z0-9-]+)\s*:\s*([^;}]*oklch[^;}]*)(;|\})/gi, (m, prop, val, end) => end === '}' ? '}' : '');

                    // 1. Limpiar <style> tags en el documento clonado
                    clonedDoc.querySelectorAll('style').forEach(s => {
                        if (s.textContent && s.textContent.includes('oklch')) {
                            s.textContent = stripOklch(s.textContent);
                        }
                    });

                    // 2. Limpiar estilos inline de elementos
                    clonedDoc.querySelectorAll('[style]').forEach(el => {
                        const styleAttr = el.getAttribute('style');
                        if (styleAttr && styleAttr.includes('oklch')) {
                            el.setAttribute('style', stripOklch(styleAttr));
                        }
                    });

                    // 3. Reemplazar hojas de estilos externas (<link rel="stylesheet">)
                    //    con <style> inline con oklch removido (esto resuelve el crash en Vercel/producción)
                    const linkEls = Array.from(clonedDoc.querySelectorAll('link[rel="stylesheet"]'));
                    await Promise.all(linkEls.map(async (link) => {
                        try {
                            const href = link.href;
                            if (!href) return;
                            const res = await fetch(href);
                            let cssText = await res.text();
                            if (cssText.includes('oklch')) {
                                cssText = stripOklch(cssText);
                            }
                            const inlineStyle = clonedDoc.createElement('style');
                            inlineStyle.textContent = cssText;
                            link.parentNode.replaceChild(inlineStyle, link);
                        } catch (e) {
                            // Si no se puede cargar la hoja, simplemente la eliminamos
                            link.remove();
                        }
                    }));
                }
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    const handleExportExcel = () => {
        const wb = XLSX.utils.book_new();

        const wsGeneral = XLSX.utils.json_to_sheet([{
            Proyecto: formData.proyecto || '',
            Fecha: formData.fecha,
            Hora_Inicio: formData.horaInicio,
            Hora_Fin: formData.horaFin,
            Departamento: formData.departamento,
            Municipio: formData.municipio,
            Lugar_Exacto: formData.lugarTrabajo,
            Permisos: formData.permisos ? 'Sí' : 'No',
            Permisos_Cuales: formData.permisosDetalle || '',
            Consignacion: formData.consignacion ? 'Sí' : 'No',
            Observaciones_Riesgos: formData.observaciones || ''
        }]);
        XLSX.utils.book_append_sheet(wb, wsGeneral, "General");

        const eppData = Object.entries(formData.epp).map(([item, data]) => ({
            Elemento: item,
            Estado: data?.estado || 'Pendiente',
            Novedad: data?.novedad || ''
        }));
        const wsEpp = XLSX.utils.json_to_sheet(eppData);
        XLSX.utils.book_append_sheet(wb, wsEpp, "EPP");

        const docsData = Object.entries(formData.documentosBasicos).map(([doc, val]) => ({
            Documento: doc,
            Respuesta: val
        }));
        const wsDocs = XLSX.utils.json_to_sheet(docsData);
        XLSX.utils.book_append_sheet(wb, wsDocs, "Documentos");

        const riesgosControles = [
            ...RIESGOS_BENTO.filter(b => b.items.some(i => formData.riesgos.includes(i))).flatMap(bloque => {
                const bData = formData.riesgosControles[bloque.id] || {};
                return [
                    ...bloque.items.filter(i => formData.riesgos.includes(i)).map(r => ({ Categoria: bloque.titulo, Riesgo: r, Descripcion: bData.descripcion || '', Metodos_Control: (bData.metodosControl || []).join(', ') }))
                ];
            }),
            ...Object.entries(formData.impactosSeleccionados).filter(([, v]) => v).map(([key]) => {
                const [aspecto, impacto] = key.split('|||');
                const controls = Object.entries(formData.controlesAmbientales).filter(([k, v]) => v && k.startsWith(`${impacto}|||`)).map(([k]) => k.split('|||')[1]);
                return { Categoria: 'Ambiental', Riesgo: aspecto, Descripcion: impacto, Metodos_Control: controls.join(', ') };
            })
        ];
        const wsRiesgos = XLSX.utils.json_to_sheet(riesgosControles);
        XLSX.utils.book_append_sheet(wb, wsRiesgos, "Riesgos_y_Controles");

        const ejecutoresData = formData.ejecutores.map(ej => ({
            Nombre: ej.nombre,
            Cedula: ej.cedula,
            Cargo: ej.cargo,
            Firma_Documentada: ej.firma ? 'Sí' : 'No'
        }));
        const wsEjecutores = XLSX.utils.json_to_sheet(ejecutoresData);
        XLSX.utils.book_append_sheet(wb, wsEjecutores, "Ejecutores");

        XLSX.writeFile(wb, `ATS_${formData.fecha || 'SinFecha'}.xlsx`);
    };

    // ──────────────────────────────────────────────
    // Vista final Print / PDF
    // ──────────────────────────────────────────────

    if (showJSON) {
        return (
            <div className="min-h-screen bg-slate-50 text-black p-4 md:p-8 font-sans text-sm">

                {/* Botones de acción (No visibles en PDF) */}
                <div className="flex flex-wrap justify-end gap-4 mb-4">
                    <button onClick={handleExportExcel}
                        className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold shadow-sm hover:bg-green-700 transition-colors flex items-center gap-2">
                        <FileText className="w-5 h-5" /> Excel Editable
                    </button>
                    <button onClick={handleExportPDF}
                        className="px-6 py-3 bg-ises-dark text-white rounded-xl font-bold shadow-sm hover:bg-slate-800 transition-colors flex items-center gap-2">
                        <FileText className="w-5 h-5" /> Descargar PDF
                    </button>
                    <button onClick={() => { setShowJSON(false); setCurrentStep(1); }}
                        className="px-6 py-3 bg-ises-blue text-white rounded-xl font-bold shadow-sm hover:bg-ises-blue-dark transition-colors flex items-center gap-2">
                        <RotateCcw className="w-5 h-5" /> Nuevo Registro
                    </button>
                </div>

                {/* Contenedor principal para renderizar en PDF (Una Sola Página MÁX) */}
                {/* Agregamos una escala ligeramente menor y un padding ajustado para que quepa bien en A4 */}
                <div id="ats-print-view" className="bg-white p-6 md:p-8 shadow-sm border border-slate-200 mx-auto max-w-[800px] text-[10px] leading-tight flex flex-col gap-4">

                    {/* Encabezado del Informe */}
                    <div className="border-b-2 border-ises-green pb-2 flex justify-between items-end gap-4">
                        <div>
                            <h1 className="text-xl font-black text-ises-dark uppercase tracking-tight m-0">Análisis de Trabajo Seguro</h1>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[8px] mt-0.5">Inspección de Seguridad y Medio Ambiente</p>
                        </div>
                        <div className="text-right bg-slate-50 py-1.5 px-3 rounded border border-slate-200">
                            <p className="font-bold flex items-center gap-1.5 justify-end text-ises-dark text-xs"><Clock className="w-3 h-3 text-ises-green" /> {formData.fecha || 'N/DA'}</p>
                            <p className="text-[8px] text-slate-500 mt-0.5 font-semibold uppercase">Inicio: {formData.horaInicio || '--:--'} | Fin: {formData.horaFin || '--:--'}</p>
                        </div>
                    </div>

                    {/* Grid 1: Info y EPP */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Información General */}
                        <div className="border border-slate-300 rounded overflow-hidden">
                            <h2 className="text-[9px] font-black bg-slate-100 px-2 py-1.5 border-b border-slate-300 uppercase tracking-widest text-ises-dark m-0">1. Info General</h2>
                            <div className="p-2 space-y-2">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Proyecto</p>
                                    <p className="font-extrabold text-ises-dark">{formData.proyecto || 'N/A'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-2">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Departamento</p>
                                        <p className="font-bold text-ises-dark">{formData.departamento || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Municipio</p>
                                        <p className="font-bold text-ises-dark">{formData.municipio || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="border-t border-slate-100 pt-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Ubicación Exacta</p>
                                    <p className="font-extrabold uppercase text-ises-blue">{formData.lugarTrabajo || 'No especificada'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-1.5">
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider m-0">Permisos: <span className={`ml-1 ${formData.permisos ? 'text-ises-green' : 'text-slate-600'}`}>{formData.permisos ? 'REQUERIDO' : 'NO APLICA'}</span></p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider m-0">Bloqueo: <span className={`ml-1 ${formData.consignacion ? 'text-amber-600' : 'text-slate-600'}`}>{formData.consignacion ? 'ACTIVO' : 'NO APLICA'}</span></p>
                                    {formData.permisos && formData.permisosDetalle && (
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider m-0 col-span-2">¿Cuáles?: <span className="ml-1 text-ises-dark normal-case">{formData.permisosDetalle}</span></p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Verificación EPP y Avatar */}
                        <div className="border border-slate-300 rounded overflow-hidden flex">
                            <div className="flex-1 p-0 flex flex-col">
                                <h2 className="text-[9px] font-black bg-slate-100 px-2 py-1.5 border-b border-slate-300 uppercase tracking-widest text-ises-dark m-0">2. EPP</h2>
                                <div className="p-2 flex-1">
                                    <ul className="text-[9px] space-y-1">
                                        {Object.entries(formData.epp).map(([key, val]) => {
                                            const st = val?.estado;
                                            return (
                                                <li key={key} className="flex justify-between items-center border-b border-slate-100 pb-0.5 last:border-0 last:pb-0">
                                                    <span className="font-bold text-slate-600 shrink-0 pr-1">{EPP_LABELS[key] || key}</span>
                                                    {st === 'ok' ? <span className="text-ises-green-dark font-black uppercase">Conforme</span> :
                                                        st === 'novedad' ? <span className="text-amber-700 font-bold text-[8px] text-right ml-2 leading-tight break-words" title={val.novedad}>NOV: {val.novedad}</span> :
                                                            st === 'na' ? <span className="text-slate-400 font-bold">N/A</span> : <span className="text-red-500 font-black">PNDT</span>}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </div>
                            {/* Mini Avatar renderizado directamente */}
                            <div className="w-24 bg-slate-50 border-l border-slate-200 p-2 flex flex-col items-center justify-center shrink-0">
                                <div className="relative w-[3.5rem] h-[5rem] bg-white rounded border border-slate-200 shrink-0">
                                    {/* Base Body Silhouette */}
                                    <div className="absolute inset-x-1 top-2 bottom-1 bg-slate-200 rounded opacity-50"></div>
                                    {/* EPP Points */}
                                    {[
                                        { id: 'casco', top: '10%', left: '50%' },
                                        { id: 'gafas', top: '22%', left: '30%' },
                                        { id: 'auditiva', top: '22%', left: '70%' },
                                        { id: 'respiratoria', top: '32%', left: '50%' },
                                        { id: 'ropa', top: '48%', left: '50%' },
                                        { id: 'arnes', top: '48%', left: '75%' },
                                        { id: 'guantes', top: '65%', left: '20%' },
                                        { id: 'botas', top: '88%', left: '60%' },
                                    ].map(punto => {
                                        const st = formData.epp[punto.id]?.estado;
                                        let cls = 'bg-white border-slate-300';
                                        if (st === 'ok') cls = 'bg-ises-green border-ises-green-dark';
                                        else if (st === 'novedad') cls = 'bg-amber-500 border-amber-600';
                                        else if (st === 'na') cls = 'bg-slate-300 border-slate-400';

                                        return (
                                            <div key={punto.id} className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-[0.5px] ${cls}`}
                                                style={{ top: punto.top, left: punto.left }} />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Documentos Básicos */}
                    <div className="border border-slate-300 rounded overflow-hidden">
                        <h2 className="text-[9px] font-black bg-slate-100 px-2 py-1.5 border-b border-slate-300 uppercase tracking-widest text-ises-dark m-0">3. Aspectos Documentales y Procedimentales</h2>
                        <div className="p-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
                            {DOCUMENTOS_BASICOS.map((doc, i) => {
                                const val = formData.documentosBasicos[doc.text];
                                return (
                                    <div key={i} className="flex justify-between items-start border-b border-slate-100 pb-1">
                                        <span className="text-[9px] text-slate-600 font-medium pr-2 leading-tight">{doc.text}</span>
                                        <span className={`shrink-0 text-[8px] font-black px-1.5 py-0.5 rounded
                                        ${val === 'C' ? 'text-ises-green-dark' : val === 'NC' ? 'text-red-600' : val === 'NA' ? 'text-slate-500' : 'text-slate-300'}`}>
                                            {val === 'C' ? 'CUMPLE' : val === 'NC' ? 'NO CUMPLE' : val === 'NA' ? 'NO APLICA' : 'S/R'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Riesgos y Controles */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="border border-slate-300 rounded overflow-hidden">
                            <h2 className="text-[9px] font-black bg-slate-100 px-2 py-1.5 border-b border-slate-300 uppercase tracking-widest text-ises-dark m-0">4. Riesgos Identificados</h2>
                            <div className="p-2 space-y-2">
                                {formData.riesgos.length > 0 ? (
                                    RIESGOS_BENTO.filter(b => b.items.some(i => formData.riesgos.includes(i))).map(bloque => {
                                        const bData = formData.riesgosControles[bloque.id] || {};
                                        return (
                                            <div key={bloque.id} className="border-b border-slate-100 pb-1.5 last:border-0">
                                                <p className="text-[9px] font-black text-ises-dark">{bloque.titulo}</p>
                                                <ul className="list-disc pl-3 text-[8px] text-slate-600 font-bold space-y-0.5 marker:text-amber-500">
                                                    {bloque.items.filter(i => formData.riesgos.includes(i)).map((r, i) => <li key={i}>{r}</li>)}
                                                </ul>
                                                {bData.descripcion && <p className="text-[8px] text-slate-500 mt-0.5 italic">{bData.descripcion}</p>}
                                                {bData.metodosControl?.length > 0 && (
                                                    <p className="text-[8px] font-bold text-ises-blue mt-0.5">Control: {bData.metodosControl.join(', ')}</p>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-[9px] text-slate-400 italic font-medium">No se seleccionaron riesgos.</p>
                                )}
                                {formData.observaciones && (
                                    <div className="pt-1 border-t border-slate-100">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Observaciones:</p>
                                        <p className="text-[9px] text-slate-600 font-medium mt-0.5">{formData.observaciones}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border border-slate-300 rounded overflow-hidden">
                            <h2 className="text-[9px] font-black bg-slate-100 px-2 py-1.5 border-b border-slate-300 uppercase tracking-widest text-ises-dark m-0">5. Controles Ambientales</h2>
                            <div className="p-2 space-y-1.5">
                                {Object.values(formData.impactosSeleccionados).some(Boolean) ? (
                                    Object.entries(formData.impactosSeleccionados).filter(([, v]) => v).map(([key]) => {
                                        const [aspecto, impacto] = key.split('|||');
                                        const activeControls = Object.entries(formData.controlesAmbientales)
                                            .filter(([k, v]) => v && k.startsWith(`${impacto}|||`))
                                            .map(([k]) => k.split('|||')[1]);
                                        return (
                                            <div key={key} className="border-b border-slate-100 pb-1 last:border-0">
                                                <p className="text-[8px] font-black text-ises-dark">{aspecto}</p>
                                                <p className="text-[8px] text-slate-500 font-bold">Impacto: {impacto}</p>
                                                {activeControls.length > 0 && (
                                                    <ul className="list-disc pl-3 text-[8px] font-bold text-ises-green-dark marker:text-ises-green space-y-0.5 mt-0.5">
                                                        {activeControls.map((c, i) => <li key={i}>{c}</li>)}
                                                    </ul>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-[9px] text-slate-400 italic font-medium">Sin controles ambientales activos.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Firmas */}
                    <div className="border border-slate-300 rounded overflow-hidden mt-auto">
                        <h2 className="text-[9px] font-black bg-slate-100 px-2 py-1.5 border-b border-slate-300 uppercase tracking-widest text-ises-dark flex justify-between m-0">
                            <span>6. Firmas del Equipo Autorizado</span>
                            {formData.aceptacionTerminos && <span>(DECLARACIÓN ACEPTADA)</span>}
                        </h2>
                        <div className="p-2 grid grid-cols-3 gap-3">
                            {formData.ejecutores.map((ej, i) => (
                                <div key={i} className="border border-slate-200 rounded bg-slate-50 p-2 text-center flex flex-col items-center">
                                    {/* Zona de Firma */}
                                    <div className="w-full h-12 mb-1 bg-white border border-slate-200 rounded flex items-center justify-center overflow-hidden">
                                        {ej.firma ? (
                                            <img src={ej.firma} alt={`Firma ${ej.nombre}`} className="h-full object-contain pointer-events-none" />
                                        ) : (
                                            <span className="text-[7px] uppercase font-bold text-slate-300 tracking-widest">Sin Firma</span>
                                        )}
                                    </div>
                                    <p className="font-extrabold text-[10px] uppercase text-ises-dark truncate w-full">{ej.nombre || 'No Ingresado'}</p>
                                    <p className="text-[8px] font-medium text-slate-500 m-0">CC: {ej.cedula || '---'}</p>
                                    <p className="text-[8px] font-black uppercase text-ises-blue m-0">{ej.cargo || '---'}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pie de página */}
                    <div className="text-center mt-2 pt-2 border-t border-slate-200">
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest m-0">SISTEMA INTEGRADO ISES S.A.S</p>
                    </div>
                </div>{/* Fin ats-print-view */}
            </div>
        );
    }

    // ──────────────────────────────────────────────
    // Renderizado principal
    // ──────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-ises-gray font-sans flex flex-col items-center">
            <div className="w-full max-w-lg bg-white min-h-screen relative pb-28 shadow-xl">

                {/* ── Header ── */}
                <header className="bg-gradient-to-r from-ises-green to-ises-green-dark text-white p-4 sticky top-0 z-30 shadow-md">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {currentStep > 1 && (
                                <button onClick={prevStep}
                                    className="p-2 -ml-2 rounded-full hover:bg-white/20 transition-colors"
                                    aria-label="Paso anterior">
                                    <ChevronRight className="w-6 h-6 rotate-180" />
                                </button>
                            )}
                            <div>
                                <h1 className="text-xl font-extrabold tracking-tight">ATS ForMap</h1>
                                <p className="text-white/80 text-xs font-semibold">Análisis de Trabajo Seguro</p>
                            </div>
                        </div>
                        <div className="bg-white/20 border border-white/30 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                            Paso {currentStep} / {totalSteps}
                        </div>
                    </div>
                    <div className="mt-4 bg-white/30 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-white h-full transition-all duration-500 ease-out"
                            style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
                    </div>
                </header>

                <main className="p-4 space-y-6 mt-2">

                    {/* ════════════════════════════════════ */}
                    {/* PASO 1: Datos de Actividad           */}
                    {/* ════════════════════════════════════ */}
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Tiempo */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-5">
                                <h2 className="text-lg font-bold text-ises-dark border-b border-slate-100 pb-3 flex items-center gap-2">
                                    <div className="p-2 bg-ises-green/10 rounded-lg"><Clock className="w-5 h-5 text-ises-green" /></div>
                                    Datos de la Actividad
                                </h2>
                                <div className="flex flex-col gap-2">
                                    <label className="font-bold text-ises-dark text-sm">Proyecto</label>
                                    <input type="text" placeholder="Ej. MLU AIR-E, Expansión Zona Norte..." value={formData.proyecto}
                                        onChange={e => handleInputChange('proyecto', e.target.value)}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-ises-green focus:border-ises-green min-h-[3.5rem] font-bold text-ises-dark" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="font-bold text-ises-dark text-sm">Fecha de realización</label>
                                    <input type="date" value={formData.fecha}
                                        onChange={e => handleInputChange('fecha', e.target.value)}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-ises-green focus:border-ises-green min-h-[3.5rem]" />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex flex-col gap-2 flex-1">
                                        <label className="font-bold text-ises-dark text-sm">Hora Inicio</label>
                                        <input type="time" value={formData.horaInicio}
                                            onChange={e => handleInputChange('horaInicio', e.target.value)}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-ises-green min-h-[3.5rem]" />
                                    </div>
                                    <div className="flex flex-col gap-2 flex-1">
                                        <label className="font-bold text-ises-dark text-sm">Hora Fin (Aprox.)</label>
                                        <input type="time" value={formData.horaFin}
                                            onChange={e => handleInputChange('horaFin', e.target.value)}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-ises-green min-h-[3.5rem]" />
                                    </div>
                                </div>
                            </div>

                            {/* Ubicación */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-5 relative">
                                <h2 className="text-lg font-bold text-ises-dark border-b border-slate-100 pb-3 flex items-center gap-2">
                                    <div className="p-2 bg-ises-blue/10 rounded-lg"><MapPin className="w-5 h-5 text-ises-blue" /></div>
                                    Ubicación
                                </h2>
                                <div className="flex gap-4">
                                    <div className="flex-1 flex flex-col gap-2">
                                        <label className="font-bold text-ises-dark text-sm">Departamento</label>
                                        <div className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl min-h-[3.5rem] font-bold text-ises-dark flex items-center text-sm">
                                            Atlántico
                                        </div>
                                    </div>
                                    <div className="flex-1 flex flex-col gap-2 relative">
                                        <label className="font-bold text-ises-dark text-sm">Municipio</label>
                                        <input type="text" placeholder="Ej. Barranquilla" value={formData.municipio}
                                            onChange={e => handleLocationInput('municipio', e.target.value)}
                                            onFocus={() => { if (formData.municipio.length >= 3) setShowMunList(true); }}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-ises-blue min-h-[3.5rem] font-bold text-ises-dark" />

                                        {/* Dropdown de sugerencias Municipio */}
                                        {showMunList && munSuggestions.length > 0 && (
                                            <div className="absolute top-[80px] left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-48 overflow-auto">
                                                {munSuggestions.map(s => (
                                                    <button key={s} type="button" onClick={() => selectLocation('municipio', s)}
                                                        className="w-full text-left px-4 py-3 hover:bg-slate-50 font-bold border-b border-slate-100 last:border-0 text-ises-dark">
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <label className="font-bold text-ises-dark text-sm">Zona de Trabajo (Lugar Exacto)</label>
                                    <div className="flex gap-3">
                                        <button onClick={() => handleInputChange('lugarTrabajo', 'Zona Sur')}
                                            className={`flex-1 py-4 font-extrabold text-sm rounded-xl border-2 transition-all duration-300
                                            ${formData.lugarTrabajo === 'Zona Sur' ? 'border-amber-500 bg-amber-500/10 text-amber-600 shadow-[0_4px_12px_rgba(245,158,11,0.2)] scale-[1.02]' : 'border-slate-200 text-slate-500 hover:border-amber-300 hover:bg-slate-50'}`}>
                                            SUR
                                        </button>
                                        <button onClick={() => handleInputChange('lugarTrabajo', 'Zona Centro')}
                                            className={`flex-1 py-4 font-extrabold text-sm rounded-xl border-2 transition-all duration-300
                                            ${formData.lugarTrabajo === 'Zona Centro' ? 'border-ises-blue bg-ises-blue/10 text-ises-blue-dark shadow-[0_4px_12px_rgba(0,114,206,0.2)] scale-[1.02]' : 'border-slate-200 text-slate-500 hover:border-ises-blue/50 hover:bg-slate-50'}`}>
                                            CENTRO
                                        </button>
                                        <button onClick={() => handleInputChange('lugarTrabajo', 'Zona Norte')}
                                            className={`flex-1 py-4 font-extrabold text-sm rounded-xl border-2 transition-all duration-300
                                            ${formData.lugarTrabajo === 'Zona Norte' ? 'border-ises-green bg-ises-green/10 text-ises-green-dark shadow-[0_4px_12px_rgba(153,204,51,0.2)] scale-[1.02]' : 'border-slate-200 text-slate-500 hover:border-ises-green/50 hover:bg-slate-50'}`}>
                                            NORTE
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Requisitos */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                                <h2 className="text-lg font-bold text-ises-dark border-b border-slate-100 pb-3 flex items-center gap-2">
                                    <div className="p-2 bg-ises-green/10 rounded-lg"><ClipboardCheck className="w-5 h-5 text-ises-green" /></div>
                                    Requisitos Operativos
                                </h2>
                                <TouchToggle icon={FileText} label="¿Se dispone de Consignación / Descargo / Órdenes de trabajo?"
                                    value={formData.consignacion} onChange={v => handleInputChange('consignacion', v)} />
                                <TouchToggle icon={AlertTriangle} label="¿La tarea requiere permiso de trabajo o listas de chequeo?"
                                    value={formData.permisos} onChange={v => handleInputChange('permisos', v)} />
                                {formData.permisos === true && (
                                    <div className="flex flex-col gap-2">
                                        <label className="font-semibold text-ises-dark flex items-center gap-2 text-sm">
                                            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                            ¿Cuáles permisos / listas de chequeo?
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ej. Permiso de trabajo en alturas, lista TSA..."
                                            value={formData.permisosDetalle}
                                            onChange={e => handleInputChange('permisosDetalle', e.target.value)}
                                            className="w-full p-4 bg-amber-50 border border-amber-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 font-bold text-ises-dark text-sm min-h-[3.5rem]"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ════════════════════════════════════ */}
                    {/* PASO 2: EPP + Documentos Básicos     */}
                    {/* ════════════════════════════════════ */}
                    {currentStep === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* Aviso semáforo */}
                            <div className="bg-ises-blue/10 border-l-4 border-ises-blue p-4 rounded-r-2xl">
                                <div className="flex gap-3">
                                    <ShieldAlert className="w-6 h-6 text-ises-blue flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="text-sm font-bold text-ises-blue mb-1">Semáforo de Seguridad (Kill-Switch)</h3>
                                        <p className="text-sm text-ises-dark/80 font-semibold">
                                            Los EPP inician aprobados por defecto. Solo debes reportar si hay alguna irregularidad. <strong>Todos los documentos básicos deben estar respondidos para avanzar.</strong>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* EPP Interactivo (Avatar) */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                                <h2 className="text-lg font-bold text-ises-dark border-b border-slate-100 pb-3 flex items-center gap-2">
                                    <div className="p-2 bg-ises-green/10 rounded-lg"><HardHat className="w-5 h-5 text-ises-green" /></div>
                                    Verificación de EPP
                                </h2>
                                <p className="text-xs text-slate-500 font-medium text-center">Los EPP están aprobados por defecto. <strong>Toca un ícono en el trabajador únicamente para reportar una anomalía.</strong></p>

                                <div className="relative w-full max-w-[280px] mx-auto aspect-[3/4] bg-slate-50/50 rounded-2xl border-2 border-slate-100 shadow-inner flex items-center justify-center overflow-hidden">
                                    {/* Avatar Base — Figura de palito */}
                                    <div className="absolute inset-2 flex items-center justify-center pointer-events-none">
                                        <svg viewBox="0 0 200 400" className="w-full h-full text-slate-300 drop-shadow-sm">
                                            {/* Cabeza */}
                                            <circle cx="100" cy="55" r="30" fill="none" stroke="currentColor" strokeWidth="8" />
                                            {/* Cuerpo */}
                                            <line x1="100" y1="85" x2="100" y2="210" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                                            {/* Brazo izquierdo */}
                                            <line x1="100" y1="120" x2="45" y2="175" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                                            {/* Brazo derecho */}
                                            <line x1="100" y1="120" x2="155" y2="175" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                                            {/* Pierna izquierda */}
                                            <line x1="100" y1="210" x2="60" y2="320" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                                            {/* Pierna derecha */}
                                            <line x1="100" y1="210" x2="140" y2="320" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                                        </svg>
                                    </div>

                                    {/* Puntos Interactivos */}
                                    {[
                                        { id: 'casco', top: '6%', left: '50%', label: 'Casco barbuquejo', icon: HardHat },
                                        { id: 'gafas', top: '15%', left: '31%', label: 'P. Visual', icon: Glasses },
                                        { id: 'auditiva', top: '15%', left: '69%', label: 'P. Auditiva', icon: Ear },
                                        { id: 'respiratoria', top: '22%', left: '50%', label: 'Respiratoria', icon: Wind },
                                        { id: 'ropa', top: '36%', left: '50%', label: 'Ropa', icon: Shirt },
                                        { id: 'mangas', top: '38%', left: '34%', label: 'Mangas diélecc.', icon: Shield },
                                        { id: 'arnes', top: '38%', left: '66%', label: 'ECC', icon: ShieldAlert },
                                        { id: 'guantes', top: '48%', left: '22%', label: 'Guantes', icon: Hand },
                                        { id: 'botas', top: '76%', left: '65%', label: 'Botas', icon: Footprints },
                                    ].map(punto => {
                                        const eppData = formData.epp[punto.id];
                                        const activo = eppData?.estado === 'ok';
                                        const isNovedad = eppData?.estado === 'novedad';
                                        const isNa = eppData?.estado === 'na';
                                        const IconComponent = punto.icon;

                                        let bgClass = 'bg-white border-slate-300 text-slate-400 hover:border-slate-400 hover:text-slate-600 scale-100';
                                        if (activo) bgClass = 'bg-ises-green border-white text-white scale-110 shadow-[0_0_15px_rgba(153,204,51,0.6)]';
                                        else if (isNovedad) bgClass = 'bg-amber-400 border-white text-white scale-110 shadow-[0_0_15px_rgba(251,191,36,0.6)]';
                                        else if (isNa) bgClass = 'bg-slate-400 border-white text-white scale-100 opacity-90';

                                        return (
                                            <button key={punto.id} type="button" onClick={() => handleEppClick(punto.id)}
                                                className={`absolute flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 
                                                    w-12 h-12 rounded-full cursor-pointer transition-all duration-300 group`}
                                                style={{ top: punto.top, left: punto.left }}
                                                aria-label={`Confirmar ${punto.label}`}>

                                                <div className={`w-9 h-9 flex items-center justify-center rounded-full border-2 shadow-sm transition-all duration-300 relative z-10 ${bgClass}`}>
                                                    <IconComponent className="w-4 h-4" />
                                                </div>

                                                {(!eppData || !eppData.estado) && <div className="absolute inset-0 bg-orange-400 rounded-full animate-ping opacity-25" />}

                                                <div className={`absolute whitespace-nowrap top-full mt-1 left-1/2 -translate-x-1/2 
                                                    bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg 
                                                    z-20 pointer-events-none transition-all duration-200
                                                    ${activo || isNovedad || isNa ? 'opacity-0 scale-95' : 'opacity-0 group-hover:opacity-100 scale-100'}`}>
                                                    {punto.label}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Status Bar EPP */}
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-slate-500">Progreso Verificación EPP</span>
                                        <span className="text-xs font-extrabold" style={{ color: '#7aa329' }}>
                                            {Object.values(formData.epp).filter(v => v !== null).length} / 9
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full overflow-hidden" style={{ height: '10px' }}>
                                        <div
                                            className="rounded-full transition-all duration-500 ease-out"
                                            style={{
                                                height: '10px',
                                                width: `${(Object.values(formData.epp).filter(v => v !== null).length / 9) * 100}%`,
                                                backgroundColor: '#99CC33'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Documentos Básicos - Carrusel */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                                <h2 className="text-lg font-bold text-ises-dark border-b border-slate-100 pb-3 flex items-center gap-2">
                                    <div className="p-2 bg-ises-blue/10 rounded-lg"><BookOpen className="w-5 h-5 text-ises-blue" /></div>
                                    Documentos Básicos de los Trabajadores
                                </h2>
                                <FlashcardCarousel />
                            </div>

                            {/* Estado semáforo */}
                            <div className={`p-4 rounded-2xl flex items-start gap-3 transition-all duration-300
                                ${isStep2Valid() ? 'bg-ises-green/10 border border-ises-green/30' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                                {isStep2Valid() ? (
                                    <>
                                        <CheckCircle2 className="w-5 h-5 text-ises-green flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-extrabold text-sm text-ises-green-dark">Condiciones Seguras</p>
                                            <p className="text-xs mt-1 text-ises-dark/70 font-bold">Puedes continuar al siguiente paso.</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-sm">Avance Bloqueado</p>
                                            <p className="text-xs mt-1 text-red-700/80">Las novedades de EPP reportadas deben estar descritas y los documentos básicos deben tener respuesta.</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Modal de Novedad */}
                            {novedadModal.isOpen && (
                                <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm">
                                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-5 animate-in zoom-in-95">
                                        <h3 className="font-black text-xl text-ises-dark flex items-center gap-2">
                                            <AlertTriangle className="w-6 h-6 text-amber-500" />
                                            Reportar Novedad
                                        </h3>
                                        <p className="text-sm font-semibold text-slate-500">¿Qué sucedió con el elemento: <span className="uppercase text-amber-600">{novedadModal.itemKey}</span>?</p>

                                        <div className="space-y-3">
                                            {['Equipo roto', 'Desgastado / Dañado', 'Incompleto', 'Falta dotación'].map(reason => (
                                                <button key={reason} onClick={() => confirmNovedad(reason)}
                                                    className="w-full text-left px-5 py-4 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-2xl font-bold text-ises-dark transition-all">
                                                    {reason}
                                                </button>
                                            ))}
                                            <div className="relative pt-2 border-t border-slate-100 mt-2">
                                                <input type="text" placeholder="Otra novedad (especificar)..."
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter' && e.target.value.trim()) {
                                                            confirmNovedad(e.target.value.trim());
                                                        }
                                                    }}
                                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-400 font-bold text-sm" />
                                                <p className="text-xs text-slate-400 mt-2 font-medium">Presiona ENTER para guardar la novedad personalizada.</p>
                                            </div>
                                        </div>

                                        <button onClick={() => {
                                            handleEppChange(novedadModal.itemKey, { estado: 'ok', novedad: '' });
                                            setNovedadModal({ isOpen: false, itemKey: null });
                                        }}
                                            className="w-full py-4 text-slate-400 font-bold uppercase tracking-wider text-xs hover:text-slate-600 transition-colors">
                                            Cancelar (Marcar Ok)
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ════════════════════════════════════ */}
                    {/* PASO 3: Matriz de Peligros          */}
                    {/* ════════════════════════════════════ */}
                    {currentStep === 3 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            <div className="bg-ises-blue/10 border-l-4 border-ises-blue p-4 rounded-r-2xl">
                                <div className="flex gap-3">
                                    <AlertTriangle className="w-5 h-5 text-ises-blue flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-ises-dark font-extrabold">Identificación de Peligros</p>
                                        <p className="text-xs text-slate-600 font-medium mt-0.5">Toca cada "píldora" para reportar los riesgos presentes en el entorno. Activa todos los que apliquen.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {RIESGOS_BENTO.map(bloque => (
                                    <BentoBoxCategory key={bloque.id} bloque={bloque} />
                                ))}
                            </div>

                            <div className="flex justify-center pt-2">
                                <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-ises-green animate-pulse" />
                                    <span className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">
                                        Total Detectados: <span className="text-ises-dark">{formData.riesgos.length}</span>
                                    </span>
                                </div>
                            </div>

                            {/* Observaciones */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-3">
                                <h2 className="text-base font-bold text-ises-dark flex items-center gap-2">
                                    <div className="p-2 bg-slate-100 rounded-lg"><FileText className="w-4 h-4 text-slate-500" /></div>
                                    Observaciones
                                </h2>
                                <textarea
                                    rows={3}
                                    placeholder="Anotaciones adicionales sobre los riesgos identificados o condiciones del entorno..."
                                    value={formData.observaciones}
                                    onChange={e => handleInputChange('observaciones', e.target.value)}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-ises-blue focus:border-ises-blue font-medium text-ises-dark text-sm resize-none"
                                />
                            </div>

                        </div>
                    )}

                    {/* ════════════════════════════════════ */}
                    {/* PASO 4: Aspectos e Impactos Amb.    */}
                    {/* ════════════════════════════════════ */}
                    {currentStep === 4 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            <div className="bg-ises-green/10 border-l-4 border-ises-green p-4 rounded-r-2xl shadow-sm">
                                <div className="flex gap-3">
                                    <div className="p-1.5 bg-ises-green/20 rounded-lg h-fit mt-0.5 border border-ises-green/30">
                                        <Leaf className="w-5 h-5 text-ises-green-dark flex-shrink-0" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-ises-dark font-extrabold uppercase tracking-wide">Gestión Ambiental</p>
                                        <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                                            Despliega los aspectos relevantes presionando cada tarjeta. Se revelarán los impactos y controles asociados a la labor. Selecciona las píldoras de control que aplicarás.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {MATRIZ_AMBIENTAL.map(({ aspecto, impactos }) => (
                                    <AccordionImpactCategory
                                        key={aspecto}
                                        aspecto={aspecto}
                                        impactos={impactos}
                                        isOpen={expandedAspect === aspecto}
                                        onToggle={() => setExpandedAspect(expandedAspect === aspecto ? null : aspecto)}
                                    />
                                ))}
                            </div>

                            <div className="flex justify-center pt-4">
                                <div className="bg-white px-5 py-2.5 rounded-full border border-slate-200 shadow-sm flex items-center gap-3">
                                    <Leaf className={`w-4 h-4 transition-colors ${Object.values(formData.controlesAmbientales).some(Boolean) ? 'text-ises-green' : 'text-slate-300'}`} />
                                    <span className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">
                                        Controles Activos: <span className="text-ises-dark text-sm ml-1">
                                            {Object.values(formData.controlesAmbientales).filter(Boolean).length}
                                        </span>
                                    </span>
                                </div>
                            </div>

                        </div>
                    )}

                    {/* ════════════════════════════════════ */}
                    {/* PASO 5: Ejecutores + Carnet Digital  */}
                    {/* ════════════════════════════════════ */}
                    {currentStep === 5 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* Declaración Global */}
                            <div
                                className={`bg-white p-5 rounded-2xl border-2 transition-all cursor-pointer shadow-sm relative overflow-hidden group
                                    ${formData.aceptacionTerminos ? 'border-ises-green bg-ises-green/5' : 'border-slate-200 hover:border-ises-blue/30 hover:bg-slate-50'}`}
                                onClick={() => handleInputChange('aceptacionTerminos', !formData.aceptacionTerminos)}
                                role="checkbox" aria-checked={formData.aceptacionTerminos} tabIndex={0}>

                                {formData.aceptacionTerminos ? (
                                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-ises-green/10 rounded-full blur-2xl pointer-events-none" />
                                ) : null}

                                <div className="flex gap-4 items-start relative z-10">
                                    <div className={`min-w-[1.5rem] h-6 rounded-md border-2 flex items-center justify-center mt-0.5 transition-all duration-300
                                        ${formData.aceptacionTerminos ? 'bg-ises-green border-ises-green text-white scale-110 shadow-[0_0_10px_rgba(153,204,51,0.4)]' : 'border-slate-300 bg-white group-hover:border-ises-blue'}`}>
                                        {formData.aceptacionTerminos ? <span><Check className="w-4 h-4" strokeWidth={3} /></span> : null}
                                    </div>
                                    <div>
                                        <p className="text-sm font-extrabold text-ises-dark flex items-center gap-2">
                                            DECLARACIÓN DE ACEPTACIÓN
                                            {formData.aceptacionTerminos ? <span><span className="text-[10px] bg-ises-green text-white px-2 py-0.5 rounded-full">ACEPTADO</span></span> : null}
                                        </p>
                                        <p className="text-xs text-ises-dark/70 leading-relaxed mt-1 font-bold">
                                            Los abajo firmantes somos conscientes de la necesidad de trabajar con seguridad. Aceptamos las normas del proyecto, certificamos que no estamos bajo el efecto de alcohol o sustancias psicoactivas y que el lugar ha sido inspeccionado.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Equipo de Trabajo - Carnets Digitales */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between pb-2">
                                    <div>
                                        <h2 className="text-lg font-black text-ises-dark flex items-center gap-2">
                                            <div className="p-1.5 bg-ises-blue/10 rounded-lg"><Users className="w-5 h-5 text-ises-blue" /></div>
                                            Equipo Técnico ({formData.ejecutores.length})
                                        </h2>
                                        <p className="text-xs font-bold text-slate-500 mt-1">Completa los datos y firma cada credencial para autorizar el trabajo.</p>
                                    </div>

                                </div>

                                <div className="space-y-6">
                                    {formData.ejecutores.map((ej, idx) => {
                                        const isComplete = ej.nombre && ej.cedula && ej.cargo && ej.firma;

                                        return (
                                            <div key={ej.id} className={`bg-white rounded-3xl border-2 shadow-sm overflow-hidden transition-all duration-300 relative
                                                ${isComplete ? 'border-ises-green ring-1 ring-ises-green/20' : 'border-slate-200'}`}>

                                                {/* Encabezado del Carnet (Lanyard area) */}
                                                <div className={`h-12 w-full flex items-center justify-between px-5
                                                    ${isComplete ? 'bg-gradient-to-r from-ises-green to-ises-green-dark' : 'bg-gradient-to-r from-slate-700 to-slate-900'}`}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-white/50" />
                                                        <span className="text-xs font-extrabold text-white tracking-widest uppercase">
                                                            {isComplete ? 'AUTORIZADO' : 'CREDENCIAL TÉCNICA'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-bold text-white/70">ID: {String(idx + 1).padStart(3, '0')}</span>
                                                        {formData.ejecutores.length > 1 && (
                                                            <button onClick={() => removeEjecutor(ej.id)}
                                                                className="text-white/50 hover:text-red-400 transition-colors p-1"
                                                                title="Eliminar ejecutor">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Cuerpo del Carnet */}
                                                <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 items-start relative">

                                                    {/* Marca de Agua ISES (Visual) */}
                                                    <div className="absolute bottom-4 right-4 text-slate-100 opacity-50 pointer-events-none transform -rotate-12 scale-150">
                                                        <Shield className="w-32 h-32" />
                                                    </div>

                                                    {/* Avatar Columna */}
                                                    <div className="hidden sm:flex flex-col items-center justify-center gap-3 w-28 shrink-0 relative z-10">
                                                        <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center overflow-hidden bg-slate-50
                                                            ${isComplete ? 'border-ises-green' : 'border-slate-200'}`}>
                                                            {ej.nombre ? (
                                                                <span className="text-3xl font-black text-slate-300">
                                                                    {ej.nombre.charAt(0).toUpperCase()}
                                                                </span>
                                                            ) : (
                                                                <UserCheck className="w-10 h-10 text-slate-300" />
                                                            )}
                                                        </div>
                                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border
                                                            ${isComplete ? 'bg-ises-green/10 text-ises-green-dark border-ises-green/20' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                                                            {ej.cargo || 'SIN CARGO'}
                                                        </div>
                                                    </div>

                                                    {/* Campos de Datos */}
                                                    <div className="space-y-4 w-full relative z-10">

                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Nombre Completo</label>
                                                            <input type="text" placeholder="Ej. Juan Pérez" value={ej.nombre}
                                                                onChange={e => updateEjecutor(ej.id, 'nombre', e.target.value)}
                                                                className="w-full p-3 bg-slate-50/50 border-b-2 border-slate-200 focus:border-ises-blue outline-none transition-colors font-black text-lg text-ises-dark placeholder-slate-300 rounded-t-xl" />
                                                        </div>

                                                        <div className="flex gap-4">
                                                            <div className="space-y-1 flex-1">
                                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Documento Identidad</label>
                                                                <input type="number" placeholder="Ej. 1045..." value={ej.cedula}
                                                                    onChange={e => updateEjecutor(ej.id, 'cedula', e.target.value)}
                                                                    className="w-full p-3 bg-slate-50/50 border-b-2 border-slate-200 focus:border-ises-blue outline-none transition-colors font-bold text-sm text-ises-dark placeholder-slate-300 rounded-t-xl" />
                                                            </div>
                                                            <div className="space-y-1 flex-1 sm:hidden">
                                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Cargo</label>
                                                                <input type="text" placeholder="Ej. Liniero" value={ej.cargo}
                                                                    onChange={e => updateEjecutor(ej.id, 'cargo', e.target.value)}
                                                                    className="w-full p-3 bg-slate-50/50 border-b-2 border-slate-200 focus:border-ises-blue outline-none transition-colors font-bold text-sm text-ises-dark placeholder-slate-300 rounded-t-xl" />
                                                            </div>
                                                        </div>

                                                        {/* Campo cargo full width para Desktop */}
                                                        <div className="hidden sm:block space-y-1">
                                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Cargo Técnico</label>
                                                            <input type="text" placeholder="Designación en el proyecto" value={ej.cargo}
                                                                onChange={e => updateEjecutor(ej.id, 'cargo', e.target.value)}
                                                                className="w-full p-3 bg-slate-50/50 border-b-2 border-slate-200 focus:border-ises-blue outline-none transition-colors font-bold text-sm text-ises-dark placeholder-slate-300 rounded-t-xl" />
                                                        </div>

                                                        {/* Área de Firma Individual */}
                                                        <div className="pt-4 border-t border-slate-100 border-dashed">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                                                    <PenLine className="w-3 h-3" /> Firma Digital
                                                                </label>
                                                                {ej.firma && (
                                                                    <button onClick={() => clearSignature(ej.id)}
                                                                        className="text-xs font-bold text-ises-blue hover:text-red-500 transition-colors flex items-center gap-1">
                                                                        <RotateCcw className="w-3 h-3" /> Re-hacer
                                                                    </button>
                                                                )}
                                                            </div>

                                                            <div className={`rounded-xl overflow-hidden transition-all relative
                                                                ${ej.firma ? 'bg-white' : 'border-2 border-dashed border-slate-300 bg-slate-50'}`}>

                                                                {ej.firma ? (
                                                                    <div className="flex flex-col items-center justify-center py-2 h-[120px]">
                                                                        <img src={ej.firma} alt={`Firma de ${ej.nombre}`} className="h-full object-contain pointer-events-none" />
                                                                        <p className="text-[10px] font-bold text-ises-green uppercase tracking-widest mt-1">FIRMA GUARDADA</p>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                                                                            <span className="text-xl font-black text-slate-300 tracking-widest italic">FIRME AQUÍ</span>
                                                                        </div>

                                                                        <SignatureCanvas
                                                                            ref={(ref) => { signatureRefs.current[ej.id] = ref; }}
                                                                            penColor="#0f172a"
                                                                            canvasProps={{
                                                                                className: 'w-full',
                                                                                style: { height: '120px', touchAction: 'none' }
                                                                            }}
                                                                            onEnd={() => saveSignature(ej.id)}
                                                                        />

                                                                        {/* Línea base de firma */}
                                                                        <div className="absolute bottom-6 left-8 right-8 h-px bg-slate-200 pointer-events-none" />
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <button onClick={addEjecutor}
                                    className="w-full py-4 border-2 border-dashed border-slate-300 rounded-3xl text-slate-500 font-bold hover:border-ises-blue hover:text-ises-blue hover:bg-ises-blue/5 transition-all flex items-center justify-center gap-2">
                                    <Users className="w-5 h-5" /> Añadir otro Ejecutor
                                </button>

                            </div>
                        </div>
                    )}
                </main>

                {/* ── Barra de navegación inferior ── */}
                <div className="fixed sm:absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] z-40">
                    <div className="max-w-lg mx-auto">
                        {currentStep < totalSteps ? (
                            <button onClick={nextStep} disabled={!isCurrentStepValid()}
                                className={`w-full py-4 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-2 transition-all duration-300 min-h-[4rem]
                                    ${isCurrentStepValid()
                                        ? 'bg-gradient-to-r from-ises-green to-ises-green-dark text-white shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'}`}>
                                Siguiente Paso <ChevronRight className="w-6 h-6" />
                            </button>
                        ) : (
                            <button onClick={finalizar} disabled={!isCurrentStepValid()}
                                className={`w-full py-4 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-2 transition-all duration-300 min-h-[4rem]
                                    ${isCurrentStepValid()
                                        ? 'bg-gradient-to-r from-ises-blue to-ises-blue-dark text-white shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'}`}>
                                <Save className="w-6 h-6" /> Finalizar y Guardar ATS
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

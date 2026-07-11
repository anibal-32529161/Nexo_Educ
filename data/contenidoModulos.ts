export interface ConceptoClave {
  titulo: string;
  descripcion: string;
}

export interface PreguntaQuiz {
  id: number;
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: number; // índice 0-based de la opción correcta
  explicacion: string;
}

export interface Modulo {
  id: number;
  titulo: string;
  descripcionCorto: string;
  duracion: string;
  imagen: string;
  colorTheme: string;
  contenidoHtml: string;
  conceptosClave: ConceptoClave[];
  preguntas: PreguntaQuiz[];
}

export const contenidoModulos: Modulo[] = [
  {
    id: 1,
    titulo: "Introducción a Redes",
    descripcionCorto: "Aprende los fundamentos del diseño de redes, clasificaciones geográficas y las diferentes formas en que los dispositivos se interconectan.",
    duracion: "12 min",
    imagen: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=800&auto=format&fit=crop",
    colorTheme: "from-violet-500 to-indigo-500",
    conceptosClave: [
      {
        titulo: "Red de Computadoras",
        descripcion: "Conjunto de dispositivos interconectados entre sí que comparten recursos, información y servicios."
      },
      {
        titulo: "LAN (Local Area Network)",
        descripcion: "Red de cobertura limitada, típica de una oficina, hogar o edificio, caracterizada por altas velocidades y baja tasa de errores."
      },
      {
        titulo: "WAN (Wide Area Network)",
        descripcion: "Red de gran alcance geográfico que conecta múltiples LANs a través de países o continentes, como el propio Internet."
      },
      {
        titulo: "Topología en Estrella",
        descripcion: "Configuración física donde todos los nodos se conectan a un dispositivo central (Switch), evitando que la caída de un cable afecte a toda la red."
      }
    ],
    contenidoHtml: `
      <p>
        Una <strong>red de computadoras</strong> es el pilar fundamental sobre el cual se construye todo el ecosistema digital moderno. En esencia, se trata de un conjunto de dispositivos de hardware independientes (como servidores, estaciones de trabajo, impresoras y teléfonos) vinculados mediante medios físicos o inalámbricos para compartir información y recursos. El surgimiento de estas redes eliminó las barreras de transferencia física de archivos, dando paso a una era de comunicación en tiempo real y bases de datos centralizadas de alta disponibilidad.
      </p>

      <div class="my-6 p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm">
        <h3 class="text-sm font-semibold text-violet-400 mb-2">💡 Nota histórica</h3>
        <p class="text-zinc-400 text-sm leading-relaxed m-0">
          La precursora de la internet moderna fue ARPANET, desarrollada a finales de la década de 1960 por el Departamento de Defensa de EE.UU. Su gran innovación fue el uso de la <em>conmutación de paquetes</em> en lugar de la conmutación de circuitos telefónicos.
        </p>
      </div>

      <h2>Clasificación de las Redes por Alcance</h2>
      <p>
        Para organizar el estudio de las redes, solemos clasificarlas según la extensión geográfica que cubren. Las dos categorías más conocidas y utilizadas son:
      </p>
      <ul>
        <li>
          <strong>LAN (Local Area Network):</strong> Redes de área local que operan dentro de límites definidos, como una casa, escuela o un piso de oficinas. Se caracterizan por poseer una infraestructura privada, ofrecer velocidades de transferencia extremadamente altas (típicamente de 1 a 10 Gbps) y poseer una tasa de retraso o latencia sumamente baja.
        </li>
        <li>
          <strong>WAN (Wide Area Network):</strong> Redes de área amplia que abarcan extensiones geográficas masivas. Una WAN interconecta múltiples redes LAN separadas por cientos o miles de kilómetros. Son administradas por proveedores de servicios de telecomunicaciones, tienen velocidades más variables y una latencia superior debido a las distancias físicas involucradas.
        </li>
      </ul>

      <h2>Topologías de Red: ¿Cómo se conectan los dispositivos?</h2>
      <p>
        La <strong>topología</strong> define el mapa de cómo están organizados e interconectados los enlaces y nodos de una red. Esta configuración puede ser física (el tendido de cables real) o lógica (la ruta que toman los datos para viajar a través del medio de transmisión).
      </p>
      <p>
        Entre las topologías clásicas se encuentran la de <em>Bus</em> (donde todos comparten un único canal conductor) y la de <em>Anillo</em> (donde cada nodo se conecta a sus dos vecinos formando un circuito cerrado). Sin embargo, la topología más implementada hoy en día es la <strong>topología en Estrella</strong>, donde cada dispositivo se conecta directamente a un conmutador central. Si un cable de conexión falla, solo ese nodo específico queda incomunicado, mientras el resto de la red sigue funcionando sin interrupciones.
      </p>

      <h2>Modelos de Referencia: El lenguaje de la red</h2>
      <p>
        Para que dos dispositivos de diferentes fabricantes puedan intercambiar datos, deben seguir un conjunto de reglas comunes o <em>protocolos</em>. Para entender cómo interactúan estas reglas, los ingenieros utilizan modelos de capas abstractas.
      </p>
      <p>
        El modelo teórico <strong>OSI (Open Systems Interconnection)</strong> divide el proceso de comunicación en siete capas distintas, desde la capa física (cables y señales eléctricas) hasta la capa de aplicación (la interfaz que interactúa con el software de usuario). Por otro lado, el modelo práctico **TCP/IP** simplifica este proceso en cuatro capas funcionales, sirviendo como la suite de protocolos reales en los que opera toda la red mundial de Internet hoy en día.
      </p>
    `,
    preguntas: [
      {
        id: 1,
        pregunta: "¿Qué es una red de computadoras?",
        opciones: [
          "Un sistema operativo que conecta aplicaciones entre sí",
          "Un conjunto de dispositivos interconectados que comparten recursos e información",
          "Un protocolo de comunicación exclusivo para servidores",
          "Un tipo de hardware especializado para centros de datos"
        ],
        respuestaCorrecta: 1,
        explicacion: "Una red de computadoras es el conjunto de dispositivos de hardware independientes vinculados para compartir información y recursos."
      },
      {
        id: 2,
        pregunta: "¿Cuál es la característica principal de una red LAN?",
        opciones: [
          "Conecta países y continentes a través de telecomunicaciones",
          "Opera únicamente con tecnología inalámbrica WiFi",
          "Cubre un área geográfica limitada con altas velocidades y baja latencia",
          "Requiere proveedores de servicios de telecomunicaciones externos"
        ],
        respuestaCorrecta: 2,
        explicacion: "Una LAN (Local Area Network) se caracteriza por operar dentro de límites definidos (hogar, oficina) con velocidades muy altas y latencia baja."
      },
      {
        id: 3,
        pregunta: "¿Qué diferencia a una WAN de una LAN?",
        opciones: [
          "Las WAN son más rápidas que las LAN",
          "Las WAN cubren extensiones geográficas masivas conectando múltiples LANs",
          "Las WAN solo se usan en redes domésticas",
          "Las WAN no utilizan el protocolo TCP/IP"
        ],
        respuestaCorrecta: 1,
        explicacion: "Una WAN (Wide Area Network) abarca extensiones geográficas masivas e interconecta múltiples redes LAN separadas por kilómetros."
      },
      {
        id: 4,
        pregunta: "En la topología en estrella, ¿qué ocurre si falla el cable de un nodo?",
        opciones: [
          "Toda la red se cae inmediatamente",
          "Los dos nodos vecinos pierden conectividad",
          "Solo ese nodo queda incomunicado, el resto sigue funcionando",
          "El dispositivo central redistribuye la carga automáticamente"
        ],
        respuestaCorrecta: 2,
        explicacion: "En la topología en estrella, si un cable falla, solo ese nodo queda aislado; los demás siguen funcionando sin interrupciones."
      },
      {
        id: 5,
        pregunta: "¿Cuántas capas tiene el modelo OSI?",
        opciones: [
          "4 capas",
          "5 capas",
          "6 capas",
          "7 capas"
        ],
        respuestaCorrecta: 3,
        explicacion: "El modelo OSI (Open Systems Interconnection) divide el proceso de comunicación en 7 capas, desde la capa física hasta la capa de aplicación."
      }
    ]
  },
  {
    id: 2,
    titulo: "Infraestructura Básica",
    descripcionCorto: "Descubre el hardware esencial que da vida a las redes: desde switches y routers hasta cableado físico e IPs.",
    duracion: "15 min",
    imagen: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop",
    colorTheme: "from-fuchsia-500 to-pink-500",
    conceptosClave: [
      {
        titulo: "Switch (Conmutador)",
        descripcion: "Dispositivo de capa 2 del modelo OSI encargado de interconectar equipos dentro de una misma red local utilizando sus direcciones MAC físicas."
      },
      {
        titulo: "Router (Enrutador)",
        descripcion: "Dispositivo de capa 3 que conecta múltiples redes diferentes y decide la ruta óptima para enviar paquetes de datos hacia redes externas."
      },
      {
        titulo: "Direccionamiento IP",
        descripcion: "Identificador numérico lógico asignado a cada interfaz de un dispositivo conectado a una red que utiliza el protocolo IP."
      },
      {
        titulo: "Fibra Óptica",
        descripcion: "Medio de transmisión de datos físico consistente en hilos finos de vidrio o plástico que transmiten pulsos de luz a velocidades de la luz."
      }
    ],
    contenidoHtml: `
      <p>
        Construir una red informática estable y veloz requiere de una sólida infraestructura de hardware. Los componentes físicos de red son los responsables de recibir, procesar y direccionar los impulsos eléctricos, electromagnéticos o de luz que transportan nuestros datos binarios. Sin un diseño correcto de estos componentes, la red sufrirá de cuellos de botella y vulnerabilidades de conectividad.
      </p>

      <h2>Switches vs. Routers: Funciones Especializadas</h2>
      <p>
        Es sumamente común confundir las funciones de un Switch y un Router, pero operan en capas de red distintas y cumplen roles completamente diferentes:
      </p>
      <ul>
        <li>
          <strong>El Switch:</strong> Funciona en la capa de enlace de datos (Capa 2). Su objetivo es la conectividad "intraned". Es decir, permite que múltiples dispositivos en una misma oficina o red local se hablen entre sí. Lo hace aprendiendo y registrando las direcciones físicas MAC (Media Access Control) de cada dispositivo conectado a sus puertos físicos, enviando tramas de datos de forma directa únicamente al puerto del destinatario.
        </li>
        <li>
          <strong>El Router:</strong> Funciona en la capa de red (Capa 3). Su misión es la conectividad "internetwork". Conecta redes totalmente distintas (por ejemplo, la red interna de tu oficina con la red pública de tu proveedor de Internet). Utiliza tablas de ruteo y direcciones IP para determinar el mejor camino que debe tomar la información para llegar a su destino final a través de la gran red de redes.
        </li>
      </ul>

      <div class="my-6 p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm">
        <h3 class="text-sm font-semibold text-fuchsia-400 mb-2">⚖️ Comparativa Rápida</h3>
        <p class="text-zinc-400 text-sm leading-relaxed m-0">
          Un <strong>Switch</strong> crea redes locales; un <strong>Router</strong> las conecta. El Switch lee direcciones MAC de hardware local; el Router lee direcciones IP lógicas globales.
        </p>
      </div>

      <h2>El Medio Físico: Cableado de Cobre y Fibra Óptica</h2>
      <p>
        El medio de transmisión determina el ancho de banda potencial y la resistencia a la degradación de la señal en distancias largas. Los dos estándares dominantes en infraestructura cableada son:
      </p>
      <p>
        El <strong>cable de cobre de par trenzado (UTP/STP)</strong> es el más común en redes de área local debido a su bajo costo y facilidad de instalación. Los cables modernos (como Categoría 6 o 6A) manejan velocidades de hasta 10 Gbps a distancias máximas de 100 metros. Para distancias mayores o donde existe alta interferencia electromagnética, se recurre a la <strong>fibra óptica</strong>. Esta utiliza señales de luz que viajan por el interior de filamentos de vidrio purificado, ofreciendo anchos de banda colosales a distancias de kilómetros sin pérdidas apreciables.
      </p>

      <h2>Direccionamiento IP: El mapa postal digital</h2>
      <p>
        Para que los routers puedan enviar paquetes de información de una red a otra, cada dispositivo debe poseer una dirección única a nivel de software. Esto se logra mediante las <strong>Direcciones IP (Internet Protocol)</strong>.
      </p>
      <p>
        Una dirección IP clásica IPv4 consta de 32 bits divididos en cuatro bloques decimales (ej. <code>192.168.1.15</code>). Acompañando a la IP se encuentra la <em>máscara de subred</em>, que define qué parte de la dirección identifica a la red y qué parte identifica al host específico. Debido al agotamiento inminente de direcciones IPv4, la industria se encuentra migrando progresivamente a <strong>IPv6</strong>, que con sus 128 bits expresados en formato hexadecimal ofrece un espacio de direcciones prácticamente infinito para soportar el auge del Internet de las Cosas (IoT).
      </p>
    `,
    preguntas: [
      {
        id: 1,
        pregunta: "¿En qué capa del modelo OSI opera un Switch?",
        opciones: [
          "Capa 1 - Física",
          "Capa 2 - Enlace de datos",
          "Capa 3 - Red",
          "Capa 4 - Transporte"
        ],
        respuestaCorrecta: 1,
        explicacion: "El Switch opera en la Capa 2 (Enlace de datos) del modelo OSI, utilizando direcciones MAC para dirigir el tráfico dentro de una red local."
      },
      {
        id: 2,
        pregunta: "¿Cuál es la función principal de un Router?",
        opciones: [
          "Conectar dispositivos dentro de una misma red local usando direcciones MAC",
          "Amplificar la señal WiFi en grandes edificios",
          "Conectar redes distintas y determinar la ruta óptima para los paquetes",
          "Asignar direcciones IP automáticamente a los dispositivos"
        ],
        respuestaCorrecta: 2,
        explicacion: "El Router opera en la Capa 3 y su misión es conectar redes distintas, usando tablas de ruteo y direcciones IP para encontrar el mejor camino."
      },
      {
        id: 3,
        pregunta: "¿Cuál es la ventaja principal de la fibra óptica sobre el cable de cobre?",
        opciones: [
          "Es más económica y fácil de instalar en edificios pequeños",
          "Ofrece mayores anchos de banda a largas distancias sin pérdidas apreciables",
          "Solo puede usarse en redes inalámbricas de alta velocidad",
          "Funciona mejor en ambientes con alta temperatura"
        ],
        respuestaCorrecta: 1,
        explicacion: "La fibra óptica transmite luz a través de filamentos de vidrio, ofreciendo anchos de banda colosales a kilómetros de distancia sin degradación de señal."
      },
      {
        id: 4,
        pregunta: "¿Cuántos bits tiene una dirección IPv4?",
        opciones: [
          "16 bits",
          "32 bits",
          "64 bits",
          "128 bits"
        ],
        respuestaCorrecta: 1,
        explicacion: "Una dirección IPv4 consta de 32 bits divididos en cuatro bloques decimales (ej. 192.168.1.15)."
      },
      {
        id: 5,
        pregunta: "¿Por qué la industria migra a IPv6?",
        opciones: [
          "Porque IPv6 es más rápido en redes de área local",
          "Porque IPv4 no es compatible con redes inalámbricas modernas",
          "Por el agotamiento de direcciones IPv4 y la necesidad de soportar más dispositivos",
          "Porque IPv6 elimina la necesidad de routers en la red"
        ],
        respuestaCorrecta: 2,
        explicacion: "IPv6 usa 128 bits para ofrecer un espacio de direcciones prácticamente infinito, necesario ante el agotamiento de IPv4 y el crecimiento del IoT."
      }
    ]
  },
  {
    id: 3,
    titulo: "Monitoreo de Redes",
    descripcionCorto: "Aprende a diagnosticar problemas de rendimiento, medir latencia y dominar protocolos de monitoreo como SNMP e ICMP.",
    duracion: "10 min",
    imagen: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
    colorTheme: "from-blue-500 to-cyan-500",
    conceptosClave: [
      {
        titulo: "SNMP (Simple Network Management Protocol)",
        descripcion: "Protocolo estándar de la capa de aplicación usado para recopilar, organizar y supervisar información de rendimiento sobre dispositivos de red."
      },
      {
        titulo: "ICMP (Internet Control Message Protocol)",
        descripcion: "Protocolo auxiliar en la capa de red que los hosts y routers utilizan para reportar errores de transmisión y enviar mensajes de control de red."
      },
      {
        titulo: "Ping",
        descripcion: "Herramienta que envía solicitudes ICMP Echo Request para comprobar si un host de destino está en línea y medir el tiempo de respuesta."
      },
      {
        titulo: "Traceroute",
        descripcion: "Utilidad de diagnóstico que muestra el camino detallado y el tiempo de tránsito que toma un paquete a través de cada router hasta su destino."
      }
    ],
    contenidoHtml: `
      <p>
        Una vez que una red está configurada y operativa, el trabajo de un administrador de sistemas apenas comienza. Las redes son dinámicas: los dispositivos pueden fallar, el tráfico puede saturar los enlaces y el hardware puede degradarse físicamente. El <strong>monitoreo de redes</strong> consiste en la supervisión continua del rendimiento de los recursos de red con el fin de detectar anomalías y resolver cuellos de botella antes de que afecten a los usuarios finales.
      </p>

      <h2>Protocolos Esenciales de Supervisión: SNMP</h2>
      <p>
        Para monitorizar miles de dispositivos sin tener que ingresar a cada uno de ellos manualmente, se utiliza el protocolo estándar <strong>SNMP (Simple Network Management Protocol)</strong>.
      </p>
      <p>
        SNMP funciona bajo un modelo cliente-servidor básico. Los routers y switches ejecutan un software llamado <em>Agente</em>, el cual recopila estadísticas internas (como uso de CPU, ancho de banda consumido en cada puerto físico y temperatura de operación). Un servidor centralizado, llamado <em>NMS (Network Management System)</em>, realiza consultas periódicas a estos agentes y almacena la información estructurada bajo un esquema denominado MIB (Management Information Base), permitiendo a los administradores visualizar gráficos en tiempo real y recibir alertas automatizadas.
      </p>

      <h2>Protocolo de Diagnóstico y Control: ICMP</h2>
      <p>
        Mientras que SNMP está diseñado para la recolección de estadísticas complejas, el protocolo <strong>ICMP (Internet Control Message Protocol)</strong> está diseñado para la comunicación rápida de estados de error y comandos de control a nivel de red.
      </p>
      <p>
        ICMP no transporta datos de usuario directamente; en cambio, es utilizado por los propios sistemas operativos y routers para notificar situaciones críticas como: <em>"Destino inalcanzable"</em>, <em>"Tiempo de vida del paquete excedido"</em> o problemas de congestión de buffers. Gracias a la simplicidad de este protocolo, se han construido las herramientas de resolución de problemas más extendidas del mundo.
      </p>

      <div class="my-6 p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm">
        <h3 class="text-sm font-semibold text-blue-400 mb-2">🛠️ Herramientas de Consola Indispensables</h3>
        <p class="text-zinc-400 text-sm leading-relaxed m-0">
          Usa <code>ping &lt;host&gt;</code> para comprobar la conectividad básica y la latencia. Usa <code>tracert &lt;host&gt;</code> (en Windows) o <code>traceroute</code> (en Linux) para rastrear qué salto o router está causando caídas o retrasos en la ruta.
        </p>
      </div>

      <h2>Métricas Clave de Rendimiento</h2>
      <p>
        Al analizar los informes arrojados por las consolas de monitoreo, los administradores se enfocan principalmente en tres métricas operativas determinantes:
      </p>
      <ul>
        <li>
          <strong>Ancho de Banda y Rendimiento (Throughput):</strong> La capacidad total máxima teórica frente a la cantidad de datos reales que viajan satisfactoriamente por segundo.
        </li>
        <li>
          <strong>Latencia (Ping RTT):</strong> El tiempo de ida y vuelta que le toma a un paquete viajar desde el origen al destino y recibir respuesta. Latencias altas degradan la experiencia de aplicaciones en tiempo real como VoIP o videoconferencias.
        </li>
        <li>
          <strong>Pérdida de Paquetes:</strong> El porcentaje de paquetes enviados que nunca llegaron a su destino debido a ruido en el cableado o buffers de routers saturados. Cualquier porcentaje mayor a 0% generalmente amerita investigación inmediata.
        </li>
      </ul>
    `,
    preguntas: [
      {
        id: 1,
        pregunta: "¿Qué es el protocolo SNMP?",
        opciones: [
          "Un protocolo para transferir archivos entre servidores remotos",
          "Un protocolo estándar para recopilar y supervisar información de rendimiento en dispositivos de red",
          "Un protocolo de cifrado para comunicaciones seguras en la red",
          "Un sistema de detección de intrusiones en tiempo real"
        ],
        respuestaCorrecta: 1,
        explicacion: "SNMP (Simple Network Management Protocol) es un protocolo de capa de aplicación que permite recopilar estadísticas de rendimiento de routers, switches y otros dispositivos."
      },
      {
        id: 2,
        pregunta: "¿Cuál es la función del ICMP en las redes?",
        opciones: [
          "Transferir datos de usuario entre aplicaciones",
          "Asignar direcciones IP a los dispositivos de la red",
          "Reportar errores de transmisión y enviar mensajes de control a nivel de red",
          "Cifrar el tráfico entre dos redes distintas"
        ],
        respuestaCorrecta: 2,
        explicacion: "ICMP (Internet Control Message Protocol) es usado por sistemas y routers para reportar errores como 'Destino inalcanzable' o 'TTL excedido'."
      },
      {
        id: 3,
        pregunta: "¿Qué mide la herramienta Ping?",
        opciones: [
          "El número de dispositivos conectados a la red",
          "La cantidad de ancho de banda disponible en un enlace",
          "La conectividad básica y el tiempo de respuesta (latencia) hacia un host",
          "La velocidad de procesamiento de un switch de red"
        ],
        respuestaCorrecta: 2,
        explicacion: "Ping envía solicitudes ICMP Echo Request para comprobar si un host está en línea y medir el tiempo de ida y vuelta (RTT)."
      },
      {
        id: 4,
        pregunta: "¿Para qué se usa Traceroute (o tracert en Windows)?",
        opciones: [
          "Para cifrar las comunicaciones en redes públicas",
          "Para mostrar el camino detallado y tiempo de tránsito de un paquete por cada router hasta el destino",
          "Para listar todos los dispositivos conectados en la red local",
          "Para medir el ancho de banda máximo de una conexión WAN"
        ],
        respuestaCorrecta: 1,
        explicacion: "Traceroute muestra cada salto (router) que recorre un paquete y el tiempo de tránsito en cada uno, útil para identificar dónde ocurren los retrasos."
      },
      {
        id: 5,
        pregunta: "¿Qué indica una pérdida de paquetes mayor a 0%?",
        opciones: [
          "Que la red opera a su máxima eficiencia",
          "Que hay demasiados dispositivos conectados a la red",
          "Que existe un posible problema de ruido en el cableado o buffers saturados que requiere investigación",
          "Que el servidor SNMP necesita ser reiniciado"
        ],
        respuestaCorrecta: 2,
        explicacion: "Cualquier porcentaje de pérdida de paquetes mayor a 0% generalmente indica problemas de ruido en el cableado o buffers de routers saturados que deben investigarse."
      }
    ]
  }
];

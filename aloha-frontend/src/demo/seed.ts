import { addDays, format, subDays } from 'date-fns'
import type { CategoryColor } from '@/types'
import {
  DEMO_USER_EMAIL,
  DEMO_USER_PASSWORD,
  type DemoDb,
  type StoredCategory,
  type StoredGoal,
  type StoredLearning,
  type StoredTag,
} from './types'

const DAY = 'yyyy-MM-dd'

interface SeedLearning {
  /** Hace cuántos días se aprendió (0 = hoy). */
  ago: number
  category: string
  title: string
  summary: string
  content: string
  tags: string[]
  source?: string
  favorite?: boolean
}

const CATEGORY_SEED: { name: string; icon: string; color: CategoryColor; description: string }[] = [
  { name: 'Programación', icon: '💻', color: 'turquoise', description: 'Código, frameworks y buenas prácticas.' },
  { name: 'Idiomas', icon: '🌍', color: 'coral', description: 'Vocabulario, gramática y pronunciación.' },
  { name: 'Diseño', icon: '🎨', color: 'lavender', description: 'UI/UX, color, tipografía y composición.' },
  { name: 'Bienestar', icon: '🧘', color: 'mint', description: 'Hábitos, descanso y salud mental.' },
  { name: 'Ciencia', icon: '🔬', color: 'vanilla', description: 'Curiosidades del mundo natural.' },
  { name: 'Finanzas', icon: '💰', color: 'blush', description: 'Ahorro, presupuesto e inversión básica.' },
]

const LEARNING_SEED: SeedLearning[] = [
  {
    ago: 0, category: 'Programación', favorite: true,
    title: 'useEffect necesita una función de limpieza',
    summary: 'Cancelar suscripciones y temporizadores evita fugas de memoria.',
    content:
      'Cuando un efecto crea algo que sigue vivo (un `setInterval`, un listener, una petición), hay que **devolver una función de limpieza**.\n\n```tsx\nuseEffect(() => {\n  const id = setInterval(tick, 1000)\n  return () => clearInterval(id)\n}, [])\n```\n\n> En modo estricto React monta el componente dos veces en desarrollo: la limpieza es la que evita duplicados.',
    tags: ['react', 'hooks'], source: 'https://react.dev/learn/synchronizing-with-effects',
  },
  {
    ago: 0, category: 'Idiomas',
    title: 'Present perfect vs. past simple',
    summary: 'Usa present perfect cuando el momento exacto no importa o la acción conecta con hoy.',
    content:
      '- **Past simple:** momento terminado y concreto → *I visited Cartagena last year.*\n- **Present perfect:** experiencia o resultado actual → *I have visited Cartagena twice.*\n\nPalabras pista: *already, yet, ever, never, just*.',
    tags: ['inglés', 'gramática'],
  },
  {
    ago: 1, category: 'Bienestar', favorite: true,
    title: 'La regla 20-20-20 para descansar la vista',
    summary: 'Cada 20 minutos, mira algo a 20 pies (6 m) durante 20 segundos.',
    content:
      'Trabajar mucho tiempo frente a la pantalla reduce el parpadeo y cansa los músculos del ojo.\n\n1. Programa una alarma suave cada 20 minutos.\n2. Mira por la ventana unos 20 segundos.\n3. Parpadea de forma consciente.',
    tags: ['hábitos', 'salud'],
  },
  {
    ago: 2, category: 'Diseño',
    title: 'Contraste mínimo en texto: 4.5 a 1',
    summary: 'WCAG AA pide 4.5:1 para texto normal y 3:1 para texto grande.',
    content:
      'Los colores pastel son bonitos pero **flojos para texto**. Usa un tono profundo de la misma familia para letras y deja el pastel para fondos.\n\nHerramientas útiles: el verificador de contraste de las DevTools del navegador.',
    tags: ['accesibilidad', 'color'], source: 'https://www.w3.org/WAI/WCAG22/quickref/',
  },
  {
    ago: 3, category: 'Programación',
    title: 'DTO + MapStruct en Spring Boot',
    summary: 'Los DTO evitan exponer entidades JPA; MapStruct genera el mapeo en compilación.',
    content:
      'Un `@Mapper(componentModel = "spring")` genera la implementación sin reflexión.\n\n```java\n@Mapper(componentModel = "spring")\npublic interface ProveedorMapper {\n  ProveedorDto toDto(Proveedor entity);\n}\n```\n\nVentaja: errores de mapeo se ven al compilar, no en producción.',
    tags: ['spring-boot', 'java', 'mapstruct'], favorite: true,
  },
  {
    ago: 4, category: 'Ciencia',
    title: 'Los pulpos tienen tres corazones',
    summary: 'Dos bombean sangre a las branquias y uno al resto del cuerpo.',
    content:
      'Su sangre es azul porque usa **hemocianina** (con cobre) en lugar de hemoglobina (con hierro). Es más eficiente en agua fría y poco oxigenada.\n\nCuriosidad extra: el corazón sistémico se detiene cuando nadan, por eso prefieren gatear.',
    tags: ['biología', 'curiosidades'],
  },
  {
    ago: 5, category: 'Finanzas',
    title: 'Método 50/30/20 para presupuestar',
    summary: '50 % necesidades, 30 % gustos, 20 % ahorro o deudas.',
    content:
      'Es un punto de partida, no una ley. Si el arriendo consume más del 50 %, ajusta los porcentajes pero **mantén el pago a ti primero** (ahorro automático el día de pago).',
    tags: ['ahorro', 'presupuesto'],
  },
  {
    ago: 7, category: 'Programación',
    title: 'Zod: validar en el borde, tipar con z.infer',
    summary: 'Un solo esquema sirve para validar y para generar el tipo de TypeScript.',
    content:
      '```ts\nconst schema = z.object({ email: z.string().email() })\ntype Form = z.infer<typeof schema>\n```\n\nCon React Hook Form se conecta con `zodResolver(schema)`.',
    tags: ['typescript', 'zod', 'formularios'],
  },
  {
    ago: 8, category: 'Idiomas',
    title: 'Phrasal verbs de la rutina diaria',
    summary: 'Wake up, get up, turn on, turn off, look for, give up.',
    content:
      '- *wake up* → despertarse\n- *get up* → levantarse\n- *turn on / turn off* → encender / apagar\n- *look for* → buscar\n- *give up* → rendirse\n\nTruco: escribe una frase real de tu día con cada uno.',
    tags: ['inglés', 'vocabulario'],
  },
  {
    ago: 10, category: 'Bienestar',
    title: 'Respiración 4-7-8 antes de dormir',
    summary: 'Inhala 4 s, sostén 7 s, exhala 8 s; repite cuatro ciclos.',
    content:
      'Alarga la exhalación y activa el sistema parasimpático. Hazlo sentada, con la lengua detrás de los dientes superiores. Si te mareas, reduce el ritmo.',
    tags: ['sueño', 'respiración'],
  },
  {
    ago: 11, category: 'Diseño',
    title: 'Jerarquía visual con tres niveles',
    summary: 'Título, subtítulo y cuerpo bastan para guiar la mirada.',
    content:
      'Combina **tamaño**, **peso** y **color** para crear niveles claros. Si todo grita, nada se lee.',
    tags: ['ui', 'tipografía'], favorite: true,
  },
  {
    ago: 13, category: 'Programación',
    title: 'Axios: una instancia con interceptores',
    summary: 'Centraliza baseURL, token y manejo de 401 en un único cliente.',
    content:
      'Crear `axios.create({ baseURL })` y registrar interceptores evita repetir cabeceras en cada servicio. El interceptor de respuesta puede limpiar la sesión cuando llega un **401**.',
    tags: ['axios', 'react', 'jwt'],
  },
  {
    ago: 14, category: 'Ciencia',
    title: 'Por qué el cielo es azul',
    summary: 'La atmósfera dispersa más la luz azul (dispersión de Rayleigh).',
    content:
      'La luz de longitud de onda corta se dispersa mucho más que la roja. Al atardecer el recorrido por la atmósfera es más largo, la azul se pierde y quedan naranjas y rosas.',
    tags: ['física', 'curiosidades'],
  },
  {
    ago: 16, category: 'Finanzas',
    title: 'Interés compuesto en una frase',
    summary: 'Ganas intereses sobre los intereses: el tiempo pesa más que el monto.',
    content:
      'La **regla del 72** estima cuántos años tarda en duplicarse una inversión: 72 ÷ tasa anual. A 6 % → unos 12 años.',
    tags: ['inversión', 'ahorro'],
  },
  {
    ago: 19, category: 'Programación',
    title: 'Git: diferencia entre merge y rebase',
    summary: 'Merge conserva el historial real; rebase lo reescribe para dejarlo lineal.',
    content:
      'Regla práctica: **no hagas rebase de ramas compartidas**. Usa rebase para ordenar tu rama local antes de abrir el pull request.',
    tags: ['git', 'devops'],
  },
  {
    ago: 21, category: 'Idiomas',
    title: 'Falsos amigos español-inglés',
    summary: 'Actually ≠ actualmente, embarrassed ≠ embarazada, library ≠ librería.',
    content:
      '| Inglés | Significa | No es |\n|---|---|---|\n| actually | en realidad | actualmente |\n| embarrassed | avergonzado/a | embarazada |\n| library | biblioteca | librería |',
    tags: ['inglés', 'vocabulario'],
  },
  {
    ago: 23, category: 'Bienestar',
    title: 'Pomodoro: 25 min de foco, 5 de pausa',
    summary: 'Dividir el trabajo en bloques reduce la fatiga y la procrastinación.',
    content:
      'Después de cuatro pomodoros haz una pausa larga (15–30 min). Anota las distracciones en un papel y atiéndelas **después**.',
    tags: ['productividad', 'hábitos'],
  },
  {
    ago: 26, category: 'Diseño',
    title: 'Regla 60-30-10 para paletas',
    summary: '60 % color dominante, 30 % secundario, 10 % acento.',
    content:
      'En ALOHA: crema domina, menta/turquesa acompañan y el coral queda para las acciones principales.',
    tags: ['color', 'ui'],
  },
  {
    ago: 28, category: 'Programación',
    title: 'JWT: qué guardar y qué no',
    summary: 'El payload es legible por cualquiera: nunca pongas datos sensibles.',
    content:
      'Un JWT va **firmado**, no cifrado. Incluye `sub`, `exp` y poco más. Valida siempre la expiración y revoca sesiones con listas de bloqueo si es necesario.',
    tags: ['jwt', 'seguridad'], favorite: true,
  },
  {
    ago: 31, category: 'Ciencia',
    title: 'Las abejas pueden contar hasta cuatro',
    summary: 'Estudios muestran que distinguen cantidades pequeñas.',
    content: 'Se les entrenó para elegir paneles con el mismo número de formas. Su cerebro tiene menos de un millón de neuronas.',
    tags: ['biología', 'curiosidades'],
  },
  {
    ago: 35, category: 'Programación',
    title: 'Hexagonal: puertos y adaptadores',
    summary: 'El dominio no conoce frameworks; se conecta mediante interfaces.',
    content:
      'El **puerto** es la interfaz que el dominio necesita; el **adaptador** la implementa (JPA, REST, colas). Facilita probar el núcleo sin base de datos.',
    tags: ['arquitectura', 'java'],
  },
  {
    ago: 38, category: 'Finanzas',
    title: 'Fondo de emergencia: 3 a 6 meses',
    summary: 'Cubre gastos básicos ante imprevistos sin endeudarte.',
    content: 'Guárdalo en una cuenta de fácil acceso. Empieza pequeño: la primera meta puede ser **un mes** de gastos.',
    tags: ['ahorro'],
  },
  {
    ago: 42, category: 'Idiomas',
    title: 'Saludos formales e informales',
    summary: 'Good morning / How do you do vs. Hey / What’s up.',
    content: 'El registro depende de la relación y el contexto. En correos de trabajo empieza con *Dear* o *Hello* y cierra con *Kind regards*.',
    tags: ['inglés', 'vocabulario'],
  },
  {
    ago: 47, category: 'Bienestar',
    title: 'Caminar 10 minutos después de comer',
    summary: 'Ayuda a estabilizar la glucosa y a despejar la mente.',
    content: 'No necesitas ritmo deportivo: basta un paseo suave. Es un excelente hábito para atar a otro ya existente.',
    tags: ['salud', 'hábitos'],
  },
  {
    ago: 52, category: 'Programación',
    title: 'Flexbox vs. Grid',
    summary: 'Flexbox es unidimensional; Grid maneja filas y columnas a la vez.',
    content: 'Usa **Flexbox** para alinear elementos en una línea (navbars, botones) y **Grid** para maquetar páginas y tableros.',
    tags: ['css', 'frontend'],
  },
  {
    ago: 58, category: 'Diseño',
    title: 'Espacios en blanco: respirar también es diseñar',
    summary: 'El margen generoso mejora la lectura y da sensación de calma.',
    content: 'Agrupa lo relacionado con espacios pequeños y separa lo distinto con espacios grandes (principio de proximidad).',
    tags: ['ui', 'composición'],
  },
  {
    ago: 64, category: 'Ciencia',
    title: 'Fotosíntesis en una línea',
    summary: 'Luz + CO₂ + agua → glucosa + oxígeno.',
    content: 'Ocurre en los **cloroplastos**; la clorofila absorbe sobre todo luz roja y azul y refleja la verde.',
    tags: ['biología'],
  },
  {
    ago: 71, category: 'Programación',
    title: 'Primer endpoint REST con Spring',
    summary: '@RestController + @GetMapping devuelven JSON automáticamente.',
    content: '```java\n@RestController\n@RequestMapping("/api/hola")\nclass HolaController {\n  @GetMapping String hola() { return "Aloha"; }\n}\n```',
    tags: ['spring-boot', 'java', 'rest'],
  },
  {
    ago: 85, category: 'Idiomas',
    title: 'Números ordinales en inglés',
    summary: 'First, second, third… y luego se agrega -th.',
    content: 'Excepciones: *first, second, third, fifth, ninth, twelfth*.',
    tags: ['inglés', 'gramática'],
  },
  {
    ago: 99, category: 'Bienestar',
    title: 'Higiene del sueño: horario constante',
    summary: 'Acostarse y levantarse a la misma hora ordena el reloj biológico.',
    content: 'Evita pantallas 30 minutos antes de dormir y mantén el cuarto fresco y oscuro.',
    tags: ['sueño', 'salud'],
  },
  {
    ago: 112, category: 'Finanzas',
    title: 'Diferencia entre ahorrar e invertir',
    summary: 'Ahorrar protege liquidez; invertir busca crecimiento asumiendo riesgo.',
    content: 'El ahorro es para metas cercanas; la inversión, para plazos largos. Diversifica y nunca inviertas el fondo de emergencia.',
    tags: ['inversión', 'ahorro'],
  },
  {
    ago: 128, category: 'Programación',
    title: 'HTML semántico mejora la accesibilidad',
    summary: 'header, nav, main y footer dan estructura a lectores de pantalla.',
    content: 'Prefiere `<button>` a un `<div onClick>`: ya trae foco, teclado y rol correctos.',
    tags: ['html', 'accesibilidad'],
  },
  {
    ago: 141, category: 'Ciencia',
    title: 'Los ciclos de la Luna',
    summary: 'Un ciclo lunar dura cerca de 29,5 días.',
    content: 'Las fases dependen de cuánta cara iluminada vemos desde la Tierra: nueva, creciente, llena y menguante.',
    tags: ['astronomía', 'curiosidades'],
  },
]

function dateKey(ago: number): string {
  return format(subDays(new Date(), ago), DAY)
}

/** Crea los datos de demostración con fechas relativas a "hoy". */
export function createSeedDb(): DemoDb {
  const now = new Date().toISOString()
  const userId = 1

  const categories: StoredCategory[] = CATEGORY_SEED.map((c, i) => ({
    id: i + 1,
    userId,
    name: c.name,
    description: c.description,
    color: c.color,
    icon: c.icon,
  }))

  const tags: StoredTag[] = []
  const tagId = (name: string): number => {
    const found = tags.find((t) => t.name === name)
    if (found) return found.id
    const created: StoredTag = { id: tags.length + 1, userId, name }
    tags.push(created)
    return created.id
  }

  const learnings: StoredLearning[] = LEARNING_SEED.map((s, i) => {
    const learnedAt = dateKey(s.ago)
    const stamp = new Date(subDays(new Date(), s.ago).setHours(9 + (i % 9), (i * 7) % 60)).toISOString()
    return {
      id: i + 1,
      userId,
      title: s.title,
      summary: s.summary,
      content: s.content,
      categoryId: categories.find((c) => c.name === s.category)?.id ?? null,
      tagIds: s.tags.map(tagId),
      source: s.source ?? null,
      learnedAt,
      createdAt: stamp,
      updatedAt: stamp,
      favorite: s.favorite ?? false,
    }
  })

  const goals: StoredGoal[] = [
    {
      id: 1, userId,
      title: 'Un aprendizaje por día durante una semana',
      description: 'Construir el hábito: registrar algo nuevo cada día.',
      targetCount: 7,
      deadline: format(addDays(new Date(), 1), DAY),
      status: 'ACTIVE',
      createdAt: subDays(new Date(), 6).toISOString(),
    },
    {
      id: 2, userId,
      title: 'Llegar a 25 aprendizajes este mes',
      description: null,
      targetCount: 25,
      deadline: format(addDays(new Date(), 14), DAY),
      status: 'ACTIVE',
      createdAt: subDays(new Date(), 30).toISOString(),
    },
    {
      id: 3, userId,
      title: 'Dominar los fundamentos de Spring Boot',
      description: 'Controladores, DTO, JPA y seguridad con JWT.',
      targetCount: 12,
      deadline: format(addDays(new Date(), 30), DAY),
      status: 'ACTIVE',
      createdAt: subDays(new Date(), 40).toISOString(),
    },
    {
      id: 4, userId,
      title: 'Mis primeros 10 aprendizajes',
      description: '¡Lo logré!',
      targetCount: 10,
      deadline: format(subDays(new Date(), 60), DAY),
      status: 'COMPLETED',
      createdAt: subDays(new Date(), 150).toISOString(),
    },
  ]

  return {
    users: [
      {
        id: userId,
        name: 'Daniela',
        email: DEMO_USER_EMAIL,
        password: DEMO_USER_PASSWORD,
        bio: 'Aprendiendo cada día, un poquito a la vez. 🌺',
        avatar: '🌺',
        createdAt: now,
      },
    ],
    categories,
    tags,
    learnings,
    goals,
    seq: {
      user: 1,
      category: categories.length,
      tag: tags.length,
      learning: learnings.length,
      goal: goals.length,
    },
  }
}

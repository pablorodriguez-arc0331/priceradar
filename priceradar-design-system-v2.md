# PriceRadar Design System (Figma-Inspired + Minimalist Line Art)

---

## 1. Core Principles

- Decision-first UX: El usuario entra a decidir, no a explorar.
- Clarity > persuasion: Mostrar la verdad del precio, sin manipulación.
- Zero friction: Menos pasos = más conversión.
- Signal over noise: El dato importante domina siempre.
- Tool feeling: Debe sentirse como una herramienta.
- **Human touch**: líneas imperfectas, handcrafted, sin perder precisión.

---

## 2. UX Priorities

1. ¿Es buen precio?
2. ¿Debo comprar ahora?
3. ¿Dónde compro?

---

## 3. Color System

### Base
- Background: #FFFFFF
- Secondary BG: #F8F9FA
- Border: #E5E7EB
- Text Primary: #111827
- Text Secondary: #6B7280

### Semantic
- Deal: #16A34A
- Neutral: #6B7280
- Expensive: #DC2626

### Accent
- Primary: #0D99FF

---

## 4. Typography

- Mantener EXACTAMENTE las fonts actuales de la app
- No introducir nuevas familias tipográficas

Reglas:
- Precio domina jerarquía
- Lectura rápida
- Sin estilos decorativos

---

## 5. Minimalist Line Art System

### Concepto

UI técnica + estética humana:
- líneas imperfectas
- sensación de sketch
- precisión sin rigidez

---

### Line Specs

- Stroke: 1px–1.5px
- Color: #111827 o #6B7280
- Opacity: 80–100%
- Line cap: ligeramente redondeado

---

### Imperfection Rules

- No líneas 100% rectas siempre
- Micro-variación en trazos
- Bordes ligeramente irregulares
- Evitar perfección geométrica absoluta

---

### Usage

Aplicar en:
- iconos
- ilustraciones pequeñas
- estados vacíos
- highlights visuales

Evitar en:
- texto
- data crítica (precios, números)
- charts

---

## 6. Canvas Background (Grid Dots)

- Dot color: rgba(229,231,235,0.35)
- Size: 1px
- Spacing: 14px

CSS:

.canvas-bg {
  --dot-color: rgba(229,231,235,0.35);
  --dot-size: 1px;
  --grid-size: 14px;

  background-color: #FFFFFF;
  background-image: radial-gradient(var(--dot-color) var(--dot-size), transparent var(--dot-size));
  background-size: var(--grid-size) var(--grid-size);
}

Regla:
Si se nota demasiado → está mal.

---

## 7. Components

### Price Card
- limpio
- estructurado
- sin decoración

### Line Art Enhancement
- pequeños detalles dibujados a mano
- subrayados imperfectos
- indicadores visuales sutiles

---

## 8. Interaction

- 120–150ms
- feedback inmediato
- microinteracciones sutiles

---

## 9. Monetization UX

- CTA principal claro (afiliado)
- confianza antes que presión

---

## 10. Trust Layer

- “Last checked”
- fuente visible

---

## 11. Anti-Patterns

- ilustraciones complejas
- líneas perfectas tipo vector rígido
- exceso de sketch (ruido)
- competir con data

---

## 12. AI Instructions

- combinar precisión + imperfección controlada
- usar líneas handcrafted solo como soporte visual
- nunca afectar legibilidad
- priorizar decisión sobre estética

---

## 13. Heuristic

"Preciso como herramienta.
Humano como boceto.
Rápido como decisión."

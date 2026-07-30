# ADR-001: Incorporación de los patrones State y Strategy para modelar el flujo de una Session

## Contexto

El sistema de gestión de conferencias modela el ciclo de vida de una `Session` a través de distintas etapas:

- `Receiving`
- `Bidding`
- `Reviewing`
- `Selection`

En la implementación inicial, la clase `Session` concentraba la lógica correspondiente a todas estas etapas. A medida que el flujo de trabajo fue creciendo, este enfoque dificultó el mantenimiento del código, ya que cada nueva funcionalidad requería agregar nuevas validaciones y condiciones dependiendo del estado actual de la sesión.

Además, el mecanismo de selección de papers debía permitir utilizar distintos criterios de aceptación (por porcentaje, cantidad fija o puntaje mínimo) sin modificar la implementación de `Session`.

## Decisión

Se decidió incorporar dos patrones de diseño comportamentales.

### Patrón State

El ciclo de vida de una `Session` se modela mediante el patron State.

Cada etapa del proceso está representada por una clase concreta:

* `ReceivingState`
* `BiddingState`
* `ReviewingState`
* `SelectionState`

Cada una de estas clases implementa únicamente las operaciones permitidas durante esa etapa y define las transiciones hacia el siguiente estado cuando corresponde.

La clase `Session` delega el comportamiento dependiente del estado al objeto que representa el estado actual, eliminando la necesidad de utilizar estructuras condicionales para controlar el flujo del proceso.

### Patrón Strategy

La selección de papers aceptados se implementa mediante el patrón Strategy.

Se define una clase abstracta denominada `AcceptanceStrategy`, responsable de representar el algoritmo de selección.

Las implementaciones concretas incluyen:

- `AcceptanceByPercentage`
- `AcceptanceByCount`
- `AcceptanceByScoreThreshold`

La clase `Session` delega el proceso de selección a la estrategia configurada, permitiendo cambiar el criterio de aceptación sin modificar el resto del sistema. Ademas, permite agregar nuevas estrategias sin realizar modificaciones significativas.

### Ventajas

- Se elimina la lógica basada en múltiples estructuras condicionales dentro de `Session`.
- Cada etapa del proceso queda encapsulada en una clase independiente.
- Las transiciones entre estados resultan explícitas y fáciles de comprender.
- Es posible incorporar nuevas etapas sin modificar las ya existentes.
- Los distintos criterios de aceptación pueden agregarse mediante nuevas implementaciones de `AcceptanceStrategy`.
- Se mejora la mantenibilidad y la posibilidad de realizar pruebas unitarias sobre comportamientos específicos.

### Desventajas
- Se incrementa la cantidad de clases del proyecto.
- La estructura del sistema resulta ligeramente más compleja que una implementación basada únicamente en condicionales.


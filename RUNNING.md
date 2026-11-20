

<!-- local-development:start -->
# Desarrollo local

Puedes abrir este repositorio en VS Code, Antigravity o Sublime Text. El compilador y los servicios necesarios dependen del componente indicado abajo.

## Archivos ignorados

`.gitignore` excluye credenciales locales, estado del editor y salidas de las herramientas detectadas. No deja de versionar archivos que ya estaban en Git. Los manifiestos, archivos de bloqueo, recursos fuente y scripts de esquema forman parte del código.
<!-- local-development:end -->

<!-- platform-tools:start -->
## Herramientas para otros componentes

### Cisco Packet Tracer

Abre los archivos `.pkt` o `.pka` con Cisco Packet Tracer. Son topologías o actividades de red; su validación se realiza dentro del simulador, probando conectividad y configuración.
<!-- platform-tools:end -->


<!-- improvements-20261120:start -->
## Mejoras y verificación — 2026-11-20 (Simulador interactivo de ACL Cisco No-Ping (compañero de EJEMPLO.pkt))

- **Cambios:** Añadido simulador web sin dependencias (`web-sim/index.html` + `web-sim/acl-engine.js`) para evaluar reglas ACL extendidas Cisco (ICMP echo, TCP/UDP, CIDR y deny implícito), exportar CLI de Cisco IOS y persistir reglas en `localStorage` con tema claro/oscuro.
- **Validación:** Node 24 `node --test web-sim/tests/acl-engine.test.mjs` (3/3 pruebas aprobadas).
<!-- improvements-20261120:end -->

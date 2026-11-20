# Cisco Packet Tracer — Firewall Funcional (Bloqueo de Ping / ICMP)

Topología de red en **Cisco Packet Tracer** (`EJEMPLO.pkt`) que demuestra el filtrado de tráfico mediante **listas de control de acceso (ACL) extendidas** para bloquear solicitudes `ping` (`ICMP Echo Request`) permitiendo otros servicios autorizados, acompañada de un **simulador web interactivo sin dependencias**.

## Contenido del repositorio

| Archivo / Carpeta | Descripción |
| --- | --- |
| [`EJEMPLO.pkt`](EJEMPLO.pkt) | Topología original de Cisco Packet Tracer con firewall ACL bloqueando `ping` |
| [`web-sim/index.html`](web-sim/index.html) | Simulador web interactivo de reglas ACL (tema claro/oscuro, persistencia en `localStorage`, prueba de paquetes y exportación CLI Cisco IOS) |
| [`web-sim/acl-engine.js`](web-sim/acl-engine.js) | Motor UMD de evaluación secuencial de reglas ACL (`permit`/`deny`, CIDR, puertos TCP/UDP, ICMP y `deny ip any any` implícito) |
| [`web-sim/tests/acl-engine.test.mjs`](web-sim/tests/acl-engine.test.mjs) | Pruebas automatizadas en Node (`node --test`) |

## Compatibilidad con Cisco Packet Tracer (8.2.x / 9.x)

- **Apertura en versiones recientes (compatible):** Cisco Packet Tracer **8.2.x** y **9.0** mantienen retrocompatibilidad para abrir archivos `.pkt` creados en versiones anteriores (6.x / 7.x).
- **Advertencia al guardar:** si abres `EJEMPLO.pkt` en Packet Tracer 8.2.x o 9.x y guardas cambios, el archivo se migrará al formato moderno y **no podrá abrirse nuevamente en versiones 6.x/7.x** (Packet Tracer no soporta guardar en versiones anteriores). Haz una copia antes de sobrescribir si necesitas compatibilidad legacy.
- **Comandos Cisco IOS modernos:** la configuración generada por `web-sim/index.html` (`ip access-list extended`, `deny icmp any any echo`, `permit tcp any any eq 443`, `ip access-group ... in`) es compatible con routers Cisco IOS 15.x en **Packet Tracer 8.2.x y 9.x** (modelos como `2911`, `4321`, `4331`).
- *Nota de verificación:* en el entorno donde se actualizó el repositorio no estaba instalado Cisco Packet Tracer GUI, por lo que `EJEMPLO.pkt` se conservó intacto sin alterar el binario y se validó la lógica ACL mediante pruebas automatizadas en Node 24.

## Uso rápido del simulador web y pruebas

1. Abre [`web-sim/index.html`](web-sim/index.html) directamente en cualquier navegador moderno.
2. Prueba paquetes predefinidos (`Ping`, `HTTPS 443`, `SSH 22`), agrega o reordena reglas ACL y copia los comandos Cisco IOS listos para pegar en la CLI de tu router en Packet Tracer.
3. Ejecuta las pruebas unitarias:
   ```powershell
   node --test web-sim/tests/acl-engine.test.mjs
   ```

<!-- local-development:start -->
## Desarrollo local

Consulta [RUNNING.md](RUNNING.md) para ubicar cada componente, abrirlo en su IDE, compilarlo y conocer las comprobaciones realizadas y los requisitos pendientes.
<!-- local-development:end -->

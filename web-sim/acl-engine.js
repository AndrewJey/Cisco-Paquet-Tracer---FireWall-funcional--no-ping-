/* Motor de evaluación de ACL extendidas Cisco (compañero interactivo de EJEMPLO.pkt) */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.CiscoAclEngine = factory();
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  var DEFAULT_RULES = [
    { id: 'r1', action: 'deny', protocol: 'icmp', src: 'any', dst: 'any', port: 'echo', comment: 'Bloquear Ping (ICMP Echo Request)' },
    { id: 'r2', action: 'permit', protocol: 'tcp', src: 'any', dst: 'any', port: '80', comment: 'Permitir tráfico HTTP' },
    { id: 'r3', action: 'permit', protocol: 'tcp', src: 'any', dst: 'any', port: '443', comment: 'Permitir tráfico HTTPS' },
    { id: 'r4', action: 'permit', protocol: 'udp', src: 'any', dst: 'any', port: '53', comment: 'Permitir consultas DNS' },
    { id: 'r5', action: 'permit', protocol: 'ip', src: '192.168.1.0/24', dst: '10.0.0.0/24', port: 'any', comment: 'Permitir resto de tráfico LAN -> DMZ' }
  ];

  function ipToInt(ip) {
    var parts = String(ip || '').trim().split('.');
    if (parts.length !== 4) return null;
    var out = 0;
    for (var i = 0; i < 4; i++) {
      if (!/^\d{1,3}$/.test(parts[i])) return null;
      var n = Number(parts[i]);
      if (n > 255) return null;
      out = ((out << 8) | n) >>> 0;
    }
    return out;
  }

  function matchAddress(ruleAddr, pktIp) {
    var r = String(ruleAddr || 'any').trim().toLowerCase();
    if (r === 'any' || r === '*') return true;
    var pi = ipToInt(pktIp);
    if (pi === null) return false;
    if (r.indexOf('/') === -1) {
      var ri = ipToInt(r);
      return ri !== null && ri === pi;
    }
    var segs = r.split('/');
    var base = ipToInt(segs[0]);
    var prefix = Number(segs[1]);
    if (base === null || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) return false;
    var mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    return ((base & mask) >>> 0) === ((pi & mask) >>> 0);
  }

  function evaluatePacket(rules, packet) {
    var list = Array.isArray(rules) ? rules : [];
    var pkt = packet || {};
    var proto = String(pkt.protocol || 'ip').toLowerCase();
    var port = String(pkt.port || 'any').toLowerCase();
    var trace = [];

    for (var i = 0; i < list.length; i++) {
      var rule = list[i];
      var rProto = String(rule.protocol || 'ip').toLowerCase();
      var rPort = String(rule.port || 'any').toLowerCase();
      var protoOk = rProto === 'ip' || rProto === proto;
      var srcOk = matchAddress(rule.src, pkt.src);
      var dstOk = matchAddress(rule.dst, pkt.dst);
      var portOk = rPort === 'any' || rPort === '' || rPort === port;
      var matched = protoOk && srcOk && dstOk && portOk;
      trace.push({ index: i + 1, matched: matched });
      if (matched) {
        return {
          allowed: String(rule.action).toLowerCase() === 'permit',
          action: String(rule.action).toLowerCase(),
          matchedRuleIndex: i + 1,
          matchedRule: rule,
          implicitDeny: false,
          trace: trace
        };
      }
    }

    // Toda ACL Cisco termina con un "deny ip any any" implícito
    return { allowed: false, action: 'deny', matchedRuleIndex: null, matchedRule: null, implicitDeny: true, trace: trace };
  }

  function cidrToIosAddr(spec) {
    var s = String(spec || 'any').trim().toLowerCase();
    if (s === 'any' || s === '*') return 'any';
    if (s.indexOf('/') === -1) return 'host ' + s;
    var segs = s.split('/');
    var prefix = Number(segs[1]);
    var mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    var wc = (~mask) >>> 0;
    return segs[0] + ' ' + [(wc >>> 24) & 255, (wc >>> 16) & 255, (wc >>> 8) & 255, wc & 255].join('.');
  }

  function exportCiscoIos(rules, aclName, iface, direction) {
    var name = String(aclName || 'FIREWALL_NO_PING').replace(/\s+/g, '_');
    var lines = ['configure terminal', 'ip access-list extended ' + name];
    (rules || []).forEach(function (r) {
      var cmd = ' ' + r.action + ' ' + r.protocol + ' ' + cidrToIosAddr(r.src) + ' ' + cidrToIosAddr(r.dst);
      if (r.protocol === 'icmp' && r.port && r.port !== 'any') cmd += ' ' + r.port;
      else if ((r.protocol === 'tcp' || r.protocol === 'udp') && r.port && r.port !== 'any') cmd += ' eq ' + r.port;
      lines.push(cmd);
    });
    lines.push(' deny ip any any log');
    lines.push('exit');
    lines.push('interface ' + (iface || 'GigabitEthernet0/0'));
    lines.push(' ip access-group ' + name + ' ' + (direction || 'in'));
    lines.push('end');
    return lines.join('\n');
  }

  return { DEFAULT_RULES: DEFAULT_RULES, ipToInt: ipToInt, matchAddress: matchAddress, evaluatePacket: evaluatePacket, exportCiscoIos: exportCiscoIos };
});

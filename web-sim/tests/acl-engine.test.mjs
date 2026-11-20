import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const E = require('../acl-engine.js');

test('default No-Ping firewall blocks ICMP echo and permits HTTPS', () => {
  const ping = E.evaluatePacket(E.DEFAULT_RULES, { protocol: 'icmp', src: '192.168.1.10', dst: '10.0.0.5', port: 'echo' });
  assert.equal(ping.allowed, false);
  assert.equal(ping.matchedRuleIndex, 1);

  const https = E.evaluatePacket(E.DEFAULT_RULES, { protocol: 'tcp', src: '192.168.1.10', dst: '8.8.8.8', port: '443' });
  assert.equal(https.allowed, true);

  const ssh = E.evaluatePacket(E.DEFAULT_RULES, { protocol: 'tcp', src: '172.16.0.9', dst: '10.0.0.5', port: '22' });
  assert.equal(ssh.allowed, false);
  assert.equal(ssh.implicitDeny, true);
});

test('CIDR matching and invalid IPs', () => {
  assert.equal(E.matchAddress('192.168.1.0/24', '192.168.1.200'), true);
  assert.equal(E.matchAddress('192.168.1.0/24', '192.168.2.1'), false);
  assert.equal(E.ipToInt('256.1.1.1'), null);
  assert.equal(E.ipToInt('1.2.3'), null);
});

test('exports valid Cisco IOS extended ACL syntax', () => {
  const ios = E.exportCiscoIos(E.DEFAULT_RULES, 'NO_PING_ACL');
  assert.ok(ios.includes('ip access-list extended NO_PING_ACL'));
  assert.ok(ios.includes('deny icmp any any echo'));
  assert.ok(ios.includes('permit tcp any any eq 443'));
  assert.ok(ios.includes('192.168.1.0 0.0.0.255'));
});

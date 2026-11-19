import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeBackupEndpointUrl } from '../src/services/backup-config';

const blocked = [
  'http://127.0.0.1',
  'http://10.0.0.1',
  'http://169.254.169.254',
  'http://[::1]',
  'http://[::ffff:127.0.0.1]',
  'http://[fc00::1]',
  'http://[fe80::1]',
  // Deprecated site-local range fec0::/10.
  'http://[fec0::1]',
  'http://[feff::1]',
  // NAT64 well-known prefix embedding loopback, private and metadata IPv4.
  'http://[64:ff9b::7f00:1]',
  'http://[64:ff9b::10.0.0.1]',
  'http://[64:ff9b::a9fe:a9fe]',
  // 6to4 embedding loopback and private IPv4.
  'http://[2002:7f00:1::1]',
  'http://[2002:c0a8:101::1]',
];

const allowed = [
  'https://example.com',
  'https://dav.example.com/remote.php/dav',
  'https://[2606:4700:4700::1111]',
  // NAT64 and 6to4 embedding public IPv4 stay allowed.
  'https://[64:ff9b::808:808]',
  'https://[2002:808:808::1]',
];

test('backup endpoint policy rejects internal hosts', () => {
  for (const url of blocked) {
    assert.throws(() => normalizeBackupEndpointUrl(url, 'WebDAV server URL'), /host is not allowed/, url);
  }
});

test('backup endpoint policy keeps public hosts working', () => {
  for (const url of allowed) {
    assert.doesNotThrow(() => normalizeBackupEndpointUrl(url, 'WebDAV server URL'), url);
  }
});

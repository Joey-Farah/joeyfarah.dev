import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// dns's exports are non-configurable, so they must be mocked at module load
// rather than spied on.
vi.mock('dns', () => {
  const getServers = vi.fn();
  const setServers = vi.fn();
  const resolveSrv = vi.fn();
  return {
    default: { getServers, setServers, promises: { resolveSrv } },
    getServers,
    setServers,
    promises: { resolveSrv },
  };
});

import * as dns from 'dns';
import { ensureSrvResolvable } from '../src/modules/dnsGuard';

const SRV_URI = 'mongodb+srv://user:pass@cluster0.abc123.mongodb.net/db?retryWrites=true';
const ORIGINAL_SERVERS = ['127.0.0.1'];

const refused = () => Object.assign(new Error('querySrv ECONNREFUSED'), { code: 'ECONNREFUSED' });

const getServers = vi.mocked(dns.getServers);
const setServers = vi.mocked(dns.setServers);
const resolveSrv = vi.mocked(dns.promises.resolveSrv);

beforeEach(() => {
  vi.clearAllMocks();
  getServers.mockReturnValue(ORIGINAL_SERVERS);
  vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ensureSrvResolvable — no-ops', () => {
  it('ignores non-SRV connection strings', async () => {
    await ensureSrvResolvable('mongodb://localhost:27017/db');
    expect(resolveSrv).not.toHaveBeenCalled();
    expect(setServers).not.toHaveBeenCalled();
  });

  it('leaves resolvers alone when the SRV lookup already works', async () => {
    resolveSrv.mockResolvedValue([]);
    await ensureSrvResolvable(SRV_URI);
    expect(setServers).not.toHaveBeenCalled();
  });
});

describe('ensureSrvResolvable — recovery', () => {
  it('queries the SRV record derived from the URI host, without credentials', async () => {
    resolveSrv.mockResolvedValue([]);
    await ensureSrvResolvable(SRV_URI);
    expect(resolveSrv).toHaveBeenCalledWith('_mongodb._tcp.cluster0.abc123.mongodb.net');
  });

  it('falls back to public resolvers when the configured one is unreachable', async () => {
    resolveSrv.mockRejectedValueOnce(refused()).mockResolvedValueOnce([]);
    await ensureSrvResolvable(SRV_URI);
    expect(setServers).toHaveBeenCalledTimes(1);
    expect(setServers).toHaveBeenCalledWith(['1.1.1.1', '8.8.8.8']);
  });

  it('restores the original resolvers when the fallback also fails', async () => {
    resolveSrv.mockRejectedValue(refused());
    await ensureSrvResolvable(SRV_URI);
    expect(setServers).toHaveBeenLastCalledWith(ORIGINAL_SERVERS);
  });

  it('never throws — connection errors are left to mongoose', async () => {
    resolveSrv.mockRejectedValue(refused());
    await expect(ensureSrvResolvable(SRV_URI)).resolves.toBeUndefined();
  });
});

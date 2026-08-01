import * as dns from 'dns';

/**
 * Public resolvers used only when the machine's configured DNS is unreachable.
 * mongodb.net SRV records are public, so these resolve them fine anywhere.
 */
const FALLBACK_RESOLVERS = ['1.1.1.1', '8.8.8.8'];

/** Extracts the host from a mongodb+srv:// URI without touching credentials. */
function srvHost(uri: string): string | null {
  const match = /^mongodb\+srv:\/\/(?:[^@/]*@)?([^/?,]+)/.exec(uri);
  return match ? match[1] : null;
}

/**
 * mongodb+srv:// requires a DNS SRV lookup, which Node performs with its own
 * resolver rather than the OS one. On some machines Node picks up an
 * unreachable nameserver (e.g. a stale 127.0.0.1 from a since-removed DNS
 * proxy) and every SRV query fails with ECONNREFUSED even though normal DNS
 * works fine.
 *
 * Probes the SRV record and, if the lookup fails, retries against public
 * resolvers. Keeps them for the rest of the process when that succeeds,
 * otherwise restores the original servers so the real connection error
 * surfaces unchanged. No-ops for non-SRV URIs.
 */
export async function ensureSrvResolvable(uri: string): Promise<void> {
  const host = srvHost(uri);
  if (!host) return;

  const record = `_mongodb._tcp.${host}`;

  try {
    await dns.promises.resolveSrv(record);
    return;
  } catch (err) {
    const original = dns.getServers();

    try {
      dns.setServers(FALLBACK_RESOLVERS);
      await dns.promises.resolveSrv(record);
    } catch {
      dns.setServers(original);
      return; // fallback is no better; let mongoose report the original failure
    }

    process.stderr.write(
      `[dns] Node's resolver (${original.join(', ')}) could not look up ${record}: ` +
        `${(err as NodeJS.ErrnoException).code ?? 'lookup failed'}. ` +
        `Falling back to ${FALLBACK_RESOLVERS.join(', ')} for this run.\n`,
    );
  }
}

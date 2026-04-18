import { Router } from 'express';

const GRAPHQL_URL = 'https://internal.slippi.gg/graphql';
const CONNECT_CODE = 'JOEY#870';
const CACHE_TTL_MS = 5 * 60 * 1000;

const QUERY = `
  query($cc: String) {
    getUser(connectCode: $cc) {
      rankedNetplayProfile {
        ratingOrdinal
        wins
        losses
        dailyGlobalPlacement
      }
    }
  }
`;

interface SlippiData {
  rating: number;
  wins: number;
  losses: number;
  globalRank: number | null;
  fetchedAt: number;
}

let cache: SlippiData | null = null;

export const slippiRouter = Router();

slippiRouter.get('/slippi', async (_req, res) => {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    res.json(cache);
    return;
  }

  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'apollographql-client-name': 'slippi-web',
      },
      body: JSON.stringify({ query: QUERY, variables: { cc: CONNECT_CODE } }),
    });

    const json = await response.json() as any;
    const profile = json?.data?.getUser?.rankedNetplayProfile;

    if (!profile) {
      res.status(502).json({ error: 'No profile data' });
      return;
    }

    cache = {
      rating: Math.round(profile.ratingOrdinal),
      wins: profile.wins ?? 0,
      losses: profile.losses ?? 0,
      globalRank: profile.dailyGlobalPlacement ?? null,
      fetchedAt: Date.now(),
    };

    res.json(cache);
  } catch {
    res.status(502).json({ error: 'Failed to fetch Slippi data' });
  }
});

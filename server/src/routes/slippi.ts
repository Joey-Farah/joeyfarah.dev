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
        season {
          id
        }
      }
    }
  }
`;

interface SlippiData {
  rating: number;
  wins: number;
  losses: number;
  globalRank: number | null;
  season: string | null;
  rankName: string;
  fetchedAt: number;
}

function getRankName(rating: number, globalRank: number | null): string {
  if (globalRank !== null && globalRank <= 300) return 'Grandmaster';
  if (rating >= 2275.12) return 'Master III';
  if (rating >= 2217.96) return 'Master II';
  if (rating >= 2172.55) return 'Master I';
  if (rating >= 2119.84) return 'Diamond III';
  if (rating >= 2059.86) return 'Diamond II';
  if (rating >= 1992.44) return 'Diamond I';
  if (rating >= 1917.58) return 'Platinum III';
  if (rating >= 1835.25) return 'Platinum II';
  if (rating >= 1745.44) return 'Platinum I';
  if (rating >= 1648.22) return 'Gold III';
  if (rating >= 1543.67) return 'Gold II';
  if (rating >= 1431.97) return 'Gold I';
  if (rating >= 1313.19) return 'Silver III';
  if (rating >= 1188.19) return 'Silver II';
  if (rating >= 1054.86) return 'Silver I';
  if (rating >= 913.71) return 'Bronze III';
  if (rating >= 765.43) return 'Bronze II';
  return 'Bronze I';
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

    const rawSeason: string | null = profile.season?.id ?? null;
    const season = rawSeason ? rawSeason.replace('season-', 'Season ') : null;
    const globalRank: number | null = profile.dailyGlobalPlacement ?? null;
    const rating = Math.round(profile.ratingOrdinal);

    cache = {
      rating,
      wins: profile.wins ?? 0,
      losses: profile.losses ?? 0,
      globalRank,
      season,
      rankName: getRankName(rating, globalRank),
      fetchedAt: Date.now(),
    };

    res.json(cache);
  } catch {
    res.status(502).json({ error: 'Failed to fetch Slippi data' });
  }
});

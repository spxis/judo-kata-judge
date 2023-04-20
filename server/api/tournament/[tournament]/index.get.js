import db from '../../../db';
import { getToken } from '../../../utils';
import { getAuth } from '../../../utils/auth-key';

export default defineEventHandler(async (event) => {
  const token = getToken(event);
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' });
  }
  if (token !== getAuth()) {
    throw createError({ statusCode: 403, statusMessage: 'forbidden' });
  }
  try {
    const tournamentId = getRouterParam(event, 'tournament');
    const tournament = await db.tournament(tournamentId);
    return tournament.data;
  } catch (err) {
    throw createError({ statusCode: 400, statusMessage: err.message });
  }

});

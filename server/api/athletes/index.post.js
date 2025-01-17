import Athlete from '~/server/models/athlete';
import { getAuth, getToken } from '~/server/utils';

export default defineEventHandler(async (event) => {
  const token = getToken(event);
  if (!token) {
    return createError({ statusCode: 401, message: 'unauthorized' });
  }
  if (token !== getAuth()) {
    return createError({ statusCode: 403, message: 'forbidden' });
  }
  try {
    const { name, rank, region } = await readBody(event);
    const response = await Athlete.create({ name, rank, region });
    return response;
  } catch (err) {
    return createError({ statusCode: 400, message: err.message });
  }
});

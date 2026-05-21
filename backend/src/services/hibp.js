import crypto from 'crypto';
import axios from 'axios';

const HIBP_API_URL = 'https://api.pwnedpasswords.com/range/';

export async function checkPassword(password) {
  const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  try {
    const response = await axios.get(`${HIBP_API_URL}${prefix}`);
    const lines = response.data.split('\n');
    for (const line of lines) {
      const [hashSuffix, count] = line.split(':');
      if (hashSuffix === suffix) {
        return parseInt(count, 10);
      }
    }
    return 0; // Not found
  } catch (error) {
    console.error('Error checking password:', error);
    throw new Error('Failed to check password');
  }
}   
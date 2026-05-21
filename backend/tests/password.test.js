import { hashPassword, verifyPassword} from "../src/services/password.js";

describe('Password Service', () => {
  it ('hashPassword → génère un hash différent du mot de passe original', async () => {
    const password = 'mysecretpassword';
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);
  });

  it('verifyPassword → valide les mots de passe corrects', async () => {
    const password = 'mysecretpassword';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it('verifyPassword → rejette les mots de passe incorrects', async () => {
    const password = 'mysecretpassword';
    const wrongPassword = 'wrongpassword';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(wrongPassword, hash);
    expect(isValid).toBe(false);
  } );
});
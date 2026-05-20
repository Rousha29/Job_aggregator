import bcrypt from 'bcrypt';
export const hashPassword = async (password) => {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}
export const verifyPassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
}
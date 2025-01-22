import { genSalt, hash, compare } from 'bcryptjs';

const hashPassword = async (password) => {
  if (!isValidPassword(password)) {
    throw new Error('Password must be at least 6 characters long and must include combination of letters, numbers, and special characters');
  }
  const salt = await genSalt(10);
  return hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
  return compare(password, hashedPassword);
};

const isValidPassword = (password) => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
  return passwordRegex.test(password);
};

export default {
  hashPassword,
  comparePassword,
  isValidPassword
};

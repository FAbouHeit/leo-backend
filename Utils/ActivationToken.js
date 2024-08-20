import crypto from 'crypto';

export const generateActivationToken = () => {
  return crypto.randomBytes(20).toString('hex');
};
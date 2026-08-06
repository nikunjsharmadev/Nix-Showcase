import { PROCESS } from '../constants/const.js';
// ERROR HANDLING SERVER
export const handleFatalError = (err: Error) => {
  console.error(err);
  PROCESS.exit(1);
};

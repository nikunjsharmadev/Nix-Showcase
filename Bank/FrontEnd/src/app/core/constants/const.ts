// CONSTS
const createConstants = () => {
  const APP_STRING_LITERALS = {
    'bnk-auth': ['System Secure🔒', 'Digital Banking Platform', 'Sign In🔑', 'Register🏷️'],
    'bnk-login': ['Welcome Back', 'Input your credentials to initialize your secure banking session.'],
    'bnk-register': ['Register Banking Profile', 'Setup digital credentials to connect your bank accounts.'],
  };
  const VALIDATION_ERRORS: { [key: string]: string } = {
    required: 'This field is required*',
    email: 'Invalid email address*',
    minlength: 'Too short*',
  } as const;
  const BACKEND_URLS = {
    health: `health`,
    auth: {
      login: 'user-service/auth/login',
      register: 'user-service/auth/register',
      verifyEmail: 'user-service/auth/verify-email',
      me: 'user-service/auth/me',
      refresh: `user-service/auth/refresh`,
    },
  };
  return {
    APP_STRING_LITERALS,
    VALIDATION_ERRORS,
    BACKEND_URLS,
  };
};
export const constantFactory = createConstants();

import Router from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
export const routes = () => {
  const users = () => {
    const router = Router();
    router.use(
      '/',
      createProxyMiddleware({
        target: 'https://127.0.0.1:5001',
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/users': '',
        },
        on: {
          error(err) {
            console.error('Proxy error:', err.message);
          },
        },
      }),
    );
    return router;
  };
  return { users };
};

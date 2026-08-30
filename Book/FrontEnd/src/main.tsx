import './styles.css';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HlApp from './App';
const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter basename="/Nix-Showcase/booking/">
      <HlApp />
    </BrowserRouter>
  </QueryClientProvider>,
);

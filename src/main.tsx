import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './routes/router.tsx';
import { RoleProvider } from './shared/context/role_context.tsx';
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RoleProvider>
      <RouterProvider router={router} />
    </RoleProvider>
  </StrictMode>,
);

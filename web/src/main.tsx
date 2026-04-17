import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './app/App.tsx';

if (import.meta.env.DEV) {
  void Promise.all([
    import('react'),
    import('react-dom'),
    import('@axe-core/react'),
  ]).then(([React, ReactDOM, axe]) => {
    axe.default(React.default, ReactDOM.default, 1000);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

import { createRoot } from 'react-dom/client';

import App from './App';

import './index.css';

const container = document.getElementById('root')!;

// Build ke waqt prerender script is container ke andar crawlable static shell
// (page ka asli H1 + text + internal links) daalta hai — dekho
// `scripts/prerender-seo.mjs`. React mount se pehle usay hata dete hain taaki
// duplicate content na rahe. Agar JS load hi na ho, to wahi shell dikhta rehta hai.
container.replaceChildren();

createRoot(container).render(<App />);

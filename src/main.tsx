import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import "./main.css"
import "./styles/theme.css"
import "./index.css"

if (import.meta.env.MODE == 'development') {
    await import('@github/spark/initializeTelemetry');
}

import "@github/spark/llm"

createRoot(document.getElementById('root')!).render(
    <App />
)

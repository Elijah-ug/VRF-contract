import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { UseLotteryContextProvider } from './context/UseLotteryContextProvider.jsx'
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UseLotteryContextProvider>
      <BrowserRouter>
        <App />
        </BrowserRouter>
    </UseLotteryContextProvider>
  </StrictMode>
)

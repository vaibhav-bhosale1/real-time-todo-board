import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   server: {
    proxy: {
      '/api': 'https://real-time-todo-board.onrender.com', // point to your FastAPI server
    },
    historyApiFallback: true,
  },
})

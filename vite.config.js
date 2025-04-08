import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(
    {
      svgr: {
        svgrOptions: {
          icon: true // 允许调整尺寸和颜色
        }
      }
    }
  )],
  resolve: {
    alias: {
      '@assets': '/src/assets'
    }
  }
} 
)
const API_PORT = process.env.API_PORT || 3002

export default {
  proxy: {
    '/api': {
      target: `http://localhost:${API_PORT}/`,
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/api/, '')
    }
  }
}

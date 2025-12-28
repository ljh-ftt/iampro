module.exports = {
  lintOnSave: false,
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://0.0.0.0:3001',
        changeOrigin: true
      },
      '/equipment': {
        target: 'http://0.0.0.0:3001',
        changeOrigin: true
      }
    }
  }
}
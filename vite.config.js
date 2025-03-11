export default {
    base: './',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      target: 'esnext' 
    },
    server: {
      port: process.env.PORT || 3000,
      host: true
    }
  }
  

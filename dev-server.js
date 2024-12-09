import { createServer } from 'vite';

async function startServer() {
  const vite = await createServer({
    configFile: './vite.config.js',
    server: {
      port: 5173
    }
  });

  await vite.listen();
  console.log('Development server running at http://localhost:5173');
}

startServer();
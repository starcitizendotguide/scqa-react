import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import { createRequestListener } from '@react-router/node';
import { createRequestHandler } from 'react-router';
import * as build from 'virtual:react-router/server-build';

// --- the server bundle (build/server/index.js) is the React Router build, so the build can pre-render from it, and,
// run directly (`node index.js`), the page server: nginx serves the static files and forwards everything else over the
// Unix socket systemd hands over as fd 3, or STARFARER_LISTEN (a socket path or port) for a local run
export * from 'virtual:react-router/server-build';

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	// --- one page before listening loads the archive, so no visitor waits for it (systemd queues connections meanwhile)
	await createRequestHandler(build, 'production')(new Request('http://localhost/topic'));
	const server = createServer(createRequestListener({ build, mode: 'production' }));
	server.listen(process.env.LISTEN_FDS ? { fd: 3 } : process.env.STARFARER_LISTEN || 3000, () => {
		console.log('starfarer: listening');
	});
}

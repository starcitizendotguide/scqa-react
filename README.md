# starfarer.space

Search for answers Star Citizen developers gave in official shows, streams and posts. Built with React Router
(framework mode, server rendering), Vite and Meilisearch.

Requires Node 22.22 or newer.

## Development

```sh
corepack pnpm install
corepack pnpm dev
```

The search talks to the public search endpoint, which only accepts requests from starfarer.space. For local
development point it at your own Meilisearch instance:

```sh
VITE_MEILI_URL=http://localhost:7700 VITE_MEILI_KEY=<search key> corepack pnpm dev
```

## Build

```sh
corepack pnpm build
```

Writes the static files to `build/client` and the page server to `build/server/index.js`, a single file with every
dependency inlined. Run it with `node build/server/index.js` (port 3000, or `STARFARER_LISTEN` for another port or a
socket path; under systemd socket activation it takes the socket it is handed). Serve `build/client` in front of it
and pass every other path to the server.

The server renders answer pages (`/star/vault/<id>`, with related answers), episode pages (`/episode/<video id>`),
developer pages (`/dev`, `/dev/<slug>`, slug rule in `src/slug.ts`) and topic and show pages (`/topic`, `/show` and
below) from `STARFARER_DATA`, a JSON export of the search documents (`STARFARER_EPISODES` and `STARFARER_HUBS`
optionally add episode summaries and video lengths, and topic/show intros). It needs no network. Without the export (the dev server) the
pages load their data from the public search endpoint.

The home page is pre-rendered with the first page of results for the bare search, fetched from the search endpoint
during the build (the browser fetches them again only if the index has changed since). If the endpoint is unreachable
the build still succeeds and the page searches in the browser instead.

The sitemap (`sitemap-index.xml`, referenced by `robots.txt`) is generated from the archive when a release is built
and is not part of this repository.

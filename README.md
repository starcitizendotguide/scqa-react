# starfarer.space

Search for answers Star Citizen developers gave in official shows, streams and posts. Built with React Router
(framework mode, no runtime server), Vite and Meilisearch.

Requires Node 22.22 or newer.

## Development

```sh
npm install
npm run dev
```

The search talks to the public search endpoint, which only accepts requests from starfarer.space. For local
development point it at your own Meilisearch instance:

```sh
VITE_MEILI_URL=http://localhost:7700 VITE_MEILI_KEY=<search key> npm run dev
```

## Build

```sh
npm run build
```

Writes a static site to `build/client`. Answer pages (`/star/vault/<id>`) and episode pages (`/episode/<video id>`)
are pre-rendered when `STARFARER_DATA` points to a JSON export of the search documents; without it the build
pre-renders the home page and one answer and episode from the public search endpoint, and the other pages load their
data in the browser. Paths that were not pre-rendered are served by `build/client/__spa-fallback.html`.

The home page is pre-rendered with the first page of results for the bare search, fetched from the search endpoint
during the build (the browser fetches them again only if the index has changed since). If the endpoint is unreachable
the build still succeeds and the page searches in the browser instead.

The sitemap (`sitemap-index.xml`, referenced by `robots.txt`) is generated from the archive when a release is built
and is not part of this repository.

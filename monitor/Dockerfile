FROM oven/bun

COPY . ./
RUN bun install
RUN bun build --target=bun ./index.ts --outfile ./monitor.js

ENTRYPOINT ["bun", "run", "./monitor.js"]


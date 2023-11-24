FROM oven/bun

COPY . ./
RUN bun install
RUN bun build --target=bun ./index.ts --outfile ./api.js

ENTRYPOINT ["bun", "run", "./api.js"]


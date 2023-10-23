FROM oven/bun

ARG MQ_ADDRESS

COPY . ./
RUN bun install
RUN bun build --target=bun ./index.ts --outfile ./service2.js

ENTRYPOINT ["bun", "run", "./service2.js"]


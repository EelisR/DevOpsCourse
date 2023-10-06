FROM oven/bun

ARG MQ_ADDRESS

COPY . ./
RUN bun build --target=bun ./index.ts --outfile ./monitor.js

ENTRYPOINT ["bun", "run", "./monitor.js"]


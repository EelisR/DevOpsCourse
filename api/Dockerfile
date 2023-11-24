FROM oven/bun

ARG SERVICE_1_ADDRESS
ARG MQ_ADDRESS

COPY . ./
RUN bun install
RUN bun build --target=bun ./index.ts --outfile ./api.js

ENTRYPOINT ["bun", "run", "./api.js"]


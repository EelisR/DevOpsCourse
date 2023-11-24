FROM oven/bun

ARG API_ADDRESS

COPY . ./
RUN bun install

ENTRYPOINT ["bun", "test"]


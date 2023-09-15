FROM oven/bun

COPY . ./
RUN bun build ./index.ts --outdir ./out 

ENTRYPOINT ["bun", "run", "./out/index.js"]


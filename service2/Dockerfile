FROM oven/bun

COPY . ./
RUN bun build --target=bun ./index.ts --outfile ./service2.js

COPY ../wait-for-it/wait-for-it.sh ./
RUN ./wait-for-it.sh ${MQ_ADDRESS}

ENTRYPOINT ["bun", "run", "./service2.js"]


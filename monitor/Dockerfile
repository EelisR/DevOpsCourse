FROM oven/bun

COPY . ./
RUN bun build --target=bun ./index.ts --outfile ./monitor.js

COPY ../wait-for-it/wait-for-it.sh ./
RUN ./wait-for-it.sh ${MQ_ADDRESS} 

ENTRYPOINT ["bun", "run", "./monitor.js"]


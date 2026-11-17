FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY src ./src
USER node
EXPOSE 8787
HEALTHCHECK CMD wget -qO- http://localhost:${PORT:-8787}/api/health || exit 1
CMD ["node", "src/index.js"]

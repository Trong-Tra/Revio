FROM node:20-alpine

WORKDIR /app

# Install dependencies
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN pnpm db:generate

# Copy source code
COPY . .

# Build TypeScript
RUN pnpm build

EXPOSE 3001

CMD ["node", "dist/index.js"]

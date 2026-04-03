# ─── Stage: Production Build ───────────────────────────────────────────────
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy dependency files first (better Docker layer caching)
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy all source files
COPY . .

# Expose port
EXPOSE 3000

# Health check (Cloud Run will restart if this fails)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Start server
CMD ["node", "index.js"]

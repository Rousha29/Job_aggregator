# FROM postgres:15

FROM pgvector/pgvector:pg15

# ENV DEBIAN_FRONTEND=noninteractive

# Install build dependencies and pgvector, then clean up
# RUN apt-get update \
#     && apt-get install -y --no-install-recommends \
#        ca-certificates \
#        git \
#        build-essential \
#        postgresql-server-dev-15 \
#     && git clone --depth 1 https://github.com/pgvector/pgvector.git /tmp/pgvector \
#     && cd /tmp/pgvector && make && make install \
#     && rm -rf /tmp/pgvector \
#     && apt-get remove -y --purge git build-essential \
#     && apt-get autoremove -y \
#     && rm -rf /var/lib/apt/lists/*

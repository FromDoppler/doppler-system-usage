FROM koalaman/shellcheck-alpine:v0.9.0 as verify-sh
WORKDIR /src
COPY ./*.sh ./
RUN shellcheck -e SC1091,SC1090 ./*.sh

FROM amaysim/serverless:3.28.1 AS restore
WORKDIR /src
COPY package.json yarn.lock ./
RUN yarn
COPY . .

FROM restore AS verify-format
ENV CI=true
RUN yarn verify-format

FROM restore AS test
ENV CI=true
RUN yarn test

FROM restore AS final
WORKDIR /src
ARG version=unknown
# TODO: do something with the version
# RUN echo $version > /app/wwwroot/version.txt
LABEL name="doppler-system-usage" version="$version"

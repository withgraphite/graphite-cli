FROM node:18

WORKDIR /usr/src/app/

RUN apt update
RUN apt upgrade -y
RUN apt install -y git

RUN git config --global user.email "theuser@example.com"
RUN git config --global user.name "theuser"

COPY package.json .
COPY yarn.lock .

RUN yarn global add typescript@latest
RUN yarn install

COPY . .

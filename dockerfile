FROM node:18-alpine

ENV LANG="en_US.UTF-8"
ENV LC_ALL="en_US.UTF-8"
ENV LANGUAGE="en_US.UTF-8"

WORKDIR /multranslate
COPY package.json ./
RUN npm install
COPY multranslate.js .

CMD ["sh", "-c", "node multranslate.js -l $TRANSLATE_LANGUAGE -u $OPENAI_URL -k $OPENAI_API_KEY -m $OPENAI_API_KEY -e $OPENAI_TEMP"]
# Build Projects

mkdir ibot
cd ibot
npx create-react-app ibot-app --template typescript

React App
=========
mkdir ibot-app
cd ibot-app
npm install axios react-speech-recognition react-text-to-speech
npm install react-speech-recognition@latest
npm i --save-dev @types/react-speech-recognition
npm i --save-dev @types/react-resizeable
npm i --save-dev @types/react-grid-layout

    npm start

    Inside this directory, you can run several commands:

      npm start
        Starts the development server.

      npm run build
        Bundles the app into static files for production.

      npm test
        Starts the test runner.

      npm run eject
        Removes this tool and copies build dependencies, configuration files
        and scripts into the app directory. If you do this, you can’t go back!

We suggest that you begin by typing:

cd ibot-app
npm start

Server
======
(see Doc: https://js.langchain.com/docs/get_started/installation)
mkdir ibot-server
cd ibot-server
npm init -y
npm install express axios body-parser cors dotenv
npm install -D typescript ts-node @types/node @types/express @types/body-parser @types/cors
npm install openai
npm install -S langchain
npm install @langchain/openai
npm install @langchain/core

    Run:
    cd src
    npm start

# NOTES:

1. react-speech-recognition Github recommends using pollyfills from Speechly or Microsoft
   to improve cross browser copatibility.

2. Can use paid cloud services for speech recognition/text-to-speech (Google cloud or
   ElevenLab)

3. For quality speech recognition and etc.
   https://azure.microsoft.com/en-us/products/ai-services/ai-speech/

Updates
=======

git add/rm ....
git commit ....
git push origin HEAD:master



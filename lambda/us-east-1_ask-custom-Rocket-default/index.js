/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');

//To display a welcome message when invoke name is called
const WelcomeIntentHandler = {
 canHandle(handlerInput) {
   return handlerInput.requestEnvelope.request.type === 'LaunchRequest'||
     (handlerInput.requestEnvelope.request.type === "IntentRequest" &&
     handlerInput.requestEnvelope.request.intent.name === "WelcomeIntent")
 },
 async handle(handlerInput) {
   let outputSpeech = 'Welcome to Rocket Elevators. How can I help you?';

   return handlerInput.responseBuilder
     .speak(outputSpeech)
     .reprompt("How can I help?")
     .getResponse();
 },
};
const GetRemoteDataHandler = {
  canHandle(handlerInput) {
     return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
     handlerInput.requestEnvelope.request.intent.name === 'GetRemoteDataIntent';
  }
  
  async handle(handlerInput) {
    let outputSpeech = 'This is the default message.';

    await getRemoteData('https://rocketapi.azurewebsites.net/api/elevator')
    await getRemoteData('https://rocketapi.azurewebsites.net/api/building')
    await getRemoteData('https://rocketapi.azurewebsites.net/api/customers')
    await getRemoteData('https://rocketapi.azurewebsites.net/api/ElevatorsUnoperational')
    await getRemoteData('https://rocketapi.azurewebsites.net/api/Batteries')
    await getRemoteData('https://rocketapi.azurewebsites.net/api/BatteriesCities')
    await getRemoteData('https://rocketapi.azurewebsites.net/api/Quotes.')
    await getRemoteData('https://rocketapi.azurewebsites.net/api/Leads')

    
      .then((response) => {
        const data = JSON.parse(response);
        outputSpeech =  `Greetings,
        there are currently ${dataElevators.length} elevators deployed in the ${dataBuildings.length} buildings of your ${dataCustomers.length} customers.
        Currently, ${dataElevatorsUnoperational.length} elevators are not in Running Status and are being serviced.
        ${dataBatteries.length} batteries are deployed across ${dataBatteriesCities.length} cities.
        On another note you currently have ${dataQuotes.length} quotes awaiting processing.
        You also have ${dataLeads.length} leads in your contact requests.`;

      })
      .catch((err) => {
        //set an optional error message here
        //outputSpeech = err.message;
      });

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can introduce yourself by telling me your name';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const getRemoteData = function (url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? require('https') : require('http');
    const request = client.get(url, (response) => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error('Failed with status code: ' + response.statusCode));
      }
      const body = [];
      response.on('data', (chunk) => body.push(chunk));
      response.on('end', () => resolve(body.join('')));
    });
    request.on('error', (err) => reject(err))
  })
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetRemoteDataHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    WelcomeIntentHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();


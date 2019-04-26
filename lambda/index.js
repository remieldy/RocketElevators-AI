/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');


const GetRemoteDataHandler = {
  canHandle(handlerInput) {
     return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
     || (handlerInput.requestEnvelope.request.type === "IntentRequest" &&
     handlerInput.requestEnvelope.request.intent.name === 'GetRemoteDataIntent');
  },
  
  async handle(handlerInput) {  
    let outputSpeech = 'Greetings,';

    const getElevator = await getRemoteData('https://rocketapi.azurewebsites.net/api/alexa/elevators')
    const Elevators = JSON.parse(getElevator)

    const getBuildings = await getRemoteData('https://rocketapi.azurewebsites.net/api/alexa/buildings')
    const Buildings = JSON.parse(getBuildings)

    const getCustomers = await getRemoteData('https://rocketapi.azurewebsites.net/api/alexa/customers')
    const Customers = JSON.parse(getCustomers)

    const getStatus = await getRemoteData('https://rocketapi.azurewebsites.net/api/alexa/elevatorsstatus')
    const Status = JSON.parse(getStatus)

    const getBatteries = await getRemoteData('https://rocketapi.azurewebsites.net/api/alexa/batteries')
    const Batteries = JSON.parse(getBatteries)

    const getQuotes = await getRemoteData('https://rocketapi.azurewebsites.net/api/alexa/quotes')
    const Quotes = JSON.parse(getQuotes)

    const getLeads = await getRemoteData('https://rocketapi.azurewebsites.net/api/alexa/leads')
    const Leads = JSON.parse(getLeads)

    const getCities = await getRemoteData('https://rocketapi.azurewebsites.net/api/alexa/address/cities')
    const Cities = JSON.parse(getCities)

        outputSpeech += `there are currently ${Elevators.length} elevators deployed in the ${Buildings.length} buildings of your ${Customers.length} customers.
        Currently, ${Status.length} elevators are not in Running Status and are being serviced.
        ${Batteries.length} batteries are deployed across ${Cities.length} cities.
        On another note you currently have ${Quotes.length} quotes awaiting processing.
        You also have ${Leads.length} leads in your contact requests.`;



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
    console.log(err)
  })
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetRemoteDataHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();


require('dotenv').config();
const Nexmo = require('nexmo');

const AirtablePlus = require('airtable-plus');
const userBase = new AirtablePlus({ tableName: 'users' })
const phraseBase = new AirtablePlus({ tableName: 'phrases' })

const nexmo = new Nexmo({
  apiKey: process.env.NEXMO_API_KEY,
  apiSecret: process.env.NEXMO_API_SECRET,
})

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
}

exports.handler = async (event, context) => {
    try {
        const users = await userBase.read({ filterByFormula: "NOT({pronouns} = '')" });
        const phrases = await phraseBase.read();

        for(let user of users) {
            const pronoun = user.fields.pronouns.split('/')[0].toLowerCase();
            const phrase = phrases[Math.floor(Math.random() * phrases.length)].fields;
            let text;
            switch(pronoun) {
                case 'he':
                    text = phrase.he;
                    break;
                case 'she':
                    text = phrase.she;
                    break;
                case 'they':
                    text = phrase.they;
                    break;
                default: 
                    text = phrase.other;
                    break;
            }
            
            sendMessage(user.fields.msisdn, text.split('NAME').join(user.fields.name))
        }
        
        return { headers, statusCode: 200, body: 'ok' }
        
    } catch(e) {
        console.error(e);
        return { headers, statusCode: 200, body: 'error: ' + e }
    }
}

function sendMessage(msisdn, message) {
    nexmo.message.sendSms(process.env.NEXMO_PHONE_NUMBER, msisdn, message)
}
require('dotenv').config();
const Nexmo = require('nexmo');

const AirtablePlus = require('airtable-plus');
const userBase = new AirtablePlus({ tableName: 'users' })

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
        const { msisdn, text } = JSON.parse('{"' + decodeURI(event.body).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"').replace(/\+/g, " ") + '"}')

        const users = await userBase.read({ filterByFormula: `{msisdn} = "${msisdn}"` });
        if(users.length > 0) {
            if(text.toLowerCase().trim() == 'stop') {
                await userBase.delete(users[0].id);
                sendMessage(msisdn, 'You have been unsubscribed.')
                return { headers, statusCode: 200, body: 'ok' }
            }

            if(!users[0].fields.pronouns) {
                switch(text) {
                    case '1':
                        await userBase.update(users[0].id, { pronouns: 'they/them' })
                        break;
                    case '2':
                        await userBase.update(users[0].id, { pronouns: 'she/her' })
                        break;
                    case '3':
                        await userBase.update(users[0].id, { pronouns: 'he/him' })
                        break;
                    default:
                        await userBase.update(users[0].id, { pronouns: text })
                        break;
                }
                sendMessage(msisdn, 'Fantastic! We will send you a nice affirmation soon. Text STOP to unsubscribe.')
            } else {
                sendMessage(msisdn, 'We have alraedy got you. If you want to change your pronouns text STOP to unsubscribe and then send your name in to resubscribe with new pronouns.')
            }
        } else {
            await userBase.create({ msisdn, name: text })
            const message = [
                '1 for they/them',
                '2 for she/her',
                '3 for he/him',
                'Or reply with your own in that format'
            ]
            sendMessage(msisdn, message.join('\n'))
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
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
        const { msisdn, text } = event.queryStringParameters

        console.log(msisdn, text);

        const users = await userBase.read({ filterByFormula: `{msisdn} = "${msisdn}"` });
        if(users.length > 0) {
            if(text.toLowerCase().trim() == 'stop') {
                await userBase.delete(users[0].id);
                sendMessage(msisdn, 'You have been unsubscribed. If you would like to sign up again with either the same or a different name (or set of pronouns) just message us again with your name!')
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
                sendMessage(msisdn, 'Fantastic, thanks for confirming your pronouns! We will send you a nice affirmation message at around lunchtime (in the UK) every day. Text STOP to unsubscribe or to change your name and pronouns.')
                return { headers, statusCode: 200, body: 'ok' }
            } else {
                sendMessage(msisdn, 'Thanks for messaging The Validation Station. We have already got your number in our system! If you want to change your pronouns text STOP to unsubscribe and then send your name in to resubscribe with new pronouns.')
                return { headers, statusCode: 200, body: 'ok' }
            }
        } else {
            await userBase.create({ msisdn, name: text })
            const message = [
                'Welcome to The Validation Station! Thanks for sending us your name. Now all we need are your pronouns. Please reply with:',
                '1 to use They/Them',
                '2 to use She/Her',
                '3 to use He/Him',
                'Or reply with your own in that format (e.g. Ze/Zir).'
            ]
            sendMessage(msisdn, message.join('\n'))
            return { headers, statusCode: 200, body: 'ok' }
        }
        
    } catch(e) {
        console.error(e);
        return { headers, statusCode: 200, body: 'error: ' + e }
    }
}

function sendMessage(msisdn, message) {
    console.log(msisdn, message);
    nexmo.message.sendSms(process.env.NEXMO_PHONE_NUMBER, msisdn, message, err => {
        console.log(err)
    })
}

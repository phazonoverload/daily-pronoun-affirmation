require('dotenv').config();

const AirtablePlus = require('airtable-plus');
const userBase = new AirtablePlus({ tableName: 'users' })

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
}

exports.handler = async (event, context) => {
    try {
        // Only allow post requests, but return 200 so the postflight request succeeds
        if (event.httpMethod !== 'POST') {
            return { headers, statusCode: 200, body: JSON.stringify({ error: 'Invalid method' }) }
        }
        
        // Grab fields
        const { msisdn, name, pronouns } = JSON.parse(event.body)

        // Check all fields have been provided
        if(!event.body || !msisdn || !name || !pronouns) {
            return { headers, statusCode: 200, body: JSON.stringify({error: 'Missing fields'}) }
        }

        // See if user exists. If no create them.
        const users = await userBase.read({ filterByFormula: `{msisdn} = "${msisdn}"` });
        if(users.length > 0) {
            return { headers, statusCode: 200, body: JSON.stringify({error: 'Already exists'}) }
        } else {
            await userBase.create({ msisdn, name, pronouns })
            return { headers, statusCode: 200, body: JSON.stringify({message: 'Successfully created'}) }
        }
    } catch(e) {
        console.error('Error:', e);
        return { headers, statusCode: 200, body: JSON.stringify({error: e}) }
    }
}
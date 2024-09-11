import twilio from 'twilio';

const accountSid = "ACbc82c291bae072a0dc578fd8649b9071";
const authToken = "65bc497314b68e2fa7b9a442103382dc";
const client = require('twilio')(accountSid, authToken);

export const GenerateAccessCode = () => {
    const code = Math.floor(10000 + Math.random() * 900000);
    let expiry = new Date();
    expiry.setTime(new Date().getTime() + 30 * 60 * 1000);
    return { code, expiry };
};

export const SendVerificationCode = async (
    code: number,
    toPhoneNumber: string
) => {
    const response = await client.messages.create({
        body: `Your verification code is ${code} it will expire within 30 minutes.`,
        from: '+917976954339',
        to: toPhoneNumber.trim(),
    });
    console.log(response);
    return response;
}
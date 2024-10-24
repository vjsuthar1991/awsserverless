import twilio from "twilio";

const accountSid = "xxxxxxxxxxxxxxxxxxx0e";
const authToken = "xxxxxxxxxxxxxxxxx95";

const client = twilio(accountSid, authToken);

export const SendVerificationCode = async (
    code: number,
    toPhoneNumber: string
) => {
    const response = await client.messages.create({
        body: `Your verification code is ${code} it will expire within 30 minutes.`,
        from: "+15738594262",
        to: toPhoneNumber.trim(),
    });
    console.log(response);
    return response;
};

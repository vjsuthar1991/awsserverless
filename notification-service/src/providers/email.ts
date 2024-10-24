import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

export const SendEmailUsingSES = async (to: string, message: string) => {
    const params = {
        Destination: {
            ToAddresses: [to],
            CcAddresses: ["suthar67@gmail.com"],
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: message,
                },
                Text: {
                    Charset: "UTF-8",
                    Data: message,
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: "Test email",
            },
        },
        Source: "suthar67@gmail.com",
        ReplyToAddresses: ["suthar67@gmail.com"],
    };

    const client = new SESClient({ region: "your-region" });
    const command = new SendEmailCommand(params);

    try {
        await client.send(command);
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

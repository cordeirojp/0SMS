let AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();

exports.handler = function (event, context, callback) {
    let receiver = event['receiver'];
    let sender = event['sender'];
    let message = event['message'];

    console.log("Sending message", message, "to receiver", receiver);

    sns.publish({
        Message: message,
        MessageAttributes: {
            'AWS.SNS.SMS.SMSType': {
                'DataType': 'String',
                'StringValue': 'Promotional'
            },
            'AWS.SNS.SMS.SenderID': {
                'DataType': 'String',
                'StringValue': sender
            }
        },
        PhoneNumber: receiver
    }).promise()
        .then(data => {
            console.log("Sent message to", receiver);
            var msgID = data.MessageId;
            const date = new Date(Date.now()).toString();

            ddb.put({
                TableName: 'SendedSMS',
                Item: { 'MessID': msgID, 'Receiver': receiver, 'Message': message, 'Date': date }
            }).promise()
                .then((data) => {
                    console.log("db ok");
                })
                .catch((err) => {
                    console.log("db failed", err);
                });

            callback(null, data);
        })
        .catch(err => {
            console.log("Sending failed", err);
            callback(err);
        });
}
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
                'StringValue': 'Transactional'
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
            var params = {
                TableName: 'SendedSMS',
                Item: { 'MessID': data }
            };

            ddb.put({
                TableName: 'SendedSMS',
                Item: { 'MessID': 'MessageID' }
            }).promise()
                .then((data) => {
                    //your logic goes here
                })
                .catch((err) => {
                    //handle error
                });


            callback(null, data);
        })
        .catch(err => {
            console.log("Sending failed", err);
            callback(err);
        });
}
var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-east-2",
    //   endpoint: "http://localhost:8000"
    endpoint: "https://dynamodb.us-east-2.amazonaws.com"
});


var dynamodb = new AWS.DynamoDB();

var params = {
    TableName: "InstaPost",
    KeySchema: [
        { AttributeName: "name", KeyType: "HASH" },  //Partition key
        { AttributeName: "id", KeyType: "RANGE" }  //Sort key
    ],
    AttributeDefinitions: [
        { AttributeName: "name", AttributeType: "S" },
        { AttributeName: "id", AttributeType: "S" }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
    }
};

dynamodb.createTable(params, function (err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
    }
});
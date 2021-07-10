//node server for socket io
const express = require("express");
const app = express();
const port = 80;
const path = require("path");

const io = require('socket.io')(8080, {
    cors: {
        origin: '*',
    }
});//have to add this to use socket.io

var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-east-2",
    // endpoint: "http://localhost:8000"
    endpoint: "https://dynamodb.us-east-2.amazonaws.com"
});


var docClient = new AWS.DynamoDB.DocumentClient();


var mydata = {};

var table = "InstaPost";






const users = {};

io.on('connection', socket => {//handle all users, also connection is inbuilt emiites by socket server itself when a user connects
    socket.emit('loading', 'loading');
    var i = 0;
    scandata(i, socket);
    socket.on('new-user-joined', name => {//handle one of many users
        console.log("new user", name);
        users[socket.id] = name;
        socket.emit('user-joined', name);//notify everyone in the connection other then me
        console.log('yes joined as', users[socket.id]);
    });

    socket.on('send', message => {//send is not inbuilt
        // console.log(typeof(message), message.desc);
        var name = users[socket.id];
        // putcompPost(name, message.imglink, message.desc);
        socket.emit("adding", "adding right now... Please wait");
        putPost(name, message.imglink, message.desc, socket);
        
        // console.log(users[socket.io]);
    });

    socket.on('liked', message => {

        var name_date = message;
        var arr = name_date.split("```");
        socket.emit("adding", "adding right now... Please wait");

        updatelike(arr[0], arr[1], "+", socket);
    });
    socket.on('unliked', message => {

        var name_date = message;
        var arr = name_date.split("```");
        socket.emit("adding", "adding right now... Please wait");

        updatelike(arr[0], arr[1], "-", socket);
    });

    socket.on('delete', message => {
        var name_date = message;
        var str = name_date.slice(3,);
        var arr = str.split("```");
        // socket.emit("adding", "adding right now... Please wait");
        deleteitem(arr[0], arr[1]);
        socket.emit('itemdeleted', name_date);

    })



    socket.on('disconnect', message => {
        socket.broadcast.emit('userleft', users[socket.id]);
        delete users[socket.id];
    })




});

app.use("/static", express.static("static"));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


app.get("/", (req, res) => {
    const params = {};
    res.status(200).render('index', params);

});



app.listen(port, () => {
    console.log(`connection startted at port ${port}`)
});


function putPost(username, imglink, desc, socket) {
    var date = new Date();
    date = `${date}`.replace(/\s/g, '');
    date = date.replace('+', "");
    console.log(date);
    
    var params = {
        TableName: table,
        Item: {
            "name": username,
            "id": `${date}`,
            "info": {
                "imglink": imglink,
                "desc": desc,
                "likes": 0
            }
        }
    };
    console.log("Adding a new item...");
    docClient.put(params, function (err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            socket.emit("error", "Error : File size may be Bigger OR no internet connection available");

        } else {
            message = {
                "imglink" : params.Item.info.imglink,
                "desc" : params.Item.info.desc,
                "id" : params.Item.id
            }
            socket.emit('receive', { message: message, name: users[socket.id] });
            socket.broadcast.emit('receive', { message: message, name: users[socket.id] });
            console.log("Added item:", JSON.stringify(data, null, 2));
            socket.emit("added", "added");
            
        }
    });

}

function scandata(i, socket) {
    var params = {
        TableName: "InstaPost"
    };

    console.log("Scanning InstaPost table.");
    var j = false;
    docClient.scan(params,
        
        function onscan(err, data) {
            if (err) {
                console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                // print all the movies
                console.log("Scan succeeded.");

                data.Items.forEach(function (feed) {
                    //    console.log(feed , typeof(feed));
                    var attach = "at" + i++;
                    mydata[attach] = feed;
                    j = true;
                });

                // continue scanning if we have more movies, because
                // scan can retrieve a maximum of 1MB of data
                if (typeof data.LastEvaluatedKey != "undefined") {
                    console.log("Scanning for more...");
                    params.ExclusiveStartKey = data.LastEvaluatedKey;
                    docClient.scan(params, onscan);
                    j= false;

                }
                // console.log("this is my data ", mydata);
                if(j == true){
                    socket.emit("scandone", JSON.stringify(mydata))
                }
                // socket.emit("scandone", JSON.stringify(mydata))
                var para = { "scan": JSON.stringify(mydata) }

            }
        });


}

function updatelike(myname, myid, opr, socket) {
    var params = {
        TableName: table,
        Key: {
            "name": myname,
            "id": myid
        },
        UpdateExpression: `set info.likes = info.likes ${opr} :val`,
        ExpressionAttributeValues: {
            ":val": 1
        },
        ReturnValues: "UPDATED_NEW"
    };

    console.log("Updating the item...");
    docClient.update(params, function (err, data) {
        if (err) {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
            socket.emit("added", "added");

        }
    });
}


function deleteitem(myname, myid) {
    var params = {
        TableName: table,
        Key: {
            "name": myname,
            "id": myid
        },
    };

    console.log("Attempting a conditional delete...");
    docClient.delete(params, function (err, data) {
        if (err) {
            console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
        }
    });
    // socket.emit("addded", "added");

}

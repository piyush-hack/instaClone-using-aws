const socket = io('http://localhost:8080');

// var data = document.getElementById("helper").getAttribute("data");
var data = "";
socket.on("scandone", message => {
    console.log("emiited loading done");
    data = JSON.parse(message);
    getEL("loader2").style.display = "none";
    getEL("feeds").style.display = "block";

    // console.log(typeof (data), data)
    var count = Object.keys(data).length;

    for (x in data) {
        uname = data[x]["name"];
        uimglink = data[x]["info"]["imglink"];
        udesc = data[x]["info"]["desc"];
        udate = data[x]["id"];
        var tlikes = data[x]["info"]["likes"];
        console.log(tlikes);
        var i = 0;
        for(y in data){
            if(udate == data[y]["id"]){
                i++;
                console.log("times a div", i);
                if(i>1){
                    delete data[y];
                    i = 1;
                }
            }
        }
        if(i == 1){
            createfeed(uimglink, udesc, uname, udate, tlikes)
            console.log("create");
        }
    };

});

socket.on('user-joined', name => {
    checkdel(name);
    console.log('user-joined as', name);
    alert("NOW YOU CAN ADD POSTS");

})

socket.on('receive', data => {
    createfeed(data.message.imglink, data.message.desc, data.name, data.message.id);
    console.log('method called');
    // checkdel(data.name);

})

socket.on('itemdeleted', myid => {
    getEL("do" + myid).style.display = "none";
});

socket.on("adding", message => {
    getEL("postadder").style.display = "none";
    getEL("loader").style.display = "block";
})

socket.on("added", message => {
    console.log("emiited added")
    getEL("postadder").style.display = "block";
    getEL("loader").style.display = "none";
});

socket.on("loading", message => {
    console.log("emiited loading");
    getEL("loader2").style.display = "block";
    getEL("feeds").style.display = "none";
})

socket.on("error", message=>{
    console.log("emiited error");
    alert(message);
    getEL("loader2").style.display = "none";
    getEL("feeds").style.display = "block";
})


function getEL(ig) {
    var element = document.getElementById(ig);
    return element;
}

var postdata = {};

function setname() {
    if (getEL("name").value) {
        var name = getEL("name").value;
        socket.emit('new-user-joined', name);
        getEL("addposth").style.display = "block";
        getEL("setnameform").style.display = "none";
        var ele = document.getElementsByClassName('likes');
        for (var i = 0; i < ele.length; i++) {
            ele[i].style.display = "block";
        }
    } else {
        alert("ENTER NAME FIRST")
    }
}


function savepost() {
    var imglink = getEL("imglink").value;
    var desc = getEL("desc").value;
    postdata = {
        "imglink": imglink,
        "desc": desc
    }
    getEL("close").click();
    socket.emit('send', postdata);


}

function createfeed(myimglink, mydesc, myname, my_date, tlikes) {
    // console.log(myimglink, mydesc, myname);
    var whole = getEL("feeds");
    var myfeed = document.createElement("div");
    myfeed.classList.add("maincontent", "col-xs-12", "col-sm-6", "col-md-4", "col-lg-3");
    whole.prepend(myfeed);

    var photobox = document.createElement("div");
    myfeed.classList.add("photo-box");
    // myfeed.style.float = "left"
    myfeed.setAttribute("id", "dodel" + myname + "```" + my_date)

    myfeed.appendChild(photobox);


    var nameme = document.createElement("b");
    nameme.classList.add("description", "descname");
    nameme.innerHTML = "By " + myname;
    nameme.style.height = "3vh";
    nameme.style.fontWeight = 300;
    photobox.appendChild(nameme);

    var del = document.createElement("div");
    del.classList.add("description", myname.replace(/\s/g, '')
    );
    del.innerHTML = "DELETE";
    del.style.height = "0px";
    del.style.fontWeight = 300;
    del.style.float = "right";
    del.setAttribute("id", "del" + myname + "```" + my_date)
    del.style.display = "none"
    del.onclick = function () {
        delt(this.id);
    }
    photobox.appendChild(del);

    var imagewrap = document.createElement("div");
    imagewrap.classList.add("image-wrap");
    photobox.appendChild(imagewrap);


    var img = document.createElement("img");
    img.src = myimglink;
    img.classList.add("postimg")
    // img.style.maxHeight = "10vh";
    imagewrap.appendChild(img);


    var like = document.createElement("div");
    like.classList.add("likes");
    like.onclick = function () {
        liked(this.id, tlikes);
    }
    like.innerHTML = "Like" + tlikes;
    like.setAttribute("id", myname + "```" + my_date)
    imagewrap.appendChild(like);


    var desc = document.createElement("div");
    desc.classList.add("description", "mydesc");
    desc.innerHTML = mydesc
    photobox.appendChild(desc);

    var mydate = document.createElement("div");
    mydate.classList.add("date");
    mydate.innerHTML = my_date.slice(0, 16);
    photobox.appendChild(mydate);

}


function delt(myid) {
    socket.emit("delete", myid);
    getEL("do" + myid).style.display = "none";
}

function checkdel(name) {
    var ele = document.getElementsByClassName(name.replace(/\s/g, ''));
    for (var i = 0; i < ele.length; i++) {
        ele[i].style.display = "block";
    }
}

function seturl(id) {
    var fileInput = getEL(id);
    var reader = new FileReader();
    reader.readAsDataURL(fileInput.files[0]);

    reader.onload = function () {
        console.log(reader.result.length);//base64encoded string
        getEL("imglink").value = reader.result;
    };
    reader.onerror = function (error) {
        console.log('Error: ', error);
    };

}
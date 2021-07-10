

$(function() {

    //Set up instafeed
    var feed = new Instafeed({
        clientId: '97ae5f4c024c4a91804f959f43f2635f',
        target: 'instafeed',
        get: 'tagged',
        tagName: 'photographyportfolio',
        links: true,
        limit: 8,
        sortBy: 'most-recent',
        resolution: 'standard_resolution',
        template: '<div class="col-xs-12 col-sm-6 col-md-4 col-lg-3"><div class="photo-box"><div class="image-wrap"><a href="{{link}}"><img src="{{image}}"></a><div class="likes">{{likes}} Likes</div></div><div class="description">{{caption}}<div class="date">{{model.date}}</div></div></div></div>'
    });
    feed.run();

});

function liked(myid, tlikes){
    var likeBtn = document.getElementById(myid);
    if(likeBtn.style.color != "red"){
    document.getElementById(myid).style.color = "red";
    tlikes = parseInt(tlikes) + 1;
    likeBtn.innerHTML = "<b>♥ LIKED<b> " + tlikes;
    socket.emit('liked', myid);
    }else{
        tlikes = parseInt(tlikes);
        likeBtn.innerHTML = "<b>Like</b> " + tlikes;
        document.getElementById(myid).style.color = "white";
        socket.emit('unliked', myid);

    }
}
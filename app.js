/**
 * Created by dcorns on 7/8/14.
 */
var timerID = 0;
var paused = false;
window.addEventListener("load",windowLoaded(),false);

function windowLoaded() {
  app();
}
function app(){
  var slideshow = {};
  var slideArray = [];
  var canvas = document.getElementById("show");
  var stage = canvas.getContext('2d');
  var currentslide = 0;
  var nextslide = 0;
  var slidecount = 0;
  var loadCount = 1;
  var slidechanged = true;
  var currentslideframecount = 0;
  var slidetransitionframes = 0;
  var transitionstepcount = 0;
  var transitionoffset = 1;
  var fadeout = 100;
  var fadein = 0;
  var framecount = 0;
  var slidetime = 0;
  var showtime = 0;
  pagecontrol();

  function pagecontrol() {
    var showdata = new XMLHttpRequest();
    showdata.open("GET", "add.xml", false);
    showdata.send();
    var showXML = showdata.responseXML;
    //populate slideshow with showXML data
    slideshow.ad = getAd(showXML);
    slideshow.timeline = getTimeline(showXML);
    slideshow.imgs = getImages(showXML);
    //add more settings to slideshow object
    slideshow.transition = "crossfade";       //if transitions are added these settings should be combined into one object as part of a transition array
    slideshow.transsteps = 100; //How many states the transition goes through total
    slideshow.transratio = .2; //percent in decimal of two slide's frames used by the transition
    slideshow.timeline.pos = {"x": 0, "y": 0}
    slideshow.framerate = 40;
    slideshow.totalframes = Math.round(slideshow.timeline.duration/slideshow.framerate);
    slideshow.loop = true;
    buildShow();
  }

  function getAd(xmldoc) {
    var adver = xmldoc.getElementsByTagName("ad");
    var asize = adver[0].getAttribute("size");
    var ysize = asize.substr(0, asize.indexOf("x"));
    var xsize = asize.substr(asize.indexOf('x') + 1);
    var abackground = adver[0].getAttribute("background");
    return {"background": abackground, "size": {"x": xsize, "y": ysize}};
  }

  function getTimeline(xmldoc) {
    var tl = xmldoc.getElementsByTagName("timeline");
    var duration = tl[0].getAttribute("duration");
    return {"duration": duration};
  }

  function getImages(xmldoc) {
    var result = [];
    var imgs = xmldoc.getElementsByTagName("image");
    for (var c = 0; c < imgs.length; c++) {
      result[c] = {};
      result[c].url = imgs[c].getAttribute("url");
      result[c].startTime = imgs[c].getAttribute("startTime");
      result[c].endTime = imgs[c].getAttribute("endTime");
      result[c].x = imgs[c].getAttribute("x");
      result[c].y = imgs[c].getAttribute("y");
      result[c].width = imgs[c].getAttribute("width");
      result[c].height = imgs[c].getAttribute("height");
    }
    return result;
  }

  function buildShow() {
    canvas.width = slideshow.ad.size.x;
    canvas.height = slideshow.ad.size.y;
    for (var c = 0; c < slideshow.imgs.length; c++) {
      slideArray[c] = new Image();
      slideArray[c].src = slideshow.imgs[c].url;
      slideArray[c].alt = slideshow.imgs[c].url;
      slideArray[c].onload = imagesloaded;
    }
  }

  function imagesloaded() {
    if (slideArray.length === loadCount) {
      slidecount = slideArray.length;
      playshow();
    }
    loadCount++;
  }

  function playshow() {
    stage.drawImage(slideArray[currentslide], 0, 0, 300, 250);
    timerID = setInterval(drawframe, slideshow.framerate);
  }

  function drawslide(sliderank) {
    stage.drawImage(slideArray[sliderank], 0, 0, 300, 250);
  }

  function drawframe(){
    stage.fillStyle = slideshow.ad.background;
    stage.fillRect(0, 0, slideshow.ad.size.y, slideshow.ad.size.x);
    slidecontrol();
    framecount++;
    if(framecount > slideshow.totalframes && (!(slideshow.loop))){
      clearInterval(timerID);
    }
    else{
      framecount = 0;
    }
  }

  function slidecontrol(){
    if(slidechanged){
      var slideframecount = Math.round(slideshow.imgs[currentslide].endTime/slideshow.framerate);
      currentslideframecount = slideframecount;
      setnextslide();
      var nextslideframecount = Math.round(slideshow.imgs[nextslide].endTime/slideshow.framerate);
      //slidetransitionframes is half the number of frames to be used for a transition or frames per slide used
      slidetransitionframes = Math.round(((slideframecount + nextslideframecount) * slideshow.transratio)/2);
      slidechanged = false;
    }
    if(currentslideframecount <= slidetransitionframes || (currentslideframecount > (currentslideframecount - slidetransitionframes))){
      drawslide(transitions());
    }
    else{
      drawslide(currentslide);
    }
    currentslideframecount--;
    if(currentslideframecount < 1){
      slidechanged = true;
      transitionstepcount = 0;
      currentslide = nextslide;
    }
  }

  function transitions(){
    var transitionoffset = slideshow.transsteps / (slidetransitionframes * 2) ;
    transitionstepcount++;
      switch (slideshow.transition) {
        //draw current slide with reduced alpha, then draw next slide with increased alpha
        case "crossfade":
          if(transitionstepcount === 1){
            fadein = 0; fadeout = 100;
          }
          if (transitionstepcount % 100) {
            fadein = fadein + transitionoffset;
            if (fadein > 100) {
              stage.globalAlpha = 1
            }
            else {
              stage.globalAlpha = fadein * .01
            }
            return nextslide;
          }
          else {
            fadeout = fadeout - transitionoffset;
            if (fadeout < 0) {
              stage.globalAlpha = 0
            }
            else {
              stage.globalAlpha = fadeout * .2;
            }
            return currentslide;
          }

          break;
      }

  }

  function setnextslide(){
    if(currentslide === slideArray.length - 1){
      nextslide = 0;
    }
    else{
      nextslide=currentslide + 1;
    }
  }

}

function pauseshow() {
  if (paused) {
    paused = false;
    resumeshow();
  }
  else{
    clearInterval(timerID);
    paused = true;
    var pa = document.getElementsByClassName("pause");
    var pac = pa.getAttribute("class");
    alert(pac);
   // pa.classList.add("pauseclicked");
    console.log(pa);
  }

}
function resumeshow() {
  alert('resume show called');
}
function stopshow() {
  clearInterval(timerID);
}

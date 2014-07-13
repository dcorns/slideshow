/**
 * Created by dcorns on 7/8/14.
 */


window.addEventListener("load",windowLoaded(),false);

function windowLoaded() {
  app();
}
function app(){
  var slideshow = {};
  var slideArray = [];
  var canvas = document.getElementById("show");
  var stage = canvas.getContext('2d');
// Interval timer ID's
  var secondsID = 0;
  var timerID = 0;
// Timeline counters
  var seconds = 0;
  var minutes = 0;
  var slideseconds = 0;
  var slideminutes = 0;
  var slidetime = 0;
  var showtime = 0;
// Image load counter
  var loadCount = 1;
// Standard slide and frame counters
  var framecount = 0;
  var currentslide = 0;
  var nextslide = 0;
  var slidecount = 0;
  var currentslideframecount = 0;
// Transition counters
  var slidetransitionframes = 0;
  var transitionstepcount = 0;
  var fadeout = 100;
  var fadein = 0;
// Setters
  var transitionoffset = 1;
  var slidechanged = true;
  var paused = false;
  var stopped = false;
  pagecontrol();
//*********************************************Load Data****************************************************************
  function pagecontrol() {
    //Load the data file into showXML
    var showdata = new XMLHttpRequest();
    showdata.open("GET", "add.xml", false);
    showdata.send();
    var showXML = showdata.responseXML;
    //populate the slideshow object with showXML data and add other objects not currently provided by XML
    //added the transition objects for future implementation of multiple transition options
    //if transitions are added these settings should be combined into one object as part of a transition array
    slideshow.transition = "fade";
    slideshow.transsteps = 100; //How many states the transition goes through total
    slideshow.transratio = .2; //percent in decimal of the slide frames to be shared by the slides used by the transition
    slideshow.framerate = 40; //bad name it is actually the number of milliseconds between stage refreshes
    slideshow.loop = false; //if true, the slide show will repeat until stop is selected
    slideshow.ad = getAd(showXML);
    slideshow.timeline = getTimeline(showXML);
    slideshow.totalframes = Math.round(slideshow.timeline.duration/slideshow.framerate); //total frames in the show
    slideshow.imgs = getImages(showXML);

//************************************************Slide Show Calls******************************************************
    buildShow();
    makeElements();
  }
//************************************************Data Load Functions***************************************************
  //Create the slideshow.Ad
  function getAd(xmldoc) {
    var adver = xmldoc.getElementsByTagName("ad");
    var asize = adver[0].getAttribute("size");
    var xsize = asize.substr(0, asize.indexOf("x"));
    var ysize = asize.substr(asize.indexOf('x') + 1);
    var abackground = adver[0].getAttribute("background");
    return {"background": abackground, "size": {"x": xsize, "y": ysize}};
  }
  //Create slideshow.timeline
  function getTimeline(xmldoc) {
    var tl = xmldoc.getElementsByTagName("timeline");
    var duration = tl[0].getAttribute("duration");
    return {"duration": duration};
  }
  //Create slideshow.imgs
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
      result[c].framecount = Math.round(result[c].endTime/slideshow.framerate);
    }
    return result;
  }
//**********************************************Setup Canvas And Images*************************************************
  //get settings from slideshow and create the slideArray which contains all the image nodes for the show
  function buildShow() {
    canvas.width = slideshow.ad.size.x;
    canvas.height = slideshow.ad.size.y;
    stage.fillStyle = slideshow.ad.background;
    stage.fillRect(0, 0, slideshow.ad.size.x, slideshow.ad.size.y);
    for (var c = 0; c < slideshow.imgs.length; c++) {
      slideArray[c] = new Image();
      slideArray[c].src = slideshow.imgs[c].url;
      slideArray[c].alt = slideshow.imgs[c].url;
      slideArray[c].onload = imagesloaded;
    }
  }
//##################################################Starting Point######################################################
  //called after each image is loaded and when all images are loaded, starts the show
  function imagesloaded() {
    if (slideArray.length === loadCount) {
      slidecount = slideArray.length;
      playshow();
    }
    loadCount++;
  }

//************************************************Slide Show Control and Logic******************************************
  //First slide drawn here
//added 14 to the x provided by the the xml to center the images since they are slightly smaller than the canvas.
  //Needs to be factored in if common
  function playshow() {
    secondsID = setInterval(incrementTimer, 1000);
    timerID = setInterval(drawframe, slideshow.framerate);
  }

//Determines when to end the show
  function drawframe(){
    if(framecount > slideshow.totalframes){
      framecount = 0;
      if (!(slideshow.loop)) {
        clearInterval(timerID);
        clearInterval(secondsID);
        stage.globalAlpha = 1;
        stage.fillRect(0, 0, slideshow.ad.size.x, slideshow.ad.size.y);
        stopped = true;
        resetTimeLine();
        return;
      }
      resetTimeLine();
    }
    slidecontrol();
    framecount++;
  }
//Determine when to change slides and when to call transitions
  function slidecontrol(){
    if(slidechanged){
      currentslideframecount = slideshow.imgs[currentslide].framecount;
      setnextslide();
      var nextslideframecount = slideshow.imgs[nextslide].framecount;
      slidetransitionframes = Math.round(((currentslideframecount + nextslideframecount) * slideshow.transratio));
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
      slideseconds = 0;
      transitionstepcount = 0;
      currentslide = nextslide;
    }
  }

//All slides except the first (playshow()) drawn here
  function drawslide(sliderank) {
    stage.drawImage(slideArray[sliderank], slideArray[currentslide].x, slideArray[currentslide].y, slideArray[currentslide].width,slideArray[currentslide].height);
  }

//Structured for the addition of multiple transition choices
  function transitions(){
    var transitionoffset = slideshow.transsteps / slidetransitionframes ;
    transitionstepcount++;
    if(transitionstepcount === 1){
      fadein = 0; fadeout = 100;
    }
      switch (slideshow.transition) {
        //draw current slide with reduced alpha, then draw next slide with increased alpha
        case "lightning":
          if (transitionstepcount % 2) {
            fadein = fadein + transitionoffset;
            if (fadein > 100) {
              stage.globalAlpha = 1;
            }
            else {
              stage.globalAlpha = fadein * .01;
            }
            return nextslide;
          }
          else {
            fadeout = fadeout - transitionoffset;
            if (fadeout < 0) {
              stage.globalAlpha = 0;
            }
            else {
              stage.globalAlpha = fadeout * .2;
            }
            return currentslide;
          }
          break;

        case "fade":
          fadein++;
          if (fadein > 100) {
            stage.globalAlpha = 1;
          }
          else {
            stage.globalAlpha = fadein * .01;
          }
          return nextslide;

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

//****************************************************UI Elements and Logic*********************************************


  function makeElements(){
    makePauseBtn();
    makeStopBtn();
    makePlayBtn();
    makeLoopBtn();
    addElement("main", makeLabel("lblshowtimerMin","showtimerMin","00"));
    addElement("main", makeLabel("lblshowtimerSec","showtimerSec","00"));
    addElement("main", makeLabel("lbldelim","delim","|"));
    addElement("main", makeLabel("lblslidetimerMin","slidetimerMin","00"));
    addElement("main", makeLabel("lblslidetimerSec","slidetimerSec","00"));
    addElement("main", makeLabel("lblslidetimerdelim","tdel1",":"));
    addElement("main", makeLabel("lblshowtimerdelim","tdel2",":"));
    addElement("main", makeSelect("seltransition","seltransition"));
  }

  function makeButton(id, cls, txt, clk){
    var btn = document.createElement("button");
    btn.className = cls;
    var txtnode = document.createTextNode(txt);
    btn.appendChild(txtnode);
    btn.value = txt;
    btn.onclick = clk;
    btn.id = id;
    return btn;
  }

  function makeLabel(id, cls, txt){
    var lbl = document.createElement("label");
    lbl.className = cls;
    var txtnode = document.createTextNode(txt);
    lbl.appendChild(txtnode);
    lbl.id = id;
    return lbl;
  }

  function makeSelect(id, cls){
    var sel = document.createElement("select");
    var opt1 = document.createElement("option");
    var txtnode1 = document.createTextNode("fade");
    opt1.appendChild(txtnode1);
    var opt2 = document.createElement("option");
    var txtnode2 = document.createTextNode("lightning");
    opt2.appendChild(txtnode2);
    sel.className = cls;
    sel.id = id;
    sel.appendChild(opt1);
    sel.appendChild(opt2);
    sel.onchange = function(){
      slideshow.transition = document.getElementById("seltransition").value;
    };
    return sel;
  }

  function makeLoopBtn(){
    addElement("main", makeButton("btnloop","loop","L",function(){
      if(slideshow.loop){
        slideshow.loop = false;
        document.getElementById("btnloop").className = "loop";
      }
      else{
        slideshow.loop = true;
        document.getElementById("btnloop").className = "loopon";
      }
    }));
  }

  function makePauseBtn(){
    var btnpause = makeButton("btnpause","pause", "", function (){
      if(!(stopped)) {
        if (paused) {
          paused = false;
          playshow();
        }
        else {
          clearInterval(timerID);
          clearInterval(secondsID);
          paused = true;
        }
      }
    });

    addElement("main", btnpause);
  }

  function makeStopBtn(){
    var btnstop = makeButton("btnstop", "stop", "", function (){
      if(!(stopped)) {
        stopped = true;
        clearInterval(timerID);
        clearInterval(secondsID);
        stage.globalAlpha = 1;
        stage.fillRect(0, 0, slideshow.ad.size.x, slideshow.ad.size.y);
        resetTimeLine();
      }
    });

    addElement("main", btnstop);
  }

  function makePlayBtn(){
    var btnplay = makeButton("btnplay", "play", "", function (){
      if(stopped) {
        stopped = false;
        paused = false;
        resetShowCounters();
        playshow();
      }
    });

    addElement("main", btnplay);
  }

  function addElement(pelem, elemtoadd){
    var elem = document.getElementById(pelem);
    elem.appendChild(elemtoadd);
  }

//********************************************Time Line Control And UI**************************************************
  //Note: slideseconds are reset in slidecontrol() when the slide changes
  function incrementTimer(){
    seconds++;
    slideseconds++;
    //determine minutes and seconds in preparation for time line display
    switch(seconds){
      case 60:
        minutes++;
        seconds=0;
        break;
      case 10000:
        minutes = 0;
        seconds = 0;
    }

    switch(slideseconds){
      case 60:
        slideminutes++;
        slideseconds = 0;
        break;
      case 10000:
        slideminutes = 0;
        slideseconds = 0;
    }
    showSlideSeconds();
    showShowSeconds();
  }

  function showSlideSeconds(){
    var lblsec = document.getElementById("lblslidetimerSec");
    if(slideseconds > 9){
      lblsec.innerHTML = slideseconds.toString().substr(this.length - 2);
    }
    else{
      lblsec.innerHTML = "0"+slideseconds.toString();
    }
    var lblmin = document.getElementById("lblslidetimerMin");
    if(slideminutes > 9){
      lblmin.innerHTML = slideminutes.toString().substr(this.length - 2);
    }
    else{
      lblmin.innerHTML = "0"+slideminutes.toString();
    }
  }

  function showShowSeconds(){
    var lblsec = document.getElementById("lblshowtimerSec");
    if(seconds > 9){
      lblsec.innerHTML = seconds.toString().substr(this.length - 2);
    }
    else{
      lblsec.innerHTML = "0"+seconds.toString();
    }
    var lblmin = document.getElementById("lblshowtimerMin");
    if(minutes > 9){
      lblmin.innerHTML = minutes.toString().substr(this.length - 2);
    }
    else{
      lblmin.innerHTML = "0"+minutes.toString();
    }
  }
  // set time counters seconds to negative values and minutes to zero then call incrementTimer() to advance seconds to
  // zero and call display functions
  function resetTimeLine(){
    seconds = -1;
    minutes = 0;
    slideseconds = -1;
    slideminutes = 0;
    incrementTimer();
  }

  function resetShowCounters(){
    currentslide = 0;
    nextslide = 0;
    slidecount = 0;
    framecount = 0;
    seconds = 0;
    minutes = 0;
    slideseconds = 0;
    slideminutes = 0;
    secondsID = 0;
    loadCount = 1;
    slidechanged = true;
    currentslideframecount = 0;
    slidetransitionframes = 0;
    transitionstepcount = 0;
    transitionoffset = 1;
    fadeout = 100;
    fadein = 0;
    slidetime = 0;
    showtime = 0;
  }

}
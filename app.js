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
  var currentslide = 0;
  var nextslide = 0;
  var slidecount = 0;
  var framecount = 0;
  var seconds = 0;
  var minutes = 0;
  var slideseconds = 0;
  var slideminutes = 0;
  var secondsID = 0;
  var loadCount = 1;
  var slidechanged = true;
  var currentslideframecount = 0;
  var slidetransitionframes = 0;
  var transitionstepcount = 0;
  var transitionoffset = 1;
  var fadeout = 100;
  var fadein = 0;
  var slidetime = 0;
  var showtime = 0;
  var timerID = 0;
  var paused = false;
  var stopped = false;
  pagecontrol();
//*********************************************Load Data****************************************************************
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
    slideshow.timeline.pos = {"x": 0, "y": 0};
    slideshow.framerate = 40; //frames per slide (not really a frame rate
    slideshow.totalframes = Math.round(slideshow.timeline.duration/slideshow.framerate);
    slideshow.loop = true;
//************************************************Slide Show Calls******************************************************
    buildShow();
    makeElements();
  }
//************************************************Data Load Functions***************************************************
  function getAd(xmldoc) {
    var adver = xmldoc.getElementsByTagName("ad");
    var asize = adver[0].getAttribute("size");
    var xsize = asize.substr(0, asize.indexOf("x"));
    var ysize = asize.substr(asize.indexOf('x') + 1);
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
//**********************************************Setup Canvas And Images*************************************************
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
    stage.drawImage(slideArray[currentslide], slideArray[currentslide].x + 14, slideArray[currentslide].y,  slideArray[currentslide].width,slideArray[currentslide].height);
    secondsID = setInterval(incrementTimer, 1000);
    timerID = setInterval(drawframe, slideshow.framerate);
  }
//All other slides drawn here
  function drawslide(sliderank) {
    stage.drawImage(slideArray[sliderank], slideArray[currentslide].x + 14, slideArray[currentslide].y, slideArray[currentslide].width,slideArray[currentslide].height);
  }
//Frame and drawing control
  function drawframe(){
// console.log("120 framecount: "+framecount);
    framecount++;
    if(framecount > slideshow.totalframes){
      framecount = 0;
      if (!(slideshow.loop)) {
        clearInterval(timerID);
        stage.fillRect(0, 0, slideshow.ad.size.x, slideshow.ad.size.y);
        stopped = true;
        clearInterval(timerID);
        clearInterval(secondsID);
        resetTimeline();
      }
      resetTimeline();
      resetShowCounters();
      playshow();
    }
    slidecontrol();
  }
//Determine when to change slides and when to call transitions
  function slidecontrol(){
    if(slidechanged){
      var slideframecount = Math.round(slideshow.imgs[currentslide].endTime/slideshow.framerate);
      currentslideframecount = slideframecount;
      setnextslide();
      var nextslideframecount = Math.round(slideshow.imgs[nextslide].endTime/slideshow.framerate);
      //slidetransitionframes is half the number of frames to be used for a transition or frames per slide used
      slidetransitionframes = Math.round(((slideframecount + nextslideframecount) * slideshow.transratio)/2);
      slidechanged = false;
      console.log("157 currenslideframecount: "+currentslideframecount);
    }
    if(currentslideframecount <= slidetransitionframes || (currentslideframecount > (currentslideframecount - slidetransitionframes))){
      drawslide(transitions());
    }
    else{
      drawslide(currentslide);
    }
    //Slide duration is a countdown
//    console.log("164 currentslideframecount:"+currentslideframecount);
    currentslideframecount--;
    if(currentslideframecount < 1){
      slidechanged = true;
      //reset slideseconds
      slideseconds = 0;
      transitionstepcount = 0;
      currentslide = nextslide;
    }
  }
//Structured for the addition of multiple transition choices
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

  function makeElements(){
    makePauseBtn();
    makeStopBtn();
    makePlayBtn();
    addElement("main", makeLabel("lblshowtimer1","showtimer1","00"));
    addElement("main", makeLabel("lblshowtimer2","showtimer2","00"));
    addElement("main", makeLabel("lbldelim","delim","|"));
    addElement("main", makeLabel("lblslidetimer1","slidetimer1","00"));
    addElement("main", makeLabel("lblslidetimer2","slidetimer2","00"));
    addElement("main", makeLabel("lblslidetimerdelim","tdel1",":"));
    addElement("main", makeLabel("lblshowtimerdelim","tdel2",":"));

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
        stage.globalAlpha = 1;
        stage.fillRect(0, 0, slideshow.ad.size.x, slideshow.ad.size.y);
        resetTimeline();
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
    //determine minutes and seconds in preparation for timeline display
    switch(seconds){
      case 60:
        minutes++;
        seconds=0;
        break;
      case 10000:
        turnOverTime("Total");
        return;
    }

    switch(slideseconds){
      case 60:
        slideminutes++;
        slideseconds = 0;
        break;
      case 10000:
        turnOverTime("Slide");
        return;
    }
    showSlideSeconds();
    showShowSeconds();
  }

  function resetTimeline(){
   resetShowTimer();
   resetSlideTimer();
   clearInterval(secondsID);
  }

  function showSlideSeconds(){
    var lblsec = document.getElementById("lblslidetimer2");
    if(slideseconds > 9){
      lblsec.innerHTML = slideseconds.toString().substr(this.length - 2);
    }
    else{
      lblsec.innerHTML = "0"+slideseconds.toString();
    }
    var lblmin = document.getElementById("lblslidetimer1");
    if(slideminutes > 9){
      lblmin.innerHTML = slideminutes.toString().substr(this.length - 2);
    }
    else{
      lblmin.innerHTML = "0"+slideminutes.toString();
    }
  }

  function showShowSeconds(){
    var lblsec = document.getElementById("lblshowtimer2");
    if(seconds > 9){
      lblsec.innerHTML = seconds.toString().substr(this.length - 2);
    }
    else{
      lblsec.innerHTML = "0"+seconds.toString();
    }
    var lblmin = document.getElementById("lblshowtimer1");
    if(minutes > 9){
      lblmin.innerHTML = minutes.toString().substr(this.length - 2);
    }
    else{
      lblmin.innerHTML = "0"+minutes.toString();
    }
  }

  function turnOverTime(overtime){
    if(overtime === "Slide"){
      resetSlideTimer();
    }
    else{
      resetShowTimer();
    }
  }

  function resetSlideTimer(){
    var slblsec = document.getElementById("lblslidetimer2");
    var slblmin = document.getElementById("lblslidetimer1");
    slblsec.innerHTML = "00";
    slblmin.innerHTML = "00";
    slideminutes = 0;
    slideseconds = 0;
  }

  function resetShowTimer(){
    var tlblsec = document.getElementById("lblshowtimer2");
    var tlblmin = document.getElementById("lblshowtimer1");
    tlblsec.innerHTML = "00";
    tlblmin.innerHTML = "00";
    seconds = 0;
    minutes = 0;
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
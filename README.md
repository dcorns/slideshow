slideshow
=========

An HTML5 canvas slide show for the enterprise

General Purpose: To make a request for an XML file containing information for the production of a slide show and upon
receipt of the file running the show. At a minimum providing time line information and the ability for users to stop,
play and pause the show.

Program Explanation:
    Files: Add.xml - A sample file of XML data representing what would be expected from a server or local directory.
           index.html - A basic html5 page with div and canvas elements to provide an environment in which app.js will
                        run.
           style.css - Contains visualization and positioning data for the user interface.
           app.js - The application.
           
    Overview of program flow:
        6-10 Instructions for executing the app function after the window of index.html successfully loads.
        The rest of the program runs within the app() wrapper starting at line 11.
        
        12-15 Declarations of main objects; slideshow (main settings object), slidearray (contains the slide images),
        canvas, and the canvas context "stage"
        
        16-43 Declarations of other variables global to app()
        
        45 pagecontrol() is called:
            
            47 Pagecontrol function emulates an http request, puts the XML file into the slideshow object using getAd(),
            getTimeline() and getImages() and adds additional objects to slideshow that are not currently provided
            by the data file.
            Then it calls buildshow() which sets up the canvas, sets the initial background, creates the image nodes
            and populates slideArray with them.
            Then it calls makeElements, which in turn calls makePauseBtn(), makeStopBtn(), makePlayBtn(), and adds the 
            time line display elements to <div id='main'>
            
        119 imagesloaded() Fires each time an image is loaded and when var loadcount equals the number of images in the
        show, it calls playshow() which draws the first image on the canvas and starts intervals for incrementTimer and 
        drawframe using 1000 and slideshow.framerate respectively for interval times.
        
            327 incrementTimer() is responsible for controlling the time line.
                Advances seconds and slideseconds every 1000ms. Advances minutes and slideminutes 60000ms and resets
                 seconds and minutes to zero if seconds reaches 10000 and sets slideseconds and slideminutes to zero if 
                 slideseconds reaches 10000. Then showSlideSeconds() and showShowSeconds() are called to format and 
                 display these values to the UI.
                 
            
            138 drawframe() is where all the slide drawing and transitions trigger.
                Using framecount and slideshow.totalframes it determines if all the slides in the series have run and if
                they have not it will call slidecontrol to proccess the next slide. If all the slide have run it will
                reset framecount to zero and check slideshow.loop if loop is true it will call resetTimeLine and then
                slidecontrol. Otherwise it will stop the intervals, set stop to true, calls resetTimeLine and returns.
                
                    156 slidecontrol() controls how the slides will be displayed
                    If the slidechanged flag is set the currentframecount is set to current slide's frame count, 
                    setnextslide() is called which sets nextslide to one more than currentslide or to the first slide in
                    the show (zero). Then nextslide's framecount is loaded into nextslideframecount, transitionframe are
                    calculated based on the slide frame counts and slidechanged is set to false.
                    Then currentframecount is checked against transition frames to see if transition frames need to run
                    and if so transitions() is sent to drawslide(). If not then currentslide is sent to drawslide()
                    Then currentslide is decremented and afterwards tested for less than zero and if so replaced with
                    nextslide value, slidechange flag is set and slideseconds, transitionstepcount are set to zero.
        
            183 transitions()
                transitionoffset is the ratio of the required steps for a transition to complete to the number of
                transition frames.
                The transitionstepcount is checked for the value of one to reset any variable trackers for a given
                transition that require it at the start of transitions
        
           
        
    

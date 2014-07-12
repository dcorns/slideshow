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
            getTimeline() and getImages(). Then it adds additional objects to slideshow that are not currently provided
            by the data file.
            Then it calls buildshow() which sets up the canvas, sets the initial background, creates the image nodes
            and populates slideArray with them.
            Then it calls makeElements, which in turn calls makePauseBtn(), makeStopBtn(), makePlayBtn(), and adds the 
            time line display elements to <div id='main'>
            
        119 imagesloaded() Fires each time an image is loaded and when var loadcount equals the number of images in the
        show, it calls playshow() which draws the first image on the canvas and starts intervals for incrementTimer and 
        drawframe using 1000 and slideshow.framerate respectively for interval times.
        
            327 incrementTimer() is responsible for controlling the time line.
            
            138 drawframe() is where all the slide drawing and transitions trigger.
                
        
        
           
        
    

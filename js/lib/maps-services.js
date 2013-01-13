/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */


/**
 * @requires OpenLayers/Layer.js
 * @requires OpenLayers/Util.js
 */

/**
 * Class: OpenLayers.Layer.EventPane
 * Base class for 3rd party layers, providing a DOM element which isolates
 * the 3rd-party layer from mouse events.
 * Only used by Google layers.
 *
 * Automatically instantiated by the Google constructor, and not usually instantiated directly.
 *
 * Create a new event pane layer with the
 * <OpenLayers.Layer.EventPane> constructor.
 * 
 * Inherits from:
 *  - <OpenLayers.Layer>
 */
OpenLayers.Layer.EventPane = OpenLayers.Class(OpenLayers.Layer, {
    
    /**
     * APIProperty: smoothDragPan
     * {Boolean} smoothDragPan determines whether non-public/internal API
     *     methods are used for better performance while dragging EventPane 
     *     layers. When not in sphericalMercator mode, the smoother dragging 
     *     doesn't actually move north/south directly with the number of 
     *     pixels moved, resulting in a slight offset when you drag your mouse 
     *     north south with this option on. If this visual disparity bothers 
     *     you, you should turn this option off, or use spherical mercator. 
     *     Default is on.
     */
    smoothDragPan: true,

    /**
     * Property: isBaseLayer
     * {Boolean} EventPaned layers are always base layers, by necessity.
     */ 
    isBaseLayer: true,

    /**
     * APIProperty: isFixed
     * {Boolean} EventPaned layers are fixed by default.
     */ 
    isFixed: true,

    /**
     * Property: pane
     * {DOMElement} A reference to the element that controls the events.
     */
    pane: null,


    /**
     * Property: mapObject
     * {Object} This is the object which will be used to load the 3rd party library
     * in the case of the google layer, this will be of type GMap, 
     * in the case of the ve layer, this will be of type VEMap
     */ 
    mapObject: null,


    /**
     * Constructor: OpenLayers.Layer.EventPane
     * Create a new event pane layer
     *
     * Parameters:
     * name - {String}
     * options - {Object} Hashtable of extra options to tag onto the layer
     */
    initialize: function(name, options) {
        OpenLayers.Layer.prototype.initialize.apply(this, arguments);
        if (this.pane == null) {
            this.pane = OpenLayers.Util.createDiv(this.div.id + "_EventPane");
        }
    },
    
    /**
     * APIMethod: destroy
     * Deconstruct this layer.
     */
    destroy: function() {
        this.mapObject = null;
        this.pane = null;
        OpenLayers.Layer.prototype.destroy.apply(this, arguments); 
    },

    
    /**
     * Method: setMap
     * Set the map property for the layer. This is done through an accessor
     * so that subclasses can override this and take special action once 
     * they have their map variable set. 
     *
     * Parameters:
     * map - {<OpenLayers.Map>}
     */
    setMap: function(map) {
        OpenLayers.Layer.prototype.setMap.apply(this, arguments);
        
        this.pane.style.zIndex = parseInt(this.div.style.zIndex) + 1;
        this.pane.style.display = this.div.style.display;
        this.pane.style.width="100%";
        this.pane.style.height="100%";
        if (OpenLayers.BROWSER_NAME == "msie") {
            this.pane.style.background = 
                "url(" + OpenLayers.Util.getImageLocation("blank.gif") + ")";
        }

        if (this.isFixed) {
            this.map.viewPortDiv.appendChild(this.pane);
        } else {
            this.map.layerContainerDiv.appendChild(this.pane);
        }

        // once our layer has been added to the map, we can load it
        this.loadMapObject();
    
        // if map didn't load, display warning
        if (this.mapObject == null) {
            this.loadWarningMessage();
        }
    },

    /**
     * APIMethod: removeMap
     * On being removed from the map, we'll like to remove the invisible 'pane'
     *     div that we added to it on creation. 
     * 
     * Parameters:
     * map - {<OpenLayers.Map>}
     */
    removeMap: function(map) {
        if (this.pane && this.pane.parentNode) {
            this.pane.parentNode.removeChild(this.pane);
        }
        OpenLayers.Layer.prototype.removeMap.apply(this, arguments);
    },
  
    /**
     * Method: loadWarningMessage
     * If we can't load the map lib, then display an error message to the 
     *     user and tell them where to go for help.
     * 
     *     This function sets up the layout for the warning message. Each 3rd
     *     party layer must implement its own getWarningHTML() function to 
     *     provide the actual warning message.
     */
    loadWarningMessage:function() {

        this.div.style.backgroundColor = "darkblue";

        var viewSize = this.map.getSize();
        
        var msgW = Math.min(viewSize.w, 300);
        var msgH = Math.min(viewSize.h, 200);
        var size = new OpenLayers.Size(msgW, msgH);

        var centerPx = new OpenLayers.Pixel(viewSize.w/2, viewSize.h/2);

        var topLeft = centerPx.add(-size.w/2, -size.h/2);            

        var div = OpenLayers.Util.createDiv(this.name + "_warning", 
                                            topLeft, 
                                            size,
                                            null,
                                            null,
                                            null,
                                            "auto");

        div.style.padding = "7px";
        div.style.backgroundColor = "yellow";

        div.innerHTML = this.getWarningHTML();
        this.div.appendChild(div);
    },
  
    /** 
     * Method: getWarningHTML
     * To be implemented by subclasses.
     * 
     * Returns:
     * {String} String with information on why layer is broken, how to get
     *          it working.
     */
    getWarningHTML:function() {
        //should be implemented by subclasses
        return "";
    },
  
    /**
     * Method: display
     * Set the display on the pane
     *
     * Parameters:
     * display - {Boolean}
     */
    display: function(display) {
        OpenLayers.Layer.prototype.display.apply(this, arguments);
        this.pane.style.display = this.div.style.display;
    },
  
    /**
     * Method: setZIndex
     * Set the z-index order for the pane.
     * 
     * Parameters:
     * zIndex - {int}
     */
    setZIndex: function (zIndex) {
        OpenLayers.Layer.prototype.setZIndex.apply(this, arguments);
        this.pane.style.zIndex = parseInt(this.div.style.zIndex) + 1;
    },
    
    /**
     * Method: moveByPx
     * Move the layer based on pixel vector. To be implemented by subclasses.
     *
     * Parameters:
     * dx - {Number} The x coord of the displacement vector.
     * dy - {Number} The y coord of the displacement vector.
     */
    moveByPx: function(dx, dy) {
        OpenLayers.Layer.prototype.moveByPx.apply(this, arguments);
        
        if (this.dragPanMapObject) {
            this.dragPanMapObject(dx, -dy);
        } else {
            this.moveTo(this.map.getCachedCenter());
        }
    },

    /**
     * Method: moveTo
     * Handle calls to move the layer.
     * 
     * Parameters:
     * bounds - {<OpenLayers.Bounds>}
     * zoomChanged - {Boolean}
     * dragging - {Boolean}
     */
    moveTo:function(bounds, zoomChanged, dragging) {
        OpenLayers.Layer.prototype.moveTo.apply(this, arguments);

        if (this.mapObject != null) {

            var newCenter = this.map.getCenter();
            var newZoom = this.map.getZoom();

            if (newCenter != null) {

                var moOldCenter = this.getMapObjectCenter();
                var oldCenter = this.getOLLonLatFromMapObjectLonLat(moOldCenter);

                var moOldZoom = this.getMapObjectZoom();
                var oldZoom= this.getOLZoomFromMapObjectZoom(moOldZoom);

                if (!(newCenter.equals(oldCenter)) || newZoom != oldZoom) {

                    if (!zoomChanged && oldCenter && this.dragPanMapObject && 
                        this.smoothDragPan) {
                        var oldPx = this.map.getViewPortPxFromLonLat(oldCenter);
                        var newPx = this.map.getViewPortPxFromLonLat(newCenter);
                        this.dragPanMapObject(newPx.x-oldPx.x, oldPx.y-newPx.y);
                    } else {
                        var center = this.getMapObjectLonLatFromOLLonLat(newCenter);
                        var zoom = this.getMapObjectZoomFromOLZoom(newZoom);
                        this.setMapObjectCenter(center, zoom, dragging);
                    }
                }
            }
        }
    },


  /********************************************************/
  /*                                                      */
  /*                 Baselayer Functions                  */
  /*                                                      */
  /********************************************************/

    /**
     * Method: getLonLatFromViewPortPx
     * Get a map location from a pixel location
     * 
     * Parameters:
     * viewPortPx - {<OpenLayers.Pixel>}
     *
     * Returns:
     *  {<OpenLayers.LonLat>} An OpenLayers.LonLat which is the passed-in view
     *  port OpenLayers.Pixel, translated into lon/lat by map lib
     *  If the map lib is not loaded or not centered, returns null
     */
    getLonLatFromViewPortPx: function (viewPortPx) {
        var lonlat = null;
        if ( (this.mapObject != null) && 
             (this.getMapObjectCenter() != null) ) {
            var moPixel = this.getMapObjectPixelFromOLPixel(viewPortPx);
            var moLonLat = this.getMapObjectLonLatFromMapObjectPixel(moPixel);
            lonlat = this.getOLLonLatFromMapObjectLonLat(moLonLat);
        }
        return lonlat;
    },

 
    /**
     * Method: getViewPortPxFromLonLat
     * Get a pixel location from a map location
     *
     * Parameters:
     * lonlat - {<OpenLayers.LonLat>}
     *
     * Returns:
     * {<OpenLayers.Pixel>} An OpenLayers.Pixel which is the passed-in
     * OpenLayers.LonLat, translated into view port pixels by map lib
     * If map lib is not loaded or not centered, returns null
     */
    getViewPortPxFromLonLat: function (lonlat) {
        var viewPortPx = null;
        if ( (this.mapObject != null) && 
             (this.getMapObjectCenter() != null) ) {

            var moLonLat = this.getMapObjectLonLatFromOLLonLat(lonlat);
            var moPixel = this.getMapObjectPixelFromMapObjectLonLat(moLonLat);
        
            viewPortPx = this.getOLPixelFromMapObjectPixel(moPixel);
        }
        return viewPortPx;
    },

  /********************************************************/
  /*                                                      */
  /*               Translation Functions                  */
  /*                                                      */
  /*   The following functions translate Map Object and   */
  /*            OL formats for Pixel, LonLat              */
  /*                                                      */
  /********************************************************/

  //
  // TRANSLATION: MapObject LatLng <-> OpenLayers.LonLat
  //

    /**
     * Method: getOLLonLatFromMapObjectLonLat
     * Get an OL style map location from a 3rd party style map location
     *
     * Parameters
     * moLonLat - {Object}
     * 
     * Returns:
     * {<OpenLayers.LonLat>} An OpenLayers.LonLat, translated from the passed in 
     *          MapObject LonLat
     *          Returns null if null value is passed in
     */
    getOLLonLatFromMapObjectLonLat: function(moLonLat) {
        var olLonLat = null;
        if (moLonLat != null) {
            var lon = this.getLongitudeFromMapObjectLonLat(moLonLat);
            var lat = this.getLatitudeFromMapObjectLonLat(moLonLat);
            olLonLat = new OpenLayers.LonLat(lon, lat);
        }
        return olLonLat;
    },

    /**
     * Method: getMapObjectLonLatFromOLLonLat
     * Get a 3rd party map location from an OL map location.
     *
     * Parameters:
     * olLonLat - {<OpenLayers.LonLat>}
     * 
     * Returns:
     * {Object} A MapObject LonLat, translated from the passed in 
     *          OpenLayers.LonLat
     *          Returns null if null value is passed in
     */
    getMapObjectLonLatFromOLLonLat: function(olLonLat) {
        var moLatLng = null;
        if (olLonLat != null) {
            moLatLng = this.getMapObjectLonLatFromLonLat(olLonLat.lon,
                                                         olLonLat.lat);
        }
        return moLatLng;
    },


  //
  // TRANSLATION: MapObject Pixel <-> OpenLayers.Pixel
  //

    /**
     * Method: getOLPixelFromMapObjectPixel
     * Get an OL pixel location from a 3rd party pixel location.
     *
     * Parameters:
     * moPixel - {Object}
     * 
     * Returns:
     * {<OpenLayers.Pixel>} An OpenLayers.Pixel, translated from the passed in 
     *          MapObject Pixel
     *          Returns null if null value is passed in
     */
    getOLPixelFromMapObjectPixel: function(moPixel) {
        var olPixel = null;
        if (moPixel != null) {
            var x = this.getXFromMapObjectPixel(moPixel);
            var y = this.getYFromMapObjectPixel(moPixel);
            olPixel = new OpenLayers.Pixel(x, y);
        }
        return olPixel;
    },

    /**
     * Method: getMapObjectPixelFromOLPixel
     * Get a 3rd party pixel location from an OL pixel location
     *
     * Parameters:
     * olPixel - {<OpenLayers.Pixel>}
     * 
     * Returns:
     * {Object} A MapObject Pixel, translated from the passed in 
     *          OpenLayers.Pixel
     *          Returns null if null value is passed in
     */
    getMapObjectPixelFromOLPixel: function(olPixel) {
        var moPixel = null;
        if (olPixel != null) {
            moPixel = this.getMapObjectPixelFromXY(olPixel.x, olPixel.y);
        }
        return moPixel;
    },

    CLASS_NAME: "OpenLayers.Layer.EventPane"
});
/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Layer.js
 */

/**
 * Class: OpenLayers.Layer.FixedZoomLevels
 *   Some Layers will already have established zoom levels (like google 
 *    or ve). Instead of trying to determine them and populate a resolutions[]
 *    Array with those values, we will hijack the resolution functionality
 *    here.
 * 
 *   When you subclass FixedZoomLevels: 
 * 
 *   The initResolutions() call gets nullified, meaning no resolutions[] array 
 *    is set up. Which would be a big problem getResolution() in Layer, since 
 *    it merely takes map.zoom and indexes into resolutions[]... but....
 * 
 *   The getResolution() call is also overridden. Instead of using the 
 *    resolutions[] array, we simply calculate the current resolution based
 *    on the current extent and the current map size. But how will we be able
 *    to calculate the current extent without knowing the resolution...?
 *  
 *   The getExtent() function is also overridden. Instead of calculating extent
 *    based on the center point and the current resolution, we instead 
 *    calculate the extent by getting the lonlats at the top-left and 
 *    bottom-right by using the getLonLatFromViewPortPx() translation function,
 *    taken from the pixel locations (0,0) and the size of the map. But how 
 *    will we be able to do lonlat-px translation without resolution....?
 * 
 *   The getZoomForResolution() method is overridden. Instead of indexing into
 *    the resolutions[] array, we call OpenLayers.Layer.getExent(), passing in
 *    the desired resolution. With this extent, we then call getZoomForExtent() 
 * 
 * 
 *   Whenever you implement a layer using OpenLayers.Layer.FixedZoomLevels, 
 *    it is your responsibility to provide the following three functions:
 * 
 *   - getLonLatFromViewPortPx
 *   - getViewPortPxFromLonLat
 *   - getZoomForExtent
 * 
 *  ...those three functions should generally be provided by any reasonable 
 *  API that you might be working from.
 *
 */
OpenLayers.Layer.FixedZoomLevels = OpenLayers.Class({
      
  /********************************************************/
  /*                                                      */
  /*                 Baselayer Functions                  */
  /*                                                      */
  /*    The following functions must all be implemented   */
  /*                  by all base layers                  */
  /*                                                      */
  /********************************************************/
    
    /**
     * Constructor: OpenLayers.Layer.FixedZoomLevels
     * Create a new fixed zoom levels layer.
     */
    initialize: function() {
        //this class is only just to add the following functions... 
        // nothing to actually do here... but it is probably a good
        // idea to have layers that use these functions call this 
        // inititalize() anyways, in case at some point we decide we 
        // do want to put some functionality or state in here. 
    },
    
    /**
     * Method: initResolutions
     * Populate the resolutions array
     */
    initResolutions: function() {

        var props = ['minZoomLevel', 'maxZoomLevel', 'numZoomLevels'];
          
        for(var i=0, len=props.length; i<len; i++) {
            var property = props[i];
            this[property] = (this.options[property] != null)  
                                     ? this.options[property] 
                                     : this.map[property];
        }

        if ( (this.minZoomLevel == null) ||
             (this.minZoomLevel < this.MIN_ZOOM_LEVEL) ){
            this.minZoomLevel = this.MIN_ZOOM_LEVEL;
        }        

        //
        // At this point, we know what the minimum desired zoom level is, and
        //  we must calculate the total number of zoom levels. 
        //  
        //  Because we allow for the setting of either the 'numZoomLevels'
        //   or the 'maxZoomLevel' properties... on either the layer or the  
        //   map, we have to define some rules to see which we take into
        //   account first in this calculation. 
        //
        // The following is the precedence list for these properties:
        // 
        // (1) numZoomLevels set on layer
        // (2) maxZoomLevel set on layer
        // (3) numZoomLevels set on map
        // (4) maxZoomLevel set on map*
        // (5) none of the above*
        //
        // *Note that options (4) and (5) are only possible if the user 
        //  _explicitly_ sets the 'numZoomLevels' property on the map to 
        //  null, since it is set by default to 16. 
        //

        //
        // Note to future: In 3.0, I think we should remove the default 
        // value of 16 for map.numZoomLevels. Rather, I think that value 
        // should be set as a default on the Layer.WMS class. If someone
        // creates a 3rd party layer and does not specify any 'minZoomLevel', 
        // 'maxZoomLevel', or 'numZoomLevels', and has not explicitly 
        // specified any of those on the map object either.. then I think
        // it is fair to say that s/he wants all the zoom levels available.
        // 
        // By making map.numZoomLevels *null* by default, that will be the 
        // case. As it is, I don't feel comfortable changing that right now
        // as it would be a glaring API change and actually would probably
        // break many peoples' codes. 
        //

        //the number of zoom levels we'd like to have.
        var desiredZoomLevels;

        //this is the maximum number of zoom levels the layer will allow, 
        // given the specified starting minimum zoom level.
        var limitZoomLevels = this.MAX_ZOOM_LEVEL - this.minZoomLevel + 1;

        if ( ((this.options.numZoomLevels == null) && 
              (this.options.maxZoomLevel != null)) // (2)
              ||
             ((this.numZoomLevels == null) &&
              (this.maxZoomLevel != null)) // (4)
           ) {
            //calculate based on specified maxZoomLevel (on layer or map)
            desiredZoomLevels = this.maxZoomLevel - this.minZoomLevel + 1;
        } else {
            //calculate based on specified numZoomLevels (on layer or map)
            // this covers cases (1) and (3)
            desiredZoomLevels = this.numZoomLevels;
        }

        if (desiredZoomLevels != null) {
            //Now that we know what we would *like* the number of zoom levels
            // to be, based on layer or map options, we have to make sure that
            // it does not conflict with the actual limit, as specified by 
            // the constants on the layer itself (and calculated into the
            // 'limitZoomLevels' variable). 
            this.numZoomLevels = Math.min(desiredZoomLevels, limitZoomLevels);
        } else {
            // case (5) -- neither 'numZoomLevels' not 'maxZoomLevel' was 
            // set on either the layer or the map. So we just use the 
            // maximum limit as calculated by the layer's constants.
            this.numZoomLevels = limitZoomLevels;
        }

        //now that the 'numZoomLevels' is appropriately, safely set, 
        // we go back and re-calculate the 'maxZoomLevel'.
        this.maxZoomLevel = this.minZoomLevel + this.numZoomLevels - 1;

        if (this.RESOLUTIONS != null) {
            var resolutionsIndex = 0;
            this.resolutions = [];
            for(var i= this.minZoomLevel; i <= this.maxZoomLevel; i++) {
                this.resolutions[resolutionsIndex++] = this.RESOLUTIONS[i];            
            }
            this.maxResolution = this.resolutions[0];
            this.minResolution = this.resolutions[this.resolutions.length - 1];
        }       
    },
    
    /**
     * APIMethod: getResolution
     * Get the current map resolution
     * 
     * Returns:
     * {Float} Map units per Pixel
     */
    getResolution: function() {

        if (this.resolutions != null) {
            return OpenLayers.Layer.prototype.getResolution.apply(this, arguments);
        } else {
            var resolution = null;
            
            var viewSize = this.map.getSize();
            var extent = this.getExtent();
            
            if ((viewSize != null) && (extent != null)) {
                resolution = Math.max( extent.getWidth()  / viewSize.w,
                                       extent.getHeight() / viewSize.h );
            }
            return resolution;
        }
     },

    /**
     * APIMethod: getExtent
     * Calculates using px-> lonlat translation functions on tl and br 
     *     corners of viewport
     * 
     * Returns:
     * {<OpenLayers.Bounds>} A Bounds object which represents the lon/lat 
     *                       bounds of the current viewPort.
     */
    getExtent: function () {
        var size = this.map.getSize();
        var tl = this.getLonLatFromViewPortPx({
            x: 0, y: 0
        });
        var br = this.getLonLatFromViewPortPx({
            x: size.w, y: size.h
        });
        
        if ((tl != null) && (br != null)) {
            return new OpenLayers.Bounds(tl.lon, br.lat, br.lon, tl.lat);
        } else {
            return null;
        }
    },

    /**
     * Method: getZoomForResolution
     * Get the zoom level for a given resolution
     *
     * Parameters:
     * resolution - {Float}
     *
     * Returns:
     * {Integer} A suitable zoom level for the specified resolution.
     *           If no baselayer is set, returns null.
     */
    getZoomForResolution: function(resolution) {
      
        if (this.resolutions != null) {
            return OpenLayers.Layer.prototype.getZoomForResolution.apply(this, arguments);
        } else {
            var extent = OpenLayers.Layer.prototype.getExtent.apply(this, []);
            return this.getZoomForExtent(extent);
        }
    },



    
    /********************************************************/
    /*                                                      */
    /*             Translation Functions                    */
    /*                                                      */
    /*    The following functions translate GMaps and OL    */ 
    /*     formats for Pixel, LonLat, Bounds, and Zoom      */
    /*                                                      */
    /********************************************************/
    
    
    //
    // TRANSLATION: MapObject Zoom <-> OpenLayers Zoom
    //
  
    /**
     * Method: getOLZoomFromMapObjectZoom
     * Get the OL zoom index from the map object zoom level
     *
     * Parameters:
     * moZoom - {Integer}
     * 
     * Returns:
     * {Integer} An OpenLayers Zoom level, translated from the passed in zoom
     *           Returns null if null value is passed in
     */
    getOLZoomFromMapObjectZoom: function(moZoom) {
        var zoom = null;
        if (moZoom != null) {
            zoom = moZoom - this.minZoomLevel;
            if (this.map.baseLayer !== this) {
                zoom = this.map.baseLayer.getZoomForResolution(
                    this.getResolutionForZoom(zoom)
                );
            }
        }
        return zoom;
    },
    
    /**
     * Method: getMapObjectZoomFromOLZoom
     * Get the map object zoom level from the OL zoom level
     *
     * Parameters:
     * olZoom - {Integer}
     * 
     * Returns:
     * {Integer} A MapObject level, translated from the passed in olZoom
     *           Returns null if null value is passed in
     */
    getMapObjectZoomFromOLZoom: function(olZoom) {
        var zoom = null; 
        if (olZoom != null) {
            zoom = olZoom + this.minZoomLevel;
            if (this.map.baseLayer !== this) {
                zoom = this.getZoomForResolution(
                    this.map.baseLayer.getResolutionForZoom(zoom)
                );
            }
        }
        return zoom;
    },

    CLASS_NAME: "OpenLayers.Layer.FixedZoomLevels"
});

/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */


/**
 * @requires OpenLayers/Layer/SphericalMercator.js
 * @requires OpenLayers/Layer/EventPane.js
 * @requires OpenLayers/Layer/FixedZoomLevels.js
 * @requires OpenLayers/Lang.js
 */

/**
 * Class: OpenLayers.Layer.Google
 * 
 * Provides a wrapper for Google's Maps API
 * Normally the Terms of Use for this API do not allow wrapping, but Google
 * have provided written consent to OpenLayers for this - see email in 
 * http://osgeo-org.1560.n6.nabble.com/Google-Maps-API-Terms-of-Use-changes-tp4910013p4911981.html
 * 
 * Inherits from:
 *  - <OpenLayers.Layer.SphericalMercator>
 *  - <OpenLayers.Layer.EventPane>
 *  - <OpenLayers.Layer.FixedZoomLevels>
 */
OpenLayers.Layer.Google = OpenLayers.Class(
    OpenLayers.Layer.EventPane, 
    OpenLayers.Layer.FixedZoomLevels, {
    
    /** 
     * Constant: MIN_ZOOM_LEVEL
     * {Integer} 0 
     */
    MIN_ZOOM_LEVEL: 0,
    
    /** 
     * Constant: MAX_ZOOM_LEVEL
     * {Integer} 21
     */
    MAX_ZOOM_LEVEL: 21,

    /** 
     * Constant: RESOLUTIONS
     * {Array(Float)} Hardcode these resolutions so that they are more closely
     *                tied with the standard wms projection
     */
    RESOLUTIONS: [
        1.40625, 
        0.703125, 
        0.3515625, 
        0.17578125, 
        0.087890625, 
        0.0439453125,
        0.02197265625, 
        0.010986328125, 
        0.0054931640625, 
        0.00274658203125,
        0.001373291015625, 
        0.0006866455078125, 
        0.00034332275390625,
        0.000171661376953125, 
        0.0000858306884765625, 
        0.00004291534423828125,
        0.00002145767211914062, 
        0.00001072883605957031,
        0.00000536441802978515, 
        0.00000268220901489257,
        0.0000013411045074462891,
        0.00000067055225372314453
    ],

    /**
     * APIProperty: type
     * {GMapType}
     */
    type: null,

    /**
     * APIProperty: wrapDateLine
     * {Boolean} Allow user to pan forever east/west.  Default is true.  
     *     Setting this to false only restricts panning if 
     *     <sphericalMercator> is true. 
     */
    wrapDateLine: true,

    /**
     * APIProperty: sphericalMercator
     * {Boolean} Should the map act as a mercator-projected map? This will
     *     cause all interactions with the map to be in the actual map 
     *     projection, which allows support for vector drawing, overlaying 
     *     other maps, etc. 
     */
    sphericalMercator: false, 
    
    /**
     * Property: version
     * {Number} The version of the Google Maps API
     */
    version: null,

    /** 
     * Constructor: OpenLayers.Layer.Google
     * 
     * Parameters:
     * name - {String} A name for the layer.
     * options - {Object} An optional object whose properties will be set
     *     on the layer.
     */
    initialize: function(name, options) {
        options = options || {};
        if(!options.version) {
            options.version = typeof GMap2 === "function" ? "2" : "3";
        }
        var mixin = OpenLayers.Layer.Google["v" +
            options.version.replace(/\./g, "_")];
        if (mixin) {
            OpenLayers.Util.applyDefaults(options, mixin);
        } else {
            throw "Unsupported Google Maps API version: " + options.version;
        }

        OpenLayers.Util.applyDefaults(options, mixin.DEFAULTS);
        if (options.maxExtent) {
            options.maxExtent = options.maxExtent.clone();
        }

        OpenLayers.Layer.EventPane.prototype.initialize.apply(this,
            [name, options]);
        OpenLayers.Layer.FixedZoomLevels.prototype.initialize.apply(this, 
            [name, options]);

        if (this.sphericalMercator) {
            OpenLayers.Util.extend(this, OpenLayers.Layer.SphericalMercator);
            this.initMercatorParameters();
        }    
    },

    /**
     * Method: clone
     * Create a clone of this layer
     *
     * Returns:
     * {<OpenLayers.Layer.Google>} An exact clone of this layer
     */
    clone: function() {
        /**
         * This method isn't intended to be called by a subclass and it
         * doesn't call the same method on the superclass.  We don't call
         * the super's clone because we don't want properties that are set
         * on this layer after initialize (i.e. this.mapObject etc.).
         */
        return new OpenLayers.Layer.Google(
            this.name, this.getOptions()
        );
    },

    /**
     * APIMethod: setVisibility
     * Set the visibility flag for the layer and hide/show & redraw 
     *     accordingly. Fire event unless otherwise specified
     * 
     * Note that visibility is no longer simply whether or not the layer's
     *     style.display is set to "block". Now we store a 'visibility' state 
     *     property on the layer class, this allows us to remember whether or 
     *     not we *desire* for a layer to be visible. In the case where the 
     *     map's resolution is out of the layer's range, this desire may be 
     *     subverted.
     * 
     * Parameters:
     * visible - {Boolean} Display the layer (if in range)
     */
    setVisibility: function(visible) {
        // sharing a map container, opacity has to be set per layer
        var opacity = this.opacity == null ? 1 : this.opacity;
        OpenLayers.Layer.EventPane.prototype.setVisibility.apply(this, arguments);
        this.setOpacity(opacity);
    },
    
    /** 
     * APIMethod: display
     * Hide or show the Layer
     * 
     * Parameters:
     * visible - {Boolean}
     */
    display: function(visible) {
        if (!this._dragging) {
            this.setGMapVisibility(visible);
        }
        OpenLayers.Layer.EventPane.prototype.display.apply(this, arguments);
    },
    
    /**
     * Method: moveTo
     * 
     * Parameters:
     * bounds - {<OpenLayers.Bounds>}
     * zoomChanged - {Boolean} Tells when zoom has changed, as layers have to
     *     do some init work in that case.
     * dragging - {Boolean}
     */
    moveTo: function(bounds, zoomChanged, dragging) {
        this._dragging = dragging;
        OpenLayers.Layer.EventPane.prototype.moveTo.apply(this, arguments);
        delete this._dragging;
    },
    
    /**
     * APIMethod: setOpacity
     * Sets the opacity for the entire layer (all images)
     * 
     * Parameters:
     * opacity - {Float}
     */
    setOpacity: function(opacity) {
        if (opacity !== this.opacity) {
            if (this.map != null) {
                this.map.events.triggerEvent("changelayer", {
                    layer: this,
                    property: "opacity"
                });
            }
            this.opacity = opacity;
        }
        // Though this layer's opacity may not change, we're sharing a container
        // and need to update the opacity for the entire container.
        if (this.getVisibility()) {
            var container = this.getMapContainer();
            OpenLayers.Util.modifyDOMElement(
                container, null, null, null, null, null, null, opacity
            );
        }
    },

    /**
     * APIMethod: destroy
     * Clean up this layer.
     */
    destroy: function() {
        /**
         * We have to override this method because the event pane destroy
         * deletes the mapObject reference before removing this layer from
         * the map.
         */
        if (this.map) {
            this.setGMapVisibility(false);
            var cache = OpenLayers.Layer.Google.cache[this.map.id];
            if (cache && cache.count <= 1) {
                this.removeGMapElements();
            }            
        }
        OpenLayers.Layer.EventPane.prototype.destroy.apply(this, arguments);
    },
    
    /**
     * Method: removeGMapElements
     * Remove all elements added to the dom.  This should only be called if
     * this is the last of the Google layers for the given map.
     */
    removeGMapElements: function() {
        var cache = OpenLayers.Layer.Google.cache[this.map.id];
        if (cache) {
            // remove shared elements from dom
            var container = this.mapObject && this.getMapContainer();                
            if (container && container.parentNode) {
                container.parentNode.removeChild(container);
            }
            var termsOfUse = cache.termsOfUse;
            if (termsOfUse && termsOfUse.parentNode) {
                termsOfUse.parentNode.removeChild(termsOfUse);
            }
            var poweredBy = cache.poweredBy;
            if (poweredBy && poweredBy.parentNode) {
                poweredBy.parentNode.removeChild(poweredBy);
            }
        }
    },

    /**
     * APIMethod: removeMap
     * On being removed from the map, also remove termsOfUse and poweredBy divs
     * 
     * Parameters:
     * map - {<OpenLayers.Map>}
     */
    removeMap: function(map) {
        // hide layer before removing
        if (this.visibility && this.mapObject) {
            this.setGMapVisibility(false);
        }
        // check to see if last Google layer in this map
        var cache = OpenLayers.Layer.Google.cache[map.id];
        if (cache) {
            if (cache.count <= 1) {
                this.removeGMapElements();
                delete OpenLayers.Layer.Google.cache[map.id];
            } else {
                // decrement the layer count
                --cache.count;
            }
        }
        // remove references to gmap elements
        delete this.termsOfUse;
        delete this.poweredBy;
        delete this.mapObject;
        delete this.dragObject;
        OpenLayers.Layer.EventPane.prototype.removeMap.apply(this, arguments);
    },
    
  //
  // TRANSLATION: MapObject Bounds <-> OpenLayers.Bounds
  //

    /**
     * APIMethod: getOLBoundsFromMapObjectBounds
     * 
     * Parameters:
     * moBounds - {Object}
     * 
     * Returns:
     * {<OpenLayers.Bounds>} An <OpenLayers.Bounds>, translated from the 
     *                       passed-in MapObject Bounds.
     *                       Returns null if null value is passed in.
     */
    getOLBoundsFromMapObjectBounds: function(moBounds) {
        var olBounds = null;
        if (moBounds != null) {
            var sw = moBounds.getSouthWest();
            var ne = moBounds.getNorthEast();
            if (this.sphericalMercator) {
                sw = this.forwardMercator(sw.lng(), sw.lat());
                ne = this.forwardMercator(ne.lng(), ne.lat());
            } else {
                sw = new OpenLayers.LonLat(sw.lng(), sw.lat()); 
                ne = new OpenLayers.LonLat(ne.lng(), ne.lat()); 
            }    
            olBounds = new OpenLayers.Bounds(sw.lon, 
                                             sw.lat, 
                                             ne.lon, 
                                             ne.lat );
        }
        return olBounds;
    },

    /** 
     * APIMethod: getWarningHTML
     * 
     * Returns: 
     * {String} String with information on why layer is broken, how to get
     *          it working.
     */
    getWarningHTML:function() {
        return OpenLayers.i18n("googleWarning");
    },


    /************************************
     *                                  *
     *   MapObject Interface Controls   *
     *                                  *
     ************************************/


  // Get&Set Center, Zoom

    /**
     * APIMethod: getMapObjectCenter
     * 
     * Returns: 
     * {Object} The mapObject's current center in Map Object format
     */
    getMapObjectCenter: function() {
        return this.mapObject.getCenter();
    },

    /** 
     * APIMethod: getMapObjectZoom
     * 
     * Returns:
     * {Integer} The mapObject's current zoom, in Map Object format
     */
    getMapObjectZoom: function() {
        return this.mapObject.getZoom();
    },

  
    /************************************
     *                                  *
     *       MapObject Primitives       *
     *                                  *
     ************************************/


  // LonLat
    
    /**
     * APIMethod: getLongitudeFromMapObjectLonLat
     * 
     * Parameters:
     * moLonLat - {Object} MapObject LonLat format
     * 
     * Returns:
     * {Float} Longitude of the given MapObject LonLat
     */
    getLongitudeFromMapObjectLonLat: function(moLonLat) {
        return this.sphericalMercator ? 
          this.forwardMercator(moLonLat.lng(), moLonLat.lat()).lon :
          moLonLat.lng();  
    },

    /**
     * APIMethod: getLatitudeFromMapObjectLonLat
     * 
     * Parameters:
     * moLonLat - {Object} MapObject LonLat format
     * 
     * Returns:
     * {Float} Latitude of the given MapObject LonLat
     */
    getLatitudeFromMapObjectLonLat: function(moLonLat) {
        var lat = this.sphericalMercator ? 
          this.forwardMercator(moLonLat.lng(), moLonLat.lat()).lat :
          moLonLat.lat(); 
        return lat;  
    },
    
  // Pixel
    
    /**
     * APIMethod: getXFromMapObjectPixel
     * 
     * Parameters:
     * moPixel - {Object} MapObject Pixel format
     * 
     * Returns:
     * {Integer} X value of the MapObject Pixel
     */
    getXFromMapObjectPixel: function(moPixel) {
        return moPixel.x;
    },

    /**
     * APIMethod: getYFromMapObjectPixel
     * 
     * Parameters:
     * moPixel - {Object} MapObject Pixel format
     * 
     * Returns:
     * {Integer} Y value of the MapObject Pixel
     */
    getYFromMapObjectPixel: function(moPixel) {
        return moPixel.y;
    },
    
    CLASS_NAME: "OpenLayers.Layer.Google"
});

/**
 * Property: OpenLayers.Layer.Google.cache
 * {Object} Cache for elements that should only be created once per map.
 */
OpenLayers.Layer.Google.cache = {};


/**
 * Constant: OpenLayers.Layer.Google.v2
 * 
 * Mixin providing functionality specific to the Google Maps API v2.
 * 
 * This API has been deprecated by Google.
 * Developers are encouraged to migrate to v3 of the API; support for this
 * is provided by <OpenLayers.Layer.Google.v3>
 */
OpenLayers.Layer.Google.v2 = {
    
    /**
     * Property: termsOfUse
     * {DOMElement} Div for Google's copyright and terms of use link
     */
    termsOfUse: null, 

    /**
     * Property: poweredBy
     * {DOMElement} Div for Google's powered by logo and link
     */
    poweredBy: null, 

    /**
     * Property: dragObject
     * {GDraggableObject} Since 2.93, Google has exposed the ability to get
     *     the maps GDraggableObject. We can now use this for smooth panning
     */
    dragObject: null, 
    
    /** 
     * Method: loadMapObject
     * Load the GMap and register appropriate event listeners. If we can't 
     *     load GMap2, then display a warning message.
     */
    loadMapObject:function() {
        if (!this.type) {
            this.type = G_NORMAL_MAP;
        }
        var mapObject, termsOfUse, poweredBy;
        var cache = OpenLayers.Layer.Google.cache[this.map.id];
        if (cache) {
            // there are already Google layers added to this map
            mapObject = cache.mapObject;
            termsOfUse = cache.termsOfUse;
            poweredBy = cache.poweredBy;
            // increment the layer count
            ++cache.count;
        } else {
            // this is the first Google layer for this map

            var container = this.map.viewPortDiv;
            var div = document.createElement("div");
            div.id = this.map.id + "_GMap2Container";
            div.style.position = "absolute";
            div.style.width = "100%";
            div.style.height = "100%";
            container.appendChild(div);

            // create GMap and shuffle elements
            try {
                mapObject = new GMap2(div);
                
                // move the ToS and branding stuff up to the container div
                termsOfUse = div.lastChild;
                container.appendChild(termsOfUse);
                termsOfUse.style.zIndex = "1100";
                termsOfUse.style.right = "";
                termsOfUse.style.bottom = "";
                termsOfUse.className = "olLayerGoogleCopyright";

                poweredBy = div.lastChild;
                container.appendChild(poweredBy);
                poweredBy.style.zIndex = "1100";
                poweredBy.style.right = "";
                poweredBy.style.bottom = "";
                poweredBy.className = "olLayerGooglePoweredBy gmnoprint";
                
            } catch (e) {
                throw(e);
            }
            // cache elements for use by any other google layers added to
            // this same map
            OpenLayers.Layer.Google.cache[this.map.id] = {
                mapObject: mapObject,
                termsOfUse: termsOfUse,
                poweredBy: poweredBy,
                count: 1
            };
        }

        this.mapObject = mapObject;
        this.termsOfUse = termsOfUse;
        this.poweredBy = poweredBy;
        
        // ensure this layer type is one of the mapObject types
        if (OpenLayers.Util.indexOf(this.mapObject.getMapTypes(),
                                    this.type) === -1) {
            this.mapObject.addMapType(this.type);
        }

        //since v 2.93 getDragObject is now available.
        if(typeof mapObject.getDragObject == "function") {
            this.dragObject = mapObject.getDragObject();
        } else {
            this.dragPanMapObject = null;
        }
        
        if(this.isBaseLayer === false) {
            this.setGMapVisibility(this.div.style.display !== "none");
        }

    },

    /**
     * APIMethod: onMapResize
     */
    onMapResize: function() {
        // workaround for resizing of invisible or not yet fully loaded layers
        // where GMap2.checkResize() does not work. We need to load the GMap
        // for the old div size, then checkResize(), and then call
        // layer.moveTo() to trigger GMap.setCenter() (which will finish
        // the GMap initialization).
        if(this.visibility && this.mapObject.isLoaded()) {
            this.mapObject.checkResize();
        } else {
            if(!this._resized) {
                var layer = this;
                var handle = GEvent.addListener(this.mapObject, "load", function() {
                    GEvent.removeListener(handle);
                    delete layer._resized;
                    layer.mapObject.checkResize();
                    layer.moveTo(layer.map.getCenter(), layer.map.getZoom());
                });
            }
            this._resized = true;
        }
    },

    /**
     * Method: setGMapVisibility
     * Display the GMap container and associated elements.
     * 
     * Parameters:
     * visible - {Boolean} Display the GMap elements.
     */
    setGMapVisibility: function(visible) {
        var cache = OpenLayers.Layer.Google.cache[this.map.id];
        if (cache) {
            var container = this.mapObject.getContainer();
            if (visible === true) {
                this.mapObject.setMapType(this.type);
                container.style.display = "";
                this.termsOfUse.style.left = "";
                this.termsOfUse.style.display = "";
                this.poweredBy.style.display = "";            
                cache.displayed = this.id;
            } else {
                if (cache.displayed === this.id) {
                    delete cache.displayed;
                }
                if (!cache.displayed) {
                    container.style.display = "none";
                    this.termsOfUse.style.display = "none";
                    // move ToU far to the left in addition to setting display
                    // to "none", because at the end of the GMap2 load
                    // sequence, display: none will be unset and ToU would be
                    // visible after loading a map with a google layer that is
                    // initially hidden. 
                    this.termsOfUse.style.left = "-9999px";
                    this.poweredBy.style.display = "none";
                }
            }
        }
    },
    
    /**
     * Method: getMapContainer
     * 
     * Returns:
     * {DOMElement} the GMap container's div
     */
    getMapContainer: function() {
        return this.mapObject.getContainer();
    },

  //
  // TRANSLATION: MapObject Bounds <-> OpenLayers.Bounds
  //

    /**
     * APIMethod: getMapObjectBoundsFromOLBounds
     * 
     * Parameters:
     * olBounds - {<OpenLayers.Bounds>}
     * 
     * Returns:
     * {Object} A MapObject Bounds, translated from olBounds
     *          Returns null if null value is passed in
     */
    getMapObjectBoundsFromOLBounds: function(olBounds) {
        var moBounds = null;
        if (olBounds != null) {
            var sw = this.sphericalMercator ? 
              this.inverseMercator(olBounds.bottom, olBounds.left) : 
              new OpenLayers.LonLat(olBounds.bottom, olBounds.left);
            var ne = this.sphericalMercator ? 
              this.inverseMercator(olBounds.top, olBounds.right) : 
              new OpenLayers.LonLat(olBounds.top, olBounds.right);
            moBounds = new GLatLngBounds(new GLatLng(sw.lat, sw.lon),
                                         new GLatLng(ne.lat, ne.lon));
        }
        return moBounds;
    },


    /************************************
     *                                  *
     *   MapObject Interface Controls   *
     *                                  *
     ************************************/


  // Get&Set Center, Zoom

    /** 
     * APIMethod: setMapObjectCenter
     * Set the mapObject to the specified center and zoom
     * 
     * Parameters:
     * center - {Object} MapObject LonLat format
     * zoom - {int} MapObject zoom format
     */
    setMapObjectCenter: function(center, zoom) {
        this.mapObject.setCenter(center, zoom); 
    },
   
    /**
     * APIMethod: dragPanMapObject
     * 
     * Parameters:
     * dX - {Integer}
     * dY - {Integer}
     */
    dragPanMapObject: function(dX, dY) {
        this.dragObject.moveBy(new GSize(-dX, dY));
    },


  // LonLat - Pixel Translation
  
    /**
     * APIMethod: getMapObjectLonLatFromMapObjectPixel
     * 
     * Parameters:
     * moPixel - {Object} MapObject Pixel format
     * 
     * Returns:
     * {Object} MapObject LonLat translated from MapObject Pixel
     */
    getMapObjectLonLatFromMapObjectPixel: function(moPixel) {
        return this.mapObject.fromContainerPixelToLatLng(moPixel);
    },

    /**
     * APIMethod: getMapObjectPixelFromMapObjectLonLat
     * 
     * Parameters:
     * moLonLat - {Object} MapObject LonLat format
     * 
     * Returns:
     * {Object} MapObject Pixel transtlated from MapObject LonLat
     */
    getMapObjectPixelFromMapObjectLonLat: function(moLonLat) {
        return this.mapObject.fromLatLngToContainerPixel(moLonLat);
    },

  
  // Bounds
  
    /** 
     * APIMethod: getMapObjectZoomFromMapObjectBounds
     * 
     * Parameters:
     * moBounds - {Object} MapObject Bounds format
     * 
     * Returns:
     * {Object} MapObject Zoom for specified MapObject Bounds
     */
    getMapObjectZoomFromMapObjectBounds: function(moBounds) {
        return this.mapObject.getBoundsZoomLevel(moBounds);
    },

    /************************************
     *                                  *
     *       MapObject Primitives       *
     *                                  *
     ************************************/


  // LonLat
    
    /**
     * APIMethod: getMapObjectLonLatFromLonLat
     * 
     * Parameters:
     * lon - {Float}
     * lat - {Float}
     * 
     * Returns:
     * {Object} MapObject LonLat built from lon and lat params
     */
    getMapObjectLonLatFromLonLat: function(lon, lat) {
        var gLatLng;
        if(this.sphericalMercator) {
            var lonlat = this.inverseMercator(lon, lat);
            gLatLng = new GLatLng(lonlat.lat, lonlat.lon);
        } else {
            gLatLng = new GLatLng(lat, lon);
        }
        return gLatLng;
    },

  // Pixel
    
    /**
     * APIMethod: getMapObjectPixelFromXY
     * 
     * Parameters:
     * x - {Integer}
     * y - {Integer}
     * 
     * Returns:
     * {Object} MapObject Pixel from x and y parameters
     */
    getMapObjectPixelFromXY: function(x, y) {
        return new GPoint(x, y);
    }
    
};
/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Layer.js
 * @requires OpenLayers/Projection.js
 */

/**
 * Class: OpenLayers.Layer.SphericalMercator
 * A mixin for layers that wraps up the pieces neccesary to have a coordinate
 *     conversion for working with commercial APIs which use a spherical
 *     mercator projection.  Using this layer as a base layer, additional
 *     layers can be used as overlays if they are in the same projection.
 *
 * A layer is given properties of this object by setting the sphericalMercator
 *     property to true.
 *
 * More projection information:
 *  - http://spatialreference.org/ref/user/google-projection/
 *
 * Proj4 Text:
 *     +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0
 *     +k=1.0 +units=m +nadgrids=@null +no_defs
 *
 * WKT:
 *     900913=PROJCS["WGS84 / Simple Mercator", GEOGCS["WGS 84",
 *     DATUM["WGS_1984", SPHEROID["WGS_1984", 6378137.0, 298.257223563]], 
 *     PRIMEM["Greenwich", 0.0], UNIT["degree", 0.017453292519943295], 
 *     AXIS["Longitude", EAST], AXIS["Latitude", NORTH]],
 *     PROJECTION["Mercator_1SP_Google"], 
 *     PARAMETER["latitude_of_origin", 0.0], PARAMETER["central_meridian", 0.0], 
 *     PARAMETER["scale_factor", 1.0], PARAMETER["false_easting", 0.0], 
 *     PARAMETER["false_northing", 0.0], UNIT["m", 1.0], AXIS["x", EAST],
 *     AXIS["y", NORTH], AUTHORITY["EPSG","900913"]]
 */
OpenLayers.Layer.SphericalMercator = {

    /**
     * Method: getExtent
     * Get the map's extent.
     *
     * Returns:
     * {<OpenLayers.Bounds>} The map extent.
     */
    getExtent: function() {
        var extent = null;
        if (this.sphericalMercator) {
            extent = this.map.calculateBounds();
        } else {
            extent = OpenLayers.Layer.FixedZoomLevels.prototype.getExtent.apply(this);
        }
        return extent;
    },

    /**
     * Method: getLonLatFromViewPortPx
     * Get a map location from a pixel location
     * 
     * Parameters:
     * viewPortPx - {<OpenLayers.Pixel>}
     *
     * Returns:
     *  {<OpenLayers.LonLat>} An OpenLayers.LonLat which is the passed-in view
     *  port OpenLayers.Pixel, translated into lon/lat by map lib
     *  If the map lib is not loaded or not centered, returns null
     */
    getLonLatFromViewPortPx: function (viewPortPx) {
        return OpenLayers.Layer.prototype.getLonLatFromViewPortPx.apply(this, arguments);
    },
    
    /**
     * Method: getViewPortPxFromLonLat
     * Get a pixel location from a map location
     *
     * Parameters:
     * lonlat - {<OpenLayers.LonLat>}
     *
     * Returns:
     * {<OpenLayers.Pixel>} An OpenLayers.Pixel which is the passed-in
     * OpenLayers.LonLat, translated into view port pixels by map lib
     * If map lib is not loaded or not centered, returns null
     */
    getViewPortPxFromLonLat: function (lonlat) {
        return OpenLayers.Layer.prototype.getViewPortPxFromLonLat.apply(this, arguments);
    },

    /** 
     * Method: initMercatorParameters 
     * Set up the mercator parameters on the layer: resolutions,
     *     projection, units.
     */
    initMercatorParameters: function() {
        // set up properties for Mercator - assume EPSG:900913
        this.RESOLUTIONS = [];
        var maxResolution = 156543.03390625;
        for(var zoom=0; zoom<=this.MAX_ZOOM_LEVEL; ++zoom) {
            this.RESOLUTIONS[zoom] = maxResolution / Math.pow(2, zoom);
        }
        this.units = "m";
        this.projection = this.projection || "EPSG:900913";
    },

    /**
     * APIMethod: forwardMercator
     * Given a lon,lat in EPSG:4326, return a point in Spherical Mercator.
     *
     * Parameters:
     * lon - {float} 
     * lat - {float}
     * 
     * Returns:
     * {<OpenLayers.LonLat>} The coordinates transformed to Mercator.
     */
    forwardMercator: (function() {
        var gg = new OpenLayers.Projection("EPSG:4326");
        var sm = new OpenLayers.Projection("EPSG:900913");
        return function(lon, lat) {
            var point = OpenLayers.Projection.transform({x: lon, y: lat}, gg, sm);
            return new OpenLayers.LonLat(point.x, point.y);
        };
    })(),

    /**
     * APIMethod: inverseMercator
     * Given a x,y in Spherical Mercator, return a point in EPSG:4326.
     *
     * Parameters:
     * x - {float} A map x in Spherical Mercator.
     * y - {float} A map y in Spherical Mercator.
     * 
     * Returns:
     * {<OpenLayers.LonLat>} The coordinates transformed to EPSG:4326.
     */
    inverseMercator: (function() {
        var gg = new OpenLayers.Projection("EPSG:4326");
        var sm = new OpenLayers.Projection("EPSG:900913");
        return function(x, y) {
            var point = OpenLayers.Projection.transform({x: x, y: y}, sm, gg);
            return new OpenLayers.LonLat(point.x, point.y);
        };
    })()

};

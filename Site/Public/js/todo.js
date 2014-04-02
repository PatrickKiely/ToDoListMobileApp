function pd( func ) {
  return function( event ) {
    event.preventDefault()
    func && func(event)
  }
}

document.ontouchmove = pd()

_.templateSettings = {
             evaluate: /\{\[([\s\S]+?)\]\}/g,
             interpolate: /\{\{([\s\S]+?)\}\}/g,
             escape: /\{\{-([\s\S]+?)\}\}/g
};


var browser = {
  android: /Android/.test(navigator.userAgent)
}


var app = {
  model: {},
  view: {}
}

var bb = {
  model: {},
  view: {}
}



bb.init = function() {

  var scrollContent = 	{
						scroll: function() {
						var self = this
						setTimeout( function() {
						if( self.scroller ) {
						  self.scroller.refresh()
											}
						else 				{
						  self.scroller = new iScroll( $("div[data-role='content']")[0] )
						}
						},1)
											},
						}
  
  bb.model.State = Backbone.Model.extend(_.extend({    
	    defaults: {
      items: 'loading items'
    },
    
  }))

  
  bb.model.Item = Backbone.Model.extend(_.extend({    
    defaults: {
      name: '',
      done: false

    },

    initialize: function() {
      var self = this
      _.bindAll(self)
     
    },
    removed: function(item)
    {
    	  var self = this
          _.bindAll(self)
          this.destroy()
          
    },
    complete: function() {
        this.save({done: !this.get("done")});
        return false
        
      },
    themeX: function() {
        this.save({themeX: !this.get("themeX")});
        return false
        
      }

  }))

  bb.model.Items = Backbone.Collection.extend(_.extend({    
    model: bb.model.Item,
 localStorage: new Store("items"),

    initialize: function() {
      var self = this
      _.bindAll(self)
      self.count = 0

      self.on('reset',function() {
        self.count = self.length
      })
    },

    additem: function(value) {
      var self = this
      var item = new bb.model.Item({
       text: value,
       done: false
      })
      
    
      $('#save').css('opacity',0.2)
      $("#text").val('')
 
      self.add(item)

      item.save() 
      
    }
    ,
    cancelled: function ()
    {
    	$("#add").show()
    	$("#cancel").hide()
    	$("#settings").hide()
    	$("#items").show()
    	
    },
    themed: function ()
    {
    	$("#add").hide()
    	$("#cancel").show()
    	$("#items").hide()
    	
    },
    addevent: function(){
    	
    	$("#add").hide()
    	$("#cancel").show()
    }
 

  }))

  bb.view.Head = Backbone.View.extend(_.extend({    
    events: {
      'tap #add': function(){ 
        var self = this
        _.bindAll(self)
        
        self.items.addevent()
        self.elem.newitem.slideDown()
    	return false;
	  
      },
      'tap #cancel': function(){ 
      var self = this
      _.bindAll(self)
    
      
	       self.items.cancelled()
	       self.elem.newitem.slideUp()
	       $("#text").val('')

	       return false;
    }
    ,
      'tap #themesBtn': function(){ 
      var self = this
      _.bindAll(self)
    
      
       self.items.themed()
	       self.elem.settings.slideDown()

	       return false;
  }     

    }
  ,
    initialize: function( items ) {
      var self = this
      _.bindAll(self)
      self.items = items
      	
      self.setElement("div[data-role='header']")

      self.elem = {
        add: self.$el.find('#add'),
        cancel: self.$el.find('#cancel'),
        itemCount: self.$el.find('h1'),
        themeX: self.$el.find('themeX'),
        text: self.$el.find('#text'),
        newitem: $('#newitem'),
        settings: $('#settings'),
        save: self.$el.find('#save'),
      }
       
      self.tm = {
        itemCount: _.template( self.elem.itemCount.html() )
        
      }

      self.elem.add.hide()
      self.elem.cancel.hide()
      //Dont show New Item and Cancel on initial Load

      app.model.state.on('change:items',self.render)

      // Slide up add on initial Load
      self.elem.newitem.slideUp()
        self.elem.settings.slideUp()
    },

    render: function() {
      var self = this
      
      var loaded = 'loaded' == app.model.state.get('items')

      self.elem.itemCount.html( self.tm.itemCount({
        itemCount: loaded ? self.items.length+' Items' : 'Loading...'
      }) )

      if( loaded ) {
        self.elem.add.show()
         self.elem.settings.show()
      }
      self.elem.newitem.slideUp()
       self.elem.settings.slideUp()
    },
  
  }))

  bb.view.List = Backbone.View.extend(_.extend({    
	  tagName: "ul",
	   
	  initialize: function(items){     
		  _.bindAll(this, "renderItem"); 
		 this.collection.bind('add', this.renders, this);
		  },
		  		   
		  renderItem: function(model){       
			 var itemView = new  bb.view.Item({model: model});   
			     //itemView.render();    
			    $(this.el).append(itemView.el);   
		},    
		   
		    render: function(){  
		      this.collection.each(this.renderItem); 
		  },
		 renders: function(model){  

	
			 var last_model = this.collection.at(this.collection.length - 1);
			 
			 var view = new  bb.view.Item({model:last_model });   
			 $(this.el).append(view.el);
		      
		
		  },
		
  },scrollContent))

  bb.view.Item = Backbone.View.extend(_.extend({  
	  tagName: "li",
	  events: {        "tap input": "completed"    ,
		  "tap button": "deleted"
		//  ,"tap themeX": "themeXed"
		  },   
	  
		  completed: function(e){       
			  	var self = this
			  	self.model.complete(); 
	  },    
	  
	  initialize: function(item) {
		  this.render();
	      this.model.bind('destroy', this.remove, this);
	    },
	  
	  render: function(){        		  
		  var self = this

	      var html = self.tm.item( self.model.toJSON())

		  $(this.el).append(html);  
	
		  } 
	 
		    ,
	    
	    deleted: function()
	     {
	     	  var self = this
	 	        this.model.removed();
	     	 this.remove
	     }

  },{
    tm: {
      item: _.template( $('#item-template').html())
    }
  },scrollContent))
  
  bb.view.Content = Backbone.View.extend(_.extend({  
	  events: {
	      'tap #save': function(){ 
	        var self = this
	        var textlen = $("#text").val().length
	        if( 0 == textlen ) {}
	        else
	        	{
			        self.items.additem($("#text").val()) 
			      $("#newitem").slideUp()
			       $("#settings").slideUp()
			        $("#themes").show()
			        $("#add").show()
			        $("#cancel").hide()
			 //       $("#todopage").hide()
	        	}
	      }

	  }
  	
  ,
    initialize: function(items) {
      var self = this
      _.bindAll(self)
      
      self.items = items
      self.setElement('#newitem')

      self.elem = {
    	  text: self.$el.find('#text'),
    	  save: self.$el.find('#save'),
    	  newitem: self.$el.find('#newitem')
    	  
      }
      
      self.items.on('add',self.render,this)
      self.render()
    },

    render: function() {
      var self = this
      
      self.elem.newitem.slideUp()
  //    self.elem.settings.slideUp()
    }

  }))
  
  
  
  
  
  
    
  bb.view.Welcome = Backbone.View.extend(_.extend({  
	  events: {
		   'tap #welcome': function(){ 
		        var self = this
				{
				    $.mobile.changePage("#todopage",  { transition: "slideup", changeHash: false });	
					return false
				}   
		      }
		 
			},
	   
		   initialize: function() {
		     var self = this
			 self.setElement('#welcome')
		   },
		
		   render: function() {
		     var self = this
		   }
 }))
 
 
 bb.model.Map = Backbone.Model.extend({
	 
	  defaults: { 
		  			zoom: 15,
		  			mapTypeId: google.maps.MapTypeId.ROADMAP
	  			},
  initialize: function() {
	  var self = this
  },
 
 })

  bb.view.Location = Backbone.View.extend(_.extend({  
	   el: '#map',
	    initialize: function() {
	    	 console.log(this.model)
	    	  var self = this

	    	  this.map = new google.maps.Map(
	    	            this.el,
	    	            this.model.toJSON()

	    	        ); 
	    	
	      navigator.geolocation.getCurrentPosition(function(position) {
	    	        var latitude = position.coords.latitude;
	    	        var longitude = position.coords.longitude;
	    	        var geolocpoint = new google.maps.LatLng(latitude, longitude);
	    	      //  this.map.setCenter(geolocpoint, 13);
	    	      self.map.setCenter(geolocpoint,40);
				 
	    	  })
	    	
	       this.render();
	    },
	    render: function() {
	        return this;
	    },
  }))
  


  
  
  
  
 bb.model.Setting = Backbone.Model.extend(_.extend({   
	  localStorage:  new Store("storeSet"),
    defaults: {
      theme: 'b'
    },

    initialize: function() {
        var self = this
    },

  }))
  
  
  bb.model.Settings = Backbone.Collection.extend(_.extend({  
	  model:  bb.model.Setting,
    localStorage: new Store("storeSet"),

    initialize: function() {
      var self = this
      _.bind(this.changetheme, this);
    },
    changetheme: function(value) {
    	  var self = this

       	  this.fetch();
    	  if (this.length >0){
    		  var modelToDelete = this.at(0) 
    		  modelToDelete.destroy();
    	  }
          this.create({theme:value});
          
       
      }
      
    }))
  
   bb.view.Settings = Backbone.View.extend(_.extend({  

	   events: {
		      "click input[type=button]": "onThemeSelect"
	   },
	   
	   onThemeSelect: function (e) {

		   var self = this
	       _.bindAll(self);
		   this.collection.fetch();
	       var test = ($(e.target).val()); 
	       this.collection.changetheme(test)
	       window.location.reload();
	       return false
	   },
      
    initialize: function(setting) {
      var self = this
      this.collection.fetch()
      this.collection.bind('change', this.render, this);
      
      self.setElement('#themes')
      self.elem = {
    	  themeX: self.$el.find('#themeX')
      }
      
    },

    render: function() {
      var self = this
      
          if (this.collection.length >0){
          var loaded = this.collection.at(0).attributes.theme 
          }
          else
        	  {
        	  loaded = "ui-body-b"
        		  }
        		  
        		  	console.log('loaded')
        		console.log(loaded)

           $("#todopage").attr("data-theme", loaded) 
           $("#todopage").attr("data-content-theme",loaded)
      //     $("#todopage").removeClass("ui-body-b").addClass("ui-body-a");

    }
  },
  
  {
    tm: {
        item: _.template( $('#buttons').html())
        }
	    
}))
 
   
}




app.init_browser = function() {
  if( browser.android ) {
    $("#main div[data-role='content']").css({
      bottom: 0
    })
  }
}

browser.iphone = !browser.android



app.init = function() {
	
		console.log('start init')
		bb.init()
		app.init_browser()
		
		
		
//		app.view.Welcome = new bb.view.Welcome();
//		app.view.Welcome.render();			
		
		app.model.state = new bb.model.State();
		app.model.items = new bb.model.Items();
		
		app.view.head = new bb.view.Head(app.model.items)
		
		app.view.Content = new bb.view.Content(app.model.items)
		app.view.Content.render()	
		
		app.view.list = new bb.view.List({collection: app.model.items})
			  app.model.items.fetch( {
				    success: function() {
				      app.model.state.set({items:'loaded'})
				    app.view.list.render()
				      
				      $("#items").html( app.view.list.el);
				    }
				  })
				  
        
        
        app.model.Settings = new  bb.model.Settings()
		app.view.Settings = new bb.view.Settings({collection:  app.model.Settings})
		app.view.Settings.render();		

				  
        
		app.model.map = new   bb.model.Map();
		app.view.Location = new bb.view.Location({model:  app.model.map});				  

		app.view.head.render()
		console.log('end init')
}


$(app.init)
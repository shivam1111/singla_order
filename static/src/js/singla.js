odoo.define('singla_order', function (require) {

var core = require('web.core');
var data = require('web.data');
var Model = require('web.Model');
var session = require('web.session');
var framework = require('web.framework');
var KanbanView = require('web_kanban.KanbanView');
var KanbanRecord = require('web_kanban.Record');
var QWeb = core.qweb;

openerp.singla_order = function(instance, local) {
    var _t = instance.web._t,
        _lt = instance.web._lt;
    var QWeb = instance.web.qweb;

    local.singla_order_line = instance.Widget.extend({
    	template:'singla_order_line',
    	events:{
    		"keyup":"event_keyboard",
    		"change input.singla-input-size":"change_size",
    		"change input.singla-input-price":"change_price",
    		"change .singla-input-weight":"change_weight",
    	},
    	event_keyboard:function(e){
    		var self = this;
    		//ctrl is for the master widget
    		if (! e.ctrlKey){
        		switch (e.keyCode){
    			case 46:
    				self.unlink();
    				break;
        		}    			
    		}
    	},
    	focus_previous_line(self){
    		if (self.$el.prev().length != 0){
    			self.$el.prev().find('input.singla-input-size').focus();
    		}else{
    			self.$el.next().find('input.singla-input-size').focus();
    		}
    	},
    	unlink:function(){
    		var self = this;
    		self.focus_previous_line(self);
    		this.singla_order_line.call('unlink',[this.id]).then(function(){
    			self.destroy();
    		})
    	},
    	init:function(parent,id,size,price,weight,options){
    		this._super();
    		this.id = id
    		this.parent = parent;
    		this.singla_order_line = new instance.web.Model('singla.order.line');
    		this.set({
    			'size':size,
    			'price':price,
    			'weight':weight,
    		})
    	},
    	change_size:function(e){
    		this.set({
    			'size':$(e.target).val()
			})
    	},
    	change_weight:function(e){
    		this.set({
    			'weight':$(e.target).val()
			})
    	},    	
    	
    	change_price:function(e){
    		this.set({
    			'price':$(e.target).val()
			})
		},
		save_data:function(){
			var self=this;
			singla_order_line = new instance.web.Model('singla.order.line')
			singla_order_line.call('write',[[parseInt(self.id)],{
				'size':self.get('size'),
				'price':self.get('price'),
				'weight':self.get('weight')
			}])
		},
    	start:function(){
    		this._super()
    		var self = this
    		this.on('save_data',self,function(){
    			self.save_data();
    		});
    	},
    });
    
    local.singla_order = instance.Widget.extend({
    	template:'singla_order',
        events : {
			"click .button_save":"save_data",
			"click .button_delete":"delete_record",
			"change .singla-order-price":"change_price",
			"change .field_text":"change_notes",
			"keydown":"execute_keydown",
        },
        execute_keydown:function(e){
        	var self = this;
        	if (e.ctrlKey){
        		switch (e.keyCode){
        		case 83:
        			self.save_data();
        			break;
        		case 68:
        			e.preventDefault();
        			self.focus_upper_singla_order(e);
        			self.delete_record();
        			break;
    			}
        	}
        	if (! e.ctrlKey){
	        	switch (e.keyCode){
	        	case 13:
	        		if (!$(e.target).hasClass("ui-autocomplete-input")){
		        		e.stopPropagation();
		        		self.create_order_line();	        			
	        		}
	        		break;
	        	case 33:
	           		e.stopPropagation();
	           		e.preventDefault();
	           		self.focus_upper_singla_order(e);
	           		break;
	        	case 34:
	        		e.preventDefault();
	           		e.stopPropagation();
	           		self.focus_down_singla_order(e);
	           		break;
	        	}
        	}
    	},
    	focus_upper_singla_order:function(e){
    		var self = this;
    		console.log(self.$el.prev());
    		if (self.$el.prev().length > 0){
    			self.$el.prev().find("input[name='date']").focus();
    		}
		},
		focus_down_singla_order:function(e){
    		var self = this;
    		if (self.$el.next().length > 0){
    			self.$el.next().find("input[name='date']").focus();
    		}
		},
        line_widget_focus:function(){
        	var self = this;
        	$size_input = self.$el.find("input.singla-input-size")
        	$size_input.focus();
        },
        create_order_line(){
        	var self = this;
        	singla_order_line = new instance.web.Model('singla.order.line');
        	singla_order_line.call('create',[{'order_id':self.order.id}]).done(function(id){
        		line_widget  = new local.singla_order_line(self,id,'',self.order.price,0)
        		line_widget.appendTo(self.$el.find('.singla-order-line-div'));
        		self.line_widget.push(line_widget);
        		self.line_widget_focus();
        	})
        },
        change_price:function(e){
        	this.order.price = $(e.target).val();
        },
        change_notes:function(e){
        	this.order.notes = $(e.target).val();
        },
    	init:function(order,lines,options){
    		var self = this;
    		this._super();
    		this.order = order;
    		this.lines = lines;
    		this.line_widget=[]
            this.dfm = new instance.web.form.DefaultFieldManager(self);
    		this.dfm.extend_field_desc({
                date:{
                	'string':'Date',
                },
            	partner_id: {
                	string:'Customer',
                    relation: "res.partner",
                },
            }); 
    		this.partner_m2o = new instance.web.form.FieldMany2One(self.dfm, {
            	attrs: {
                    name: "partner_id",
                    type: "many2one",
                    context: {
                    },
                    modifiers: '{"required": true}',
                },
            });
    		var FieldDate = core.form_widget_registry.get('date');
    		this.FieldDate = new FieldDate(self.dfm,{
    			attrs:{
    				name:'date',
    				type:'date',
                    context: {
                    },
                    modifiers: '{"required": true}',
    			}
    		})
    	},
    	save_data:function(){
    		var self=this
    		singla_order = new instance.web.Model('singla.order');
    		framework.blockUI();
    		singla_order.call('write',[[parseInt(self.order.id)],{'notes':self.notes,'price':self.order.price,
    															'date':self.order.date,'partner_id':self.order.partner_id}]).then(function(){
    			_.each(self.line_widget,function(line){
    				line.trigger('save_data',true)
    			});
    			framework.unblockUI();
    		})
    	},
    	delete_record:function(){
    		var self=this;
    		singla_order = new instance.web.Model('singla.order');
    		singla_order.call('unlink',[self.order.id]).done(function(){
    			self.destroy();
    		})
    	},
    	start:function(){
    		this._super();
    		var self = this
    		self.partner_div = $("<div class = 'select_project oe_form create_form oe_left' style = 'display:inline-block;'></div>")
    		self.partner_m2o.appendTo(self.partner_div).then(function(){
    			self.partner_m2o.on('change:value',self,function(){
    				self.order.partner_id = self.partner_m2o.get_value();
    			});
    			self.FieldDate.on('change:value',self,function(){
    				self.order.date = self.FieldDate.get_value()
    			})
    			self.FieldDate.prependTo(self.partner_div)
    			self.FieldDate.set_value(self.order.date);
    			self.$el.prepend(self.partner_div)
    			self.partner_m2o.set_value(self.order.partner_id);
    			_.each(self.lines,function(line){
    				new_line = new local.singla_order_line(self,line.id,line.size,line.price,line.weight);
    				self.line_widget.push(new_line);
    				new_line.appendTo(self.$el.find('div.singla-order-line-div'))
    			});
    		});
    		self.$el.focusin(function(){
    			self.$el.css("border",'2px solid red')
    			$(this)[0].scrollIntoView();
    		});
    		self.$el.focusout(function(){
    			self.$el.css("border",'1px solid #c8c8d3')
    		});
    	},
    })
    
    local.singla_order_web = instance.Widget.extend({
    	template:"order_document",
    	events:{
    		'keydown':"execute_keydown",
    		'click .add_an_order':'create_singla_order'
    	},
    	execute_keydown:function(e){
    		var self = this;
    		if (e.ctrlKey && e.keyCode == 13 ){
    			e.stopPropagation();
    			self.create_singla_order();
    			return
    		}
    	},
    	widget_focus:function(widget){
    		widget.FieldDate.focus();
    	},
    	create_singla_order:function(){
    		var self = this
    		singla_order = new instance.web.Model('singla.order');
    		singla_order.call('create',[{'date':new Date()}]).done(function(id){
    			var singla_order_widget = new local.singla_order({},[])
    			self.order_widget.push(singla_order_widget);
    			singla_order_widget.appendTo(self.$el.find('div.oe_form_sheet'))
    			singla_order_widget.FieldDate.set_value(new Date());
    			self.widget_focus(singla_order_widget);
    			singla_order_widget.$el[0].scrollIntoView();
    		});
    	},
    	init:function(parent){
    		var self = this;
    		this._super(parent);
    		this.orders= null;
    		this.lines = null;
    		this.order_widget = [];
    		this.date = Date();
            this.initialize_data_def = self.initialize_data([],[])
            this.src= session.url('/singla_order/static/src/img/help.png');
    	},
    	fetch_data_order:function(sale_order,filter){
            def_order = sale_order.query(['date','line_ids','partner_id','notes','price']).filter(filter).all()    		
            return $.when(def_order)
    	},
    	fetch_data_line:function(sale_order_line,filter){
    		def_lines = sale_order_line.call('get_order_line',[filter])
    		return $.when(def_lines)
    	},
    	initialize_data:function(sale_order_filter,sale_order_line_filter){
    		var self = this
    		var def = $.Deferred();
            sale_order = new instance.web.Model('singla.order')
            sale_order_line = new instance.web.Model('singla.order.line')
    		return $.when(self.fetch_data_order(sale_order,[]),self.fetch_data_line(sale_order_line,[])).done(function(orders,lines){
            	self.orders = orders;
            	self.lines = lines;
            });    		
    	},
    	get_order_line:function(order){
    		var self = this
    		return _.map(order.line_ids, function(id){ 
    			return self.lines[id.toString()]
			});
    	},
    	start: function() {
            this._super();
            var self = this;
            var tip; // make it global
            self.$el.find('img').mouseover(function(e) { // no need to point to 'rel'. Just if 'a' has [title] attribute.
            	tip = $(this).attr('title'); // tip = this title   
            	$(this).attr('title','');    // empty title
                self.$el.find('div.tooltip').fadeTo(300, 1)// fade tooltip and populate .tipBody

            }).mousemove(function(e) {
                $('.tooltip').css('top', e.pageY + 10 ); // mouse follow!
                $('.tooltip').css('left', e.pageX + 20 );

            }).mouseout(function(e) {
                $('.tooltip').hide(); // mouseout: HIDE Tooltip (do not use fadeTo or fadeOut )
                $(this).attr( 'title', tip ); // reset title attr
            });
            
            $.when(self.initialize_data_def).then(function(){
            	_.each(self.orders,function(order){
                	new_order = new local.singla_order(order,self.get_order_line(order))
                	self.order_widget.push(new_order)
                    new_order.appendTo(self.$el.find('div.oe_form_sheet'))
            	});            	
            })
    	},
    	renderElement:function(){
    		var self = this;
    		this._super()
            list_group = $("<ul class='list-group'></ul>")
            self.list_group = list_group;
            self.$el.find("div.oe_form_sheet").append(list_group)
    	},    	
    });
    instance.web.client_actions.add(
        'singla.order', 'instance.singla_order.singla_order_web');
}
});
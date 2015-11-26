odoo.define('singla_order', function (require) {

var core = require('web.core');
var data = require('web.data');
var Model = require('web.Model');
var session = require('web.session');

var KanbanView = require('web_kanban.KanbanView');
var KanbanRecord = require('web_kanban.Record');
var QWeb = core.qweb;

openerp.singla_order = function(instance, local) {
    var _t = instance.web._t,
        _lt = instance.web._lt;
    var QWeb = instance.web.qweb;

    local.singla_order_line = instance.Widget.extend({
    	init:function(size,price,weight,options){
    		this._super();
    		this.size = size;
    		this.price = price;
    		this.weight = weight;
    	},
    	start:function(){
    		this._super()
    	},
    	renderElement:function(){
    		this.$el = $(QWeb.render("singla_order_line", {'size':this.size,'price':this.price,'weight':this.weight}))
    	},
    });
    
    local.singla_order = instance.Widget.extend({
    	template:'singla_order',
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
    	destrot:function(){
    		this._super();
    		this.partner_m2o.$el.find('input').autocomplete('destroy');
    	},
    	start:function(){
    		this._super();
    		var self = this
    		self.partner_div = $("<div class = 'select_project oe_form create_form oe_left' style = 'display:inline-block;'></div>")
    		self.partner_m2o.appendTo(self.partner_div).then(function(){
    			console.log(self.partner_m2o.$el.find('input'));
    			self.partner_m2o.$el.find('input').attr('autocomplete','off')
    			self.FieldDate.appendTo(self.partner_div) 
    			self.FieldDate.set_value(self.order.date);
    			self.$el.prepend(self.partner_div)
    			self.partner_m2o.set_value(self.order.partner_id);
    			_.each(self.lines,function(line){
    				new_line = new local.singla_order_line(line.size,line.price,line.weight);
    				self.line_widget.push(new_line);
    				new_line.appendTo(self.$el.find('div.singla-order-line-div'))
    			});
    		});
    	},
    })
    
    local.singla_order_web = instance.Widget.extend({
    	template:"order_document",
    	init:function(parent){
    		var self = this;
    		this._super(parent);
    		this.orders= null;
    		this.lines = null;
    		this.order_widget = []
            this.initialize_data_def = self.initialize_data([],[])
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
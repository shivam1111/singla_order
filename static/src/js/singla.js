openerp.singla_order = function(instance, local) {
    var _t = instance.web._t,
        _lt = instance.web._lt;
    var QWeb = instance.web.qweb;

    local.singla_order = instance.Widget.extend({
    	template:'singla_order',
    	init:function(order,lines){
    		var self = this;
    		this._super();
    		this.order = order;
    		this.lines = lines;
            this.dfm = new instance.web.form.DefaultFieldManager(self);
            this.dfm.extend_field_desc({
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
    	},
    	start:function(){
    		this._super();
    		var self = this
    		partner_div = $("<div class = 'select_project oe_form create_form' style = 'display:inline-block;'><h4>Customer</h4></div>")
    		self.partner_m2o.appendTo(partner_div).then(function(){
    			self.$el.prepend(partner_div)
    		})
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
            self.initialize_data([],[])
    	},
    	fetch_data_order:function(sale_order,filter){
            def_order = sale_order.query(['date','line_ids','partner_id','notes']).filter(filter).all()    		
            return $.when(def_order)
    	},
    	fetch_data_line:function(sale_order_line,filter){
    		def_lines = sale_order_line.call('get_order_line',[filter])
    		return $.when(def_lines)
    	},
    	initialize_data:function(sale_order_filter,sale_order_line_filter){
    		var self = this
            sale_order = new instance.web.Model('singla.order')
            sale_order_line = new instance.web.Model('singla.order.line')
    		$.when(self.fetch_data_order(sale_order,[]),self.fetch_data_line(sale_order_line,[])).done(function(orders,lines){
            	self.orders = orders;
            	self.lines = lines;
            });    		
    	},
    	start: function() {
            this._super();
            var self = this;
            trial = new local.singla_order()
            trial.appendTo(self.$el.find('div.oe_form_sheet'))
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
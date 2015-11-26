from openerp import SUPERUSER_ID
from openerp import api, fields, models, _
import time
class singla_order(models.Model):
    _name = "singla.order"
    _description = "This is a order sheet"
    
    date=fields.Date('Date',default=lambda self:time.strftime("%Y-%m-%d"))
    partner_id = fields.Many2one('res.partner','Customer')
    price = fields.Float("Price")
    notes = fields.Text('Notes')
    line_ids = fields.One2many('singla.order.line','order_id','Order lines')
    
class singla_order_line(models.Model):
    _name = "singla.order.line"
    _description = "Order lines"
    size = fields.Char('Size')
    weight = fields.Float('Weight')
    price = fields.Float("Price")
    order_id = fields.Many2one('singla.order','Order')
    
    @api.model
    def get_order_line(self,filter):
        records = self.search(filter)
        res = {}
        for i in records:
            res.update({
                        i.id:{
                              'size':i.size,
                              'weight':i.weight,
                              'price':i.price,
                              'order_id':i.order_id.id
                              }
                        })
        return res
         
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

    @api.model
    def get_data(self,filter):
        records = self.search(filter)
        res = []
        for i in records:
            res.append({
                        'id':i.id,
                        'date':i.date,
                        'price':i.price,
                        'notes':i.notes,
                        'partner_id':i.partner_id.id,
                        'line_ids':[{
                              'id':j.id,
                              'size':j.size,
                              'weight':j.weight,
                              'price':j.price,
                              'order_id':j.order_id.id
                              } for j in i.line_ids]
                        
                        })
        print "************************",res
        return res    


class singla_order_line(models.Model):
    _name = "singla.order.line"
    _description = "Order lines"
    size = fields.Char('Size')
    weight = fields.Char('Weight')
    price = fields.Char("Price")
    order_id = fields.Many2one('singla.order','Order')
    

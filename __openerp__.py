# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

{
    'name': 'Singla Steel & Allied Industries',
    'version': '1.0',
    'category': 'singla',
    'sequence': 15,
    'summary': 'Order Sheets Management',
    'description': """
    """,
    'website': '',
    'depends': ['base'],
    'data': [
             'views/singla.xml',
             'singla_order.xml'
    ],
    'demo': [],
#     'css': ['static/src/css/sale.css'],
    'installable': True,
    'auto_install': False,
    'qweb': ['static/src/xml/*.xml'],
    'application': True,
}
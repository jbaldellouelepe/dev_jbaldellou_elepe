# -*- coding: utf-8 -*-
from odoo import fields, models
from odoo.addons import decimal_precision as dp


class ResCompany(models.Model):
    _inherit = "res.company"

    max_ticket_amount = fields.Float(string='Max Ticket Amount Retail', digits=dp.get_precision('Product Price'))
    max_ticket_electronic_amount = fields.Float(string='Max Ticket Electronic Amount Retail',
                                                digits=dp.get_precision('Product Price'))


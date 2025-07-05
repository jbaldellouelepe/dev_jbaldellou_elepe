from odoo import api, fields, models, _


class PosPayment(models.Model):
    _inherit = "pos.payment"

    device_ticket_nbr = fields.Char(string='Ticket Number')
    device_lot_nbr = fields.Char(string='Lot Number')

    def _export_for_ui(self, payment):
        args = super(PosPayment, self)._export_for_ui(payment)
        args['device_ticket_nbr'] = payment.device_ticket_nbr
        args['device_lot_nbr'] = payment.device_lot_nbr
        return args


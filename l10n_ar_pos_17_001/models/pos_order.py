from odoo import models, fields, api
from odoo.exceptions import UserError

class PosOrder(models.Model):
    _inherit = "pos.order"

    perception_amount = fields.Monetary(string="ARBA Perception", compute="_compute_arba_perception", store=True)

    @api.depends('partner_id', 'amount_total', 'amount_tax', 'lines')
    def _compute_arba_perception(self):
        for order in self:
            if not order.partner_id:
                order.perception_amount = 0.0
                continue

            # Buscar alícuota en la tabla
            arba_record = self.env['res.partner.arba_alicuot'].search([
                ('partner_id', '=', order.partner_id.id)
            ], limit=1)

            if not arba_record:
                order.perception_amount = 0.0
                continue  # O dejar hook para invocar webservice ARBA

            base_amount = order.amount_total
            if arba_record.withholding_amount_type == 'untaxed_amount':
                base_amount = order.amount_total - order.amount_tax

            order.perception_amount = base_amount * arba_record.alicuota_percepcion / 100.0

    @api.model
    def _prepare_invoice_lines(self, order, session=None):
        lines = super()._prepare_invoice_lines(order, session)

        if order.perception_amount:
            product = self.env.ref('product.product_product_consultant')  # fallback
            arba_product = self.env['product.product'].search([('name', '=', 'Percepción ARBA')], limit=1)
            if arba_product:
                product = arba_product

            arba_line_vals = {
                'product_id': product.id,
                'name': 'Percepción ARBA',
                'price_unit': order.perception_amount,
                'quantity': 1,
                'tax_ids': [(6, 0, [])],
            }
            lines.append((0, 0, arba_line_vals))
        return lines

    def _order_fields(self, ui_order):
        res = super()._order_fields(ui_order)
        res['perception_amount'] = ui_order.get('perception_amount', 0.0)
        return res

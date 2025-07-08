# -*- coding: utf-8 -*-
##############################################################################
#
# Copyright (C) 2022 elepe servicios SRL
# http://www.elepeservicios.com.ar
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################

from odoo import api, fields, models, _
from odoo.exceptions import UserError
import logging

_logger = logging.getLogger(__name__)


class PosOrder(models.Model):
    _inherit = "pos.order"

    @api.model
    def _payment_fields(self, order, ui_paymentline):
        payment_fields = super(PosOrder, self)._payment_fields(order, ui_paymentline)
        if ui_paymentline.get('device_ticket_nbr', None):
            payment_fields['device_ticket_nbr'] = ui_paymentline.get('device_ticket_nbr')
        if ui_paymentline.get('device_lot_nbr', None):
            payment_fields['device_lot_nbr'] = ui_paymentline.get('device_lot_nbr')
        return payment_fields

    @api.model
    def _order_fields(self, ui_order):
        order_args = super(PosOrder, self)._order_fields(ui_order)
        if order_args:
            order_args['fiscal_position_id'] = ui_order['fiscal_position_id'] if ui_order['fiscal_position_id'] else\
                self.fiscal_position_id.get_fiscal_position(ui_order['partner_id'])
        _logger.info('order args from ui {}'.format(order_args))
        return order_args

    def _check_afip_constraints(self, responsibility_id, partner_id):
        partner_data = False
        cf_type = self.env.ref('l10n_ar.res_CF')
        extranjero_type = self.env.ref('l10n_ar.res_EXT')
        sigd_type = self.env.ref('l10n_ar.it_Sigd')
        if responsibility_id.id not in [cf_type.id, extranjero_type.id]:
            # Check if partner has a valid name , address and document number
            if not partner_id.name:
                raise UserError(_('Please provide a name for the partner.'))
            if not partner_id.street:
                raise UserError(_('Please provide a street for the partner.'))
            if not partner_id.l10n_latam_identification_type_id or\
                    partner_id.l10n_latam_identification_type_id.id == sigd_type.id:
                raise UserError(_('Please provide a valid document type for the partner.'))
            if not partner_id.vat:
                raise UserError(_('Please provide a valid document number for the partner.'))
            partner_data = True
        return partner_data

    def _check_afip_journal(self, responsibility_id, partner_id):
        journal_to_use = False
        cf_type = self.env.ref('l10n_ar.res_CF')
        monotributo_type = self.env.ref('l10n_ar.res_MON_SOCIAL')
        sigd_type = self.env.ref('l10n_ar.it_Sigd')
        cuit_type = self.env.ref('l10n_ar.it_cuit')
        cuil_type = self.env.ref('l10n_ar.it_CUIL')
        if responsibility_id.id == cf_type.id:
            # Check if partner has a valid name , address and document number
            electronic = False
            for payment in self.statement_ids:
                electronic = self.env['account.journal'].check_electronic_payment_method(payment.journal_id.id)
                if electronic:
                    break
            limit_cf_amount = self.company_id.max_ticket_electronic_amount if electronic\
                else self.company_id.max_ticket_amount
            if limit_cf_amount and abs(self.amount_total) > limit_cf_amount:
                if not partner_id.name:
                    raise UserError(_('Please provide a name for the partner.'))
                if not partner_id.street:
                    raise UserError(_('Please provide a street for the partner.'))
                if partner_id.l10n_latam_identification_type_id.id in [sigd_type.id, cuit_type.id, cuil_type.id]:
                    raise UserError(_('Please provide a valid document type for the partner.'))
                if not partner_id.vat:
                    raise UserError(_('Please provide a valid document number for the partner.'))

                for afip_item in self.config_id.afip_relation_ids:
                    if monotributo_type.id == afip_item.responsibility_id.id:
                        journal_to_use = afip_item.pos_journal_id
                        break
        return journal_to_use

    def _prepare_invoice_vals(self):
        invoice_vals = super(PosOrder, self)._prepare_invoice_vals()
        active_journal = invoice_vals['journal_id']
        if self.config_id:
            for afip_item in self.config_id.afip_relation_ids:
                if self.partner_id.l10n_ar_afip_responsibility_type_id.id == afip_item.responsibility_id.id:
                    active_journal = afip_item.pos_journal_id.id
                    break
            sin_identificar = self.env.ref('l10n_ar.it_Sigd')
            if self.partner_id.l10n_latam_identification_type_id.id == sin_identificar.id and\
                    self.config_id.invoice_journal_id:
                active_journal = self.config_id.invoice_journal_id.id

        partner_check = self._check_afip_constraints(self.partner_id.l10n_ar_afip_responsibility_type_id,
                                                     self.partner_id)
        cf_journal = self._check_afip_journal(self.partner_id.l10n_ar_afip_responsibility_type_id, self.partner_id)
        invoice_vals['journal_id'] = cf_journal.id if cf_journal and cf_journal.id else active_journal
        _logger.info('invoice journal used from POS Relations: %s' % invoice_vals['journal_id'])
        return invoice_vals


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    def _compute_amount_line_all(self):
        self.ensure_one()
        fpos = self.order_id.fiscal_position_id or self.order_id.fiscal_position_id.\
            get_fiscal_position(self.order_id.partner_id.id)
        tax_ids_after_fiscal_position = fpos.map_tax(self.tax_ids, self.product_id, self.order_id.partner_id)
        price = self.price_unit * (1 - (self.discount or 0.0) / 100.0)
        taxes = tax_ids_after_fiscal_position.compute_all(price, self.order_id.pricelist_id.currency_id, self.qty,
                                                          product=self.product_id, partner=self.order_id.partner_id)
        return {
            'price_subtotal_incl': taxes['total_included'],
            'price_subtotal': taxes['total_excluded'],
        }

# -*- coding: utf-8 -*-
##############################################################################
#
# Copyright (C) 2019 elepe servicios SRL
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

from odoo import api, models, fields
from odoo.exceptions import UserError
import logging
import re
from odoo import SUPERUSER_ID
from functools import reduce

_logger = logging.getLogger(__name__)


class ResPartner(models.Model):
    _inherit = "res.partner"

    @api.model
    def create_from_ui(self, partner):
        if partner.get('responsibility_id', None):
            partner['l10n_ar_afip_responsibility_type_id'] = int(partner['responsibility_id'])
            # Check document data
            document_type_id = int(partner['l10n_latam_identification_type_id'])
            document_number = partner['vat']
            if document_number and not document_number.isdigit():
                document_number = re.sub('[^1234567890]', '', str(document_number.encode('utf-8')))
            if document_number and document_type_id and document_number.isdigit():
                partner['vat'] = document_number

        return super(ResPartner, self).create_from_ui(partner)

    def get_all_partner_taxes(self):
        tax_tag = self.env['account.tax'].search([('type_tax_use', '=', 'sale'),
                                                  ('amount_type', 'in', ('fixed', 'partner_tax')),
                                                  ('active', '=', True)])
        tax_list = list()
        partner_tax_list = dict()
        date = self._context.get('invoice_date', fields.Date.context_today(self))
        for partner in self:
            partner_rec = partner and partner.sudo()
            if partner_rec.arba_alicuot_ids:
                tags_used = [item.tag_id.id for item in partner_rec.arba_alicuot_ids]
                for line in tax_tag.invoice_repartition_line_ids:
                    for tag in line.tag_ids:
                        if tag.id in tags_used:
                            tax_repartition_lines = line.tax_id.invoice_repartition_line_ids.\
                                filtered(lambda x: x.repartition_type == 'tax')
                            if line.tax_id.amount_type == 'partner_tax':
                                tax_amount = line.tax_id.with_user(SUPERUSER_ID).\
                                    get_partner_alicuota_percepcion(partner_rec, date)
                            else:
                                total_factor = sum(tax_repartition_lines.mapped('factor'))
                                tax_amount = line.tax_id.amount * total_factor
                            tax_list.append({'id': line.tax_id.id, 'amount': tax_amount,
                                             'partner_id': partner_rec.id})
                _logger.info('tax list {}'.format(tax_list))
        return tax_list

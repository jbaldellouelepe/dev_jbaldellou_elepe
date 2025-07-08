# -*- coding: utf-8 -*-
from odoo import api, fields, models, tools, _
from odoo.exceptions import UserError

import logging
_logger = logging.getLogger(__name__)


class PosSession(models.Model):
    _inherit = "pos.session"
 
    def name_get(self):
        result = []
        for session in self:
            name = session.config_id.name + '-' + session.name
            result.append((session.id, name))
        return result

    def _pos_data_process(self, loaded_data):
        res = super()._pos_data_process(loaded_data)
        partner = self.env["res.partner"].search([('id', '=', self.id)],limit=1)
        fpos = partner.property_account_position_id
        loaded_data['partner_tax_ids'] = fpos.tax_ids.tax_dest_id.ids if fpos else []
        return res
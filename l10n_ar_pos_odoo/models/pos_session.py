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

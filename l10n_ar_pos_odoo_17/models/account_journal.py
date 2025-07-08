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

from odoo import api, models, _
import logging

_logger = logging.getLogger(__name__)


class AccountJournal(models.Model):
    _inherit = "account.journal"

    @api.model
    def check_electronic_payment_method(self, journal_id):
        _logger.info(_('checking payment journal id %s' % str(journal_id)))
        journals = self.env['account.journal'].search([('id', '=', journal_id)])
        for record in journals:
            electronic = any(pm.code == 'electronic' for pm in record.inbound_payment_method_ids)
            _logger.info(_('found payment journal %s, is electronic? %s' % (record.name, str(electronic))))
            return electronic





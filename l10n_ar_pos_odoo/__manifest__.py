# -*- coding: utf-8 -*-
{
    'name': "l10n_ar extension for Odoo POS",
    'version': '1.0',
    'category': 'Point of Sale',
    'author': 'elepe servicios SRL',
    'website': 'http://www.elepeservicios.com.ar',
    'summary': """ l10n_ar support for Odoo POS""",
    'description': """l10n_ar support for Odoo POS""",
    'sequence': 0,
    'depends': [
        'point_of_sale',
        'l10n_ar',
        'l10n_ar_account_withholding',
    ],
    'demo': [],
    'data': [
        'security/ir.model.access.csv',
        'import/import_libraries.xml',
        'views/afip_pos_relation_views.xml',
        'views/pos_config_views.xml',
        'views/pos_order.xml',
        'views/res_company_view.xml',
    ],
    'qweb': [
        'static/src/xml/credit_card_popup.xml',
        # 'static/src/xml/*.xml'
    ],
    'installable': True,
    'application': True,
    'images': ['static/description/icon.png'],
    'support': 'atencionalcliente@elepeservicios.com.ar',
    "license": "OPL-1",
}

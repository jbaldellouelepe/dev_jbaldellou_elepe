{
    "name": "POS ARBA Perception",
    "version": "17.0.1.0.0",
    "category": "Point of Sale",
    "summary": "Adds ARBA IIBB perception to POS orders",
    "depends": ["point_of_sale", "l10n_ar", "l10n_ar_account_withholding"],
    "data": [
        "views/assets.xml"
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "l10n_ar_pos_17_001/static/src/js/pos_arba_hook.js",
        ]
    },
    "installable": True,
    "auto_install": False,
    "application": False
}

odoo.define('l10n_ar_pos_odoo.credit_card_popup', function (require) {
    'use strict';

    const { useState, useRef } = owl.hooks;
    const AbstractAwaitablePopup = require('point_of_sale.AbstractAwaitablePopup');
    const Registries = require('point_of_sale.Registries');

    class CreditCardInfoPopup extends AbstractAwaitablePopup {
        constructor() {
            super(...arguments);
            this.state = useState({ ticket_nbr: this.props.ticket_nbr, lot_nbr: this.props.lot_nbr});
            this.ticketnbrRef = useRef('ticket_nbr');
            this.lotnbrRef = useRef('lot_nbr');
        }
        mounted() {
            this.ticketnbrRef.el.focus();
        }
        getPayload() {
            return this.state;
        }
    }
    CreditCardInfoPopup.template = 'CreditCardPopup';
    CreditCardInfoPopup.defaultProps = {
        confirmText: 'Ok',
        cancelText: 'Cancel',
        title: 'Credit Card Info',
        body: '',
        ticket_nbr: '',
        lot_nbr: '',
    };

    Registries.Component.add(CreditCardInfoPopup);

    return CreditCardInfoPopup;

});

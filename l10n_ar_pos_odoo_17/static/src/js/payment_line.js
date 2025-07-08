import { patch } from '@web/core/utils/patch';
import { Paymentline } from 'point_of_sale.models';

patch(Paymentline.prototype, 'l10n_ar_pos_odoo.payment_line', {
    initialize(attributes, options) {
        this.device_ticket_nbr = null;
        this.device_lot_nbr = null;
        this._super(...arguments);
    },

    set_ticket_nbr(value) {
        this.device_ticket_nbr = value;
        this.trigger('change', this);
    },

    set_lot_nbr(value) {
        this.device_lot_nbr = value;
        this.trigger('change', this);
    },

    get_ticket_nbr() {
        return this.device_ticket_nbr;
    },

    get_lot_nbr() {
        return this.device_lot_nbr;
    },

    export_as_JSON() {
        const json = this._super(...arguments);
        if (this.device_ticket_nbr) {
            json.device_ticket_nbr = this.device_ticket_nbr;
        }
        if (this.device_lot_nbr) {
            json.device_lot_nbr = this.device_lot_nbr;
        }
        return json;
    },

    export_for_printing() {
        const json = this._super(...arguments);
        if (this.device_ticket_nbr) {
            json.device_ticket_nbr = this.device_ticket_nbr;
        }
        if (this.device_lot_nbr) {
            json.device_lot_nbr = this.device_lot_nbr;
        }
        return json;
    },
});

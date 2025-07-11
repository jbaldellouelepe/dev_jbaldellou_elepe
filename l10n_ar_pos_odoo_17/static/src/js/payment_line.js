/** @odoo-module **/

import { patch } from '@web/core/utils/patch';
import { registry } from '@web/core/registry/store';

// Accedemos al modelo de Paymentline desde el registry
const paymentLineModel = registry.category('models').get('payment_line');

patch(paymentLineModel.model.prototype, {
    setup(attributes, options) {
        super.setup?.(attributes, options);
        this.device_ticket_nbr = null;
        this.device_lot_nbr = null;
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
        const json = super.export_as_JSON(...arguments);
        if (this.device_ticket_nbr) {
            json.device_ticket_nbr = this.device_ticket_nbr;
        }
        if (this.device_lot_nbr) {
            json.device_lot_nbr = this.device_lot_nbr;
        }
        return json;
    },

    export_for_printing() {
        const json = super.export_for_printing(...arguments);
        if (this.device_ticket_nbr) {
            json.device_ticket_nbr = this.device_ticket_nbr;
        }
        if (this.device_lot_nbr) {
            json.device_lot_nbr = this.device_lot_nbr;
        }
        return json;
    },
});

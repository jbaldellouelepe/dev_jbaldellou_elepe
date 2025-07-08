/** @odoo-module **/
import { patch } from "@web/core/utils/patch";
import { Order } from "@point_of_sale/app/store/models";

patch(Order.prototype, {
    get_total_with_perception() {
        return this.get_total_with_tax() + (this.perception_amount || 0);
    },
});

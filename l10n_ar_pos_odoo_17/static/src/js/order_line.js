/** @odoo-module **/

import { Orderline } from "@point_of_sale/app/store/models";
import { patch } from '@web/core/utils/patch';

patch(Orderline.prototype, {
    get_all_prices() {
        const tax_result_dict = super.get_all_prices(...arguments);
        console.log('🧾 order line taxes computed:', tax_result_dict);
        return tax_result_dict;
    },

    export_as_JSON() {
        const json = super.export_as_JSON(...arguments);
        console.log('📤 order line to export:', json);
        return json;
    },

    get_applicable_taxes() {
        const product = this.get_product();
        const taxes_ids = product.taxes_id?.filter(t => t in this.pos.taxes_by_id) || [];
        const product_taxes = this.get_taxes_after_fp(taxes_ids);

        const ptaxes_set = {};
        for (const tax of product_taxes) {
            ptaxes_set[tax.id] = true;
        }

        const final_taxes = this.pos.taxes.filter(t => ptaxes_set[t.id]);
        console.log('✅ computed taxes in order line:', final_taxes);
        return final_taxes;
    },

    get_taxes_after_fp(taxes_ids) {
        let product_taxes = [];

        for (const id of taxes_ids) {
            const tax = this.pos.taxes_by_id[id];
            if (tax) {
                product_taxes.push(...this._map_tax_fiscal_position(tax, this.order));
            }
        }

        const client = this.order?.get_client?.();

        if (client && this.pos.partner_taxes_by_id?.[client.id]) {
            for (const partner_tax of this.pos.partner_taxes_by_id[client.id]) {
                const tax = this.pos.taxes_by_id[partner_tax.id];
                if (tax) {
                    tax.amount = partner_tax.amount;
                    product_taxes.push(...this._map_tax_fiscal_position(tax, this.order));
                }
            }
        }

        // Eliminar duplicados por ID
        product_taxes = [...new Map(product_taxes.map(t => [t.id, t])).values()];
        return product_taxes;
    },

});

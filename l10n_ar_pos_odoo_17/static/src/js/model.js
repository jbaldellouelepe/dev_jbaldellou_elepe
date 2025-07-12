/** @odoo-module **/

import { PosStore } from "@point_of_sale/app/store/pos_store";
import { patch } from "@web/core/utils/patch";

patch(PosStore.prototype, {
    async load_server_data() {
        // Llamamos primero al método original
        await this._super(...arguments);
        console.log("✅ PosStore.load_server_data ejecutado - model.js");

//        // Obtener IDs de partners (con chequeo por si están undefined)
//        const partnerIds = (this.partners || []).map(partner => partner.id);
//
//        // Cargar impuestos por partner
//        const partner_taxes = await this.env.services.rpc({
//            model: 'res.partner',
//            method: 'get_all_partner_taxes',
//            args: [partnerIds],
//        });
//
//        this.partner_taxes_by_id = {};
//        partner_taxes.forEach((tax) => {
//            if (!this.partner_taxes_by_id[tax.partner_id]) {
//                this.partner_taxes_by_id[tax.partner_id] = [];
//            }
//            this.partner_taxes_by_id[tax.partner_id].push(tax);
//        });
//
//        // Cargar tipos de documento (DNI, CUIT, etc.)
//        const document_types = await this.env.services.rpc({
//            model: 'l10n_latam.identification.type',
//            method: 'search_read',
//            args: [[], ['name']],
//        });
//        this.document_types = document_types;
//
//        // Cargar responsabilidades AFIP
//        const afip_responsibilities = await this.env.services.rpc({
//            model: 'l10n_ar.afip.responsibility.type',
//            method: 'search_read',
//            args: [[], ['name', 'code']],
//        });
//        this.afip_responsibilities = afip_responsibilities;
//
//        // Si tu PosDB lo extiende, esto lo guarda ahí
//        if (this.db.add_responsibilities) {
//            this.db.add_responsibilities(afip_responsibilities);
//        }
    }
});

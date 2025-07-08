import { patch } from '@web/core/utils/patch';
import { PosDB } from 'point_of_sale.DB';
import { unaccent } from 'web.utils';

patch(PosDB.prototype, 'l10n_ar_pos_odoo.database', {
    init(options) {
        this._super(...arguments);
        this.responsibility_by_id = {};
        this.partner_by_doc_number = {};
    },

    _partner_search_string(partner) {
        let str = partner.name;
        if (partner.barcode) {
            str += '|' + partner.barcode;
        }
        if (partner.l10n_latam_identification_type_id) {
            str += '|' + partner.l10n_latam_identification_type_id[1];
        }
        if (partner.vat) {
            str += '|' + partner.vat;
        }
        if (partner.address) {
            str += '|' + partner.address;
        }
        if (partner.phone) {
            str += '|' + partner.phone.split(' ').join('');
        }
        if (partner.mobile) {
            str += '|' + partner.mobile.split(' ').join('');
        }
        if (partner.email) {
            str += '|' + partner.email;
        }
        str = '' + partner.id + ':' + str.replace(':', '') + '\n';
        return str;
    },

    add_partners(partners) {
        let updated_count = 0;
        let new_write_date = '';
        let partner;
        for (let i = 0, len = partners.length; i < len; i++) {
            partner = partners[i];
            console.log(' loading partner ' + JSON.stringify(partner));
            const local_partner_date = (this.partner_write_date || '').replace(
                /^(\d{4}-\d{2}-\d{2}) ((\d{2}:?){3})$/,
                '$1T$2Z'
            );
            const dist_partner_date = (partner.write_date || '').replace(
                /^(\d{4}-\d{2}-\d{2}) ((\d{2}:?){3})$/,
                '$1T$2Z'
            );
            if (
                this.partner_write_date &&
                this.partner_by_id[partner.id] &&
                new Date(local_partner_date).getTime() + 1000 >= new Date(dist_partner_date).getTime()
            ) {
                continue;
            } else if (new_write_date < partner.write_date) {
                new_write_date = partner.write_date;
            }
            if (!this.partner_by_id[partner.id]) {
                this.partner_sorted.push(partner.id);
            }
            partner.with_partner_tax = true;
            this.partner_by_id[partner.id] = partner;
            console.log(' updated partner ' + JSON.stringify(this.partner_by_id[partner.id]));

            updated_count += 1;
        }

        this.partner_write_date = new_write_date || this.partner_write_date;

        if (updated_count) {
            this.partner_search_string = '';
            this.partner_by_barcode = {};

            for (const id in this.partner_by_id) {
                partner = this.partner_by_id[id];

                if (partner.barcode) {
                    this.partner_by_barcode[partner.barcode] = partner;
                }
                partner.address =
                    (partner.street ? partner.street + ', ' : '') +
                    (partner.zip ? partner.zip + ', ' : '') +
                    (partner.city ? partner.city + ', ' : '') +
                    (partner.state_id ? partner.state_id[1] + ', ' : '') +
                    (partner.country_id ? partner.country_id[1] : '');
                this.partner_search_string += this._partner_search_string(partner);
            }

            this.partner_search_string = unaccent(this.partner_search_string);
        }
        return updated_count;
    },

    add_responsibilities(responsibilities) {
        let updated_count = 0;
        let responsibility;
        for (let i = 0, len = responsibilities.length; i < len; i++) {
            responsibility = responsibilities[i];
            this.responsibility_by_id[responsibility.id] = responsibility;
            updated_count += 1;
        }
        return updated_count;
    },

    get_partner_by_doc_number(document_number) {
        return this.partner_by_doc_number[document_number];
    },

    get_responsibility_by_id(responsibility) {
        return this.responsibility_by_id[responsibility];
    },
});

const {GraphVertex} = require('../../../data-structures');
const moment = require('moment');
require('moment/locale/uk');
moment.locale('uk');

class Success extends GraphVertex {
    constructor(value) {
        super(value);

        this.db = value.firestore;
    }

    render(ctx) {

    }

    handle(ctx) {
        return null;

    }

    isFullfilled(ctx) {
        return true;
    }

    cleanUp(ctx) {
        ctx.session.quote[this.getKey()] = null;
    }

    getKey() {
        return 'success';
    }
}

module.exports = Success;

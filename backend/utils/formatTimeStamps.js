const { default: ModelManager } = require("sequelize/lib/model-manager");

const formatTimestamps = (result) => {

    if (Array.isArray(result)) {
        return result.map(element => {
            element = element.toJSON()
            if (element.startDate) {
                element.startDate = element.startDate.toISOString().slice(0, 10)
                element.endDate = element.endDate.toISOString().slice(0, 10)
            }
            element.createdAt = element.createdAt.toISOString().slice(0, 19).replace('T', ' ');
            element.updatedAt = element.updatedAt.toISOString().slice(0, 19).replace('T', ' ');
            return element;
        });
    } else {
        result = result.toJSON()
        if (result.startDate) {
            result.startDate = result.startDate.toISOString().slice(0, 10)
            result.endDate = result.endDate.toISOString().slice(0, 10)
        }
        result.createdAt = result.createdAt.toISOString().slice(0, 19).replace('T', ' ');
        result.updatedAt = result.updatedAt.toISOString().slice(0, 19).replace('T', ' ');
        return result;
    }

};

module.exports = formatTimestamps

module.exports = {
    replaceAll: function(str, search, replacement) {
        return str.split(search).join(replacement);
    },
    normalizeCity: function (uf, city) {
        return (uf + "_" + city).replace(/[^A-Za-z0-9_]/g,"").toLowerCase();
    }
}
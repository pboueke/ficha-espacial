module.exports = {
    replaceAll: function(str, search, replacement) {
        return str.split(search).join(replacement);
    }
}
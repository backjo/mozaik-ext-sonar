var convict = require('convict');

var config = convict({
    sonar: {
        baseUrl: {
            doc:    'The sonar API base url.',
            default: null,
            format: String,
            env: 'SONAR_API_BASE_URL'
        }
    }
});

module.exports = config;
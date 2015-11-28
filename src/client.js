import request from 'superagent';
import config  from './config';
import Promise from 'bluebird';
import chalk   from 'chalk';
require('superagent-bluebird-promise');


/**
 * @param {Mozaik} mozaik
 */
const client = function (mozaik) {

    mozaik.loadApiConfig(config);

    function buildRequest(path) {
        let url = config.get('sonar.baseUrl') + path;

        mozaik.logger.info(chalk.yellow(`[jenkins] fetching from ${ url }`));

        return request.get(url)
            .promise()
        ;
    }

    return {
        coverageHistory: function(params) {
            return buildRequest(`/api/timemachine?resource=${params.id}&metrics=line_coverage,branch_coverage`)
                .then(function(res) {
                    return res.body;
                });
        }
    };
};


export { client as default };

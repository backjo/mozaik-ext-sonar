var format = require('string-format');
var React = require('react');
var Reflux = require('reflux');
var classSet = require('react-classset');
var c3 = require('c3');
var _ = require('lodash');
var moment = require('moment');
var ApiConsumerMixin = require('mozaik/browser').Mixin.ApiConsumer;


class TimeseriesChart {

    constructor(bindTo, opts) {
        opts = opts || {};
        this.chart = c3.generate({
            bindto: bindTo,
            transition: {
                // Skipping transition for now
                duration: null
            },
            data: {
                labels: true,
                x: 'x',
                xFormat: '%Y-%m-%d',
                columns: []
            },
            axis: {
                x: {
                    type: 'timeseries',
                    tick: {
                        format: function(x) {
                            return moment(x).format('MM/D');
                        },
                        count: opts.tickCount
                    }
                },
                y: {
                    min: 0
                }
            }
        });
    }

    load(data) {
        return this.chart.load(data);
    }

    loadEntries(entries) {
        var xData = [];
        var visitsData = [];
        var sessionsData = [];
        var weekDayRegions = [];

        if (!entries || entries.length === 0) {
            console.warn('No statistics provided');
            return;
        }

        _.each(entries, function(entry) {
            //
            //var entryObj = _.zipObject(['date', 'views', 'sessions'], entry);
            var date = moment(entry.d, 'YYYYMMDD');

            // Mark Sat and Sun with region
            if (_.contains([6, 7], date.isoWeekday())) {
                var weekDayRegion = {
                    start: date.format('YYYY-MM-DD'),
                    end: date.format('YYYY-MM-DD')
                };
                weekDayRegions.push(weekDayRegion);
            };

            xData.push(date.format('YYYY-MM-DD'));
            visitsData.push(parseInt(entry.v[0], 10));
            sessionsData.push(parseInt(entry.v[1], 10));
        });

        return this.load({
            columns: [
                ['x'].concat(xData),
                ['Line Coverage'].concat(visitsData),
                ['Branch Coverage'].concat(sessionsData)
            ],
            regions: weekDayRegions
        });
    }
};


var CoverageHistogram = React.createClass({
    chartClassName: 'chart',
    chart: null,

    mixins: [
        Reflux.ListenerMixin,
        ApiConsumerMixin
    ],

    propTypes: {
        id: React.PropTypes.string.isRequired
    },

    getInitialState() {
        return {
            total: null,
            avg: null,
            entries: []
        }
    },

    componentDidMount() {
        var chartElement = this.getDOMNode().getElementsByClassName(this.chartClassName)[0];
        this.chart = new TimeseriesChart(chartElement, {
            min: this.props.min,
            max: this.props.max,
            tickCount: this.props.tickCount,
            dateFormat: this.props.dateFormat
        });
    },

    componentWillUnmount() {
        if (this.chart) {
            this.chart.destroy();
        }
    },

    getApiRequest() {
        var id = format('analytics.coverageHistory.{}', this.props.id);

        return {
            id: id,
            params: {
                id: this.props.id
            }
        };
    },

    onApiData(data) {

        this.setState({
            total: 400,
            avg: 50,
            entries: data[0].cells
        });

        this.chart.loadEntries(this.state.entries);
    },

    render() {
        var title = this.props.title || 'Analytics';
        var avg = this.state.avg || '-';
        var total = this.state.total || '-';

        var widget = (
            <div>
                <div className="widget__header">
                    {title}
          <span className="widget__header__count">
          </span>
                    <i className="fa fa-line-chart" />
                </div>
                <div className="widget__body">
                    <div className={this.chartClassName}></div>
                </div>
            </div>
        );

        return widget;
    }
});

module.exports = CoverageHistogram;

Lugosium.Dashboard.Network = {
    networkMonitorTitle: 'Network Monitor',

    networkMonitorId: 'network-chart',

    period: 'today',

    periodSettings: {
        lastyear: {text: 'Last Year', tickInterval: null},
        lastmonth: {text: 'Last Month', tickInterval: null},
        lastweek: {text: 'Last Week', tickInterval: 3600*24*1000},
        lastday: {text: 'Yesterday', tickInterval: 3600*1000},
        today: {text: 'Today', tickInterval: 3600*1000}
    },

    networkMonitor: null,

    rangeButtons: {
        lastYearButton: {
            _titleKey: 'lastyear',
            text: 'Last Year',
            onclick: function() {
                Lugosium.Dashboard.Network.setPeriod('lastyear');
            }
        },
        lastMonthButton: {
            _titleKey: 'lastmonth',
            text: 'Last Month',
            onclick: function() {
                Lugosium.Dashboard.Network.setPeriod('lastmonth');
            }
        },
        lastWeekButton: {
            _titleKey: 'lastweek',
            text: 'Last Week',
            onclick: function() {
                Lugosium.Dashboard.Network.setPeriod('lastweek');
            }
        },
        lastDayButton: {
            _titleKey: 'lastday',
            text: 'Yesterday',
            onclick: function() {
                Lugosium.Dashboard.Network.setPeriod('lastday');
            }
        },
        todayButton: {
            _titleKey: 'today',
            text: 'Today',
            onclick: function() {
                Lugosium.Dashboard.Network.setPeriod('today');
            }
        }
    },

    setPeriod: function(period)
    {
        Lugosium.Dashboard.Network.period = period;
        Lugosium.Dashboard.Network.createMonitor();
    },

    getRestParams: function()
    {
        return {
            model: 'ovhVpsMonitor',
            method: 'getVpsMonitorData',
            params: {
                'vpsName': Lugosium.Dashboard.getCurrentVps(),
                'period': Lugosium.Dashboard.Network.period
            }
        };
    },

    createMonitor: function()
    {
        try {
            $('#dashboard').append('<div id="network-chart"></div>');
            var _updateCallback = function() {
                try {
                    var networkData = Lugosium.Dashboard.getData(Lugosium.Dashboard.Network.getRestParams());

                    if (networkData == false) {
                        return;
                    }
                    var points = {
                        'memused': networkData['net:tx'].values.reverse().shift(),
                        'memmax': networkData['net:rx'].values.reverse().shift()
                    };
                    Lugosium.Dashboard.Network.networkMonitor.series[0].addPoint(points.memused, true);
                    Lugosium.Dashboard.Network.networkMonitor.series[1].addPoint(points.memmax, true);
                } catch (e) {
                    Lugosium.Dashboard.deleteInterval('network');
                    var message = 'Error, can not update the network chart';
                    Lugosium.Dashboard.displayWarning(message, Lugosium.Dashboard.Network.getElement());
                }
            }
            Lugosium.Dashboard.Network.createVpsNetworkMonitor();
            Lugosium.Dashboard.intervals.network = setInterval(_updateCallback, Lugosium.Dashboard.frequency.update);
        } catch (e) {
            Lugosium.Dashboard.deleteInterval('network');
            throw e;
        }
    },

    createVpsNetworkMonitor: function()
    {
        try {
            // Create container for network chart
            Lugosium.Dashboard.deleteInterval('network');

            var networkData = Lugosium.Dashboard.getData(Lugosium.Dashboard.Network.getRestParams());
            var period = Lugosium.Dashboard.Network.periodSettings[Lugosium.Dashboard.Network.period];

            if (networkData == false) {
                return;
            }

            Lugosium.Dashboard.Network.networkMonitor = new Highcharts.Chart({
                chart: {
                    renderTo: Lugosium.Dashboard.Network.networkMonitorId,
                    type: 'area'
                },
                title: {
                    text: Lugosium.Dashboard.Network.networkMonitorTitle
                },
                subtitle: {
                    text: $('#form_vps option:selected').text()
                },
                xAxis:{
                    type: 'datetime',
                    tickInterval: period.tickInterval,
                    title: {
                        text: 'Date'
                    }
                },
                yAxis: {
                    title: {
                        text: 'Megabytes'
                    }
                },
                exporting: {
                    buttons: Lugosium.Dashboard.Network.rangeButtons
                },
                plotOptions: {
                    series: {
                        marker: {
                            enabled: false,
                            states: {
                                hover: {
                                    enabled: true
                                }
                            }
                        }
                    }
                },
                tooltip: {
                    valueSuffix: networkData['net:tx'].unit,
                    valueDecimals: 2,
                    shared: true,
                    xDateFormat: '%Y-%m-%d %H:%M:%S'
                },
                series: [{
                    name: 'Network RX',
                    data: networkData['net:rx'].values
                }, {
                    name: 'Network TX',
                    data: networkData['net:tx'].values
                }]
            });

            // Keep style for period button selected after mouse over
            Lugosium.Dashboard.Network.getElement().find('g.highcharts-button').mouseleave(function () {
                Lugosium.Dashboard.setSelectedButton(Lugosium.Dashboard.Network.getElement(), period.text);
            });
            Lugosium.Dashboard.setSelectedButton(Lugosium.Dashboard.Network.getElement(), period.text);
        } catch (e) {
            Lugosium.Dashboard.deleteInterval('network');
            var message = 'Error, can not create network chart';
            Lugosium.Dashboard.displayWarning(message, $('#network-chart'));
            throw e;
        }
    },

    getElement: function()
    {
        return $('#' + Lugosium.Dashboard.Network.networkMonitorId);
    }
}


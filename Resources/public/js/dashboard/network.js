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
            if (jQuery('#' + Lugosium.Dashboard.Network.networkMonitorId).length == 0) {
                Lugosium.Dashboard.getElement().append('<div id="' + Lugosium.Dashboard.Network.networkMonitorId + '"></div>');
            } else {
                jQuery('#' + Lugosium.Dashboard.Network.networkMonitorId).empty();
            }
            jQuery('#' + Lugosium.Dashboard.Network.networkMonitorId).append(
                '<h3>Network Monitor is loading</h3>' +
                '<div class="spinner">' +
                '    <div class="bounce1"></div>' +
                '    <div class="bounce2"></div>' +
                '    <div class="bounce3"></div>' +
                '</div>'
            );
            Lugosium.Dashboard.getData(Lugosium.Dashboard.Network.getRestParams(), Lugosium.Dashboard.Network.createVpsNetworkMonitor);
        } catch (e) {
            Lugosium.Dashboard.deleteInterval('network');
            throw e;
        }
    },

    createVpsNetworkMonitor: function(networkData)
    {
        try {
            // Create container for network chart
            Lugosium.Dashboard.deleteInterval('network');

            var period = Lugosium.Dashboard.Network.periodSettings[Lugosium.Dashboard.Network.period];

            if (networkData == false) {
                return;
            }
            jQuery('#' + Lugosium.Dashboard.Network.networkMonitorId).empty();
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
            var _updateCallback = function() {
                Lugosium.Dashboard.getData(
                    Lugosium.Dashboard.Network.getRestParams(),
                    function(networkData) {
                        if (networkData == false) {
                            var message = 'Error, can not update the network chart';
                            Lugosium.Dashboard.displayWarning(message, Lugosium.Dashboard.Network);

                            return;
                        }
                        var points = {
                            'memused': networkData['net:tx'].values.reverse().shift(),
                            'memmax': networkData['net:rx'].values.reverse().shift()
                        };
                        Lugosium.Dashboard.Network.networkMonitor.series[0].addPoint(points.memmax, true);
                        Lugosium.Dashboard.Network.networkMonitor.series[1].addPoint(points.memused, true);
                    }
                );
            };
            Lugosium.Dashboard.intervals.network = setInterval(_updateCallback, Lugosium.Dashboard.frequency.update);
        } catch (e) {
            Lugosium.Dashboard.deleteInterval('network');
            var message = 'Error, can not create network chart';
            Lugosium.Dashboard.displayWarning(message, Lugosium.Dashboard.Network);
            throw e;
        }
    },

    getElement: function()
    {
        return $('#' + Lugosium.Dashboard.Network.networkMonitorId);
    }
};


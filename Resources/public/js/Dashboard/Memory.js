Lugosium.Dashboard.Memory = {
    memoryMonitorTitle: 'Memory Monitor',

    memoryMonitorId: 'memory-chart',

    period: 'today',

    periodSettings: {
        lastyear: {text: 'Last Year', tickInterval: null},
        lastmonth: {text: 'Last Month', tickInterval: null},
        lastweek: {text: 'Last Week', tickInterval: 3600*24*1000},
        lastday: {text: 'Yesterday', tickInterval: 3600*1000},
        today: {text: 'Today', tickInterval: 3600*1000}
    },

    memoryMonitor: null,

    rangeButtons: {
        lastYearButton: {
            _titleKey: 'lastyear',
            text: 'Last Year',
            onclick: function() {
                Lugosium.Dashboard.Memory.setPeriod('lastyear');
            }
        },
        lastMonthButton: {
            _titleKey: 'lastmonth',
            text: 'Last Month',
            onclick: function() {
                Lugosium.Dashboard.Memory.setPeriod('lastmonth');
            }
        },
        lastWeekButton: {
            _titleKey: 'lastweek',
            text: 'Last Week',
            onclick: function() {
                Lugosium.Dashboard.Memory.setPeriod('lastweek');
            }
        },
        lastDayButton: {
            _titleKey: 'lastday',
            text: 'Yesterday',
            onclick: function() {
                Lugosium.Dashboard.Memory.setPeriod('lastday');
            }
        },
        todayButton: {
            _titleKey: 'today',
            text: 'Today',
            onclick: function() {
                Lugosium.Dashboard.Memory.setPeriod('today');
            }
        }
    },

    setPeriod: function(period)
    {
        Lugosium.Dashboard.Memory.period = period;
        Lugosium.Dashboard.Memory.createMonitor();
    },

    getRestParams: function()
    {
        return {
            model: 'ovhVpsMonitor',
            method: 'getVpsMonitorData',
            params: {
                'vpsName': Lugosium.Dashboard.getCurrentVps(),
                'period': Lugosium.Dashboard.Memory.period
            }
        };
    },

    createMonitor: function()
    {
        try {
            $('#dashboard').append('<div id="memory-chart"></div>');
            var _updateCallback = function() {
                try {
                    var memoryData = Lugosium.Dashboard.getData(Lugosium.Dashboard.Memory.getRestParams());

                    if (memoryData == false) {
                        return;
                    }
                    var points = {
                        'memused': memoryData['mem:used'].values.reverse().shift(),
                        'memmax': memoryData['mem:max'].values.reverse().shift()
                    };
                    Lugosium.Dashboard.Memory.memoryMonitor.series[0].addPoint(points.memused, true);
                    Lugosium.Dashboard.Memory.memoryMonitor.series[1].addPoint(points.memmax, true);
                } catch (e) {
                    Lugosium.Dashboard.deleteInterval('memory');
                    var message = 'Error, can not update the memory chart';
                    Lugosium.Dashboard.displayWarning(message, Lugosium.Dashboard.Memory.getElement());
                }
            }
            Lugosium.Dashboard.Memory.createVpsMemoryMonitor();
            Lugosium.Dashboard.intervals.memory = setInterval(_updateCallback, Lugosium.Dashboard.frequency.update);
        } catch (e) {
            Lugosium.Dashboard.deleteInterval('memory');
            throw e;
        }
    },

    createVpsMemoryMonitor: function()
    {
        try {
            // Create container for memory chart
            Lugosium.Dashboard.deleteInterval('memory');

            var memoryData = Lugosium.Dashboard.getData(Lugosium.Dashboard.Memory.getRestParams());
            var period = Lugosium.Dashboard.Memory.periodSettings[Lugosium.Dashboard.Memory.period];

            if (memoryData == false) {
                return;
            }

            Lugosium.Dashboard.Memory.memoryMonitor = new Highcharts.Chart({
                chart: {
                    renderTo: Lugosium.Dashboard.Memory.memoryMonitorId,
                    type: 'area'
                },
                title: {
                    text: Lugosium.Dashboard.Memory.memoryMonitorTitle
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
                    buttons: Lugosium.Dashboard.Memory.rangeButtons
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
                    valueSuffix: memoryData['mem:used'].unit,
                    valueDecimals: 2,
                    shared: true,
                    xDateFormat: '%Y-%m-%d %H:%M:%S'
                },
                series: [{
                    name: 'Max Memory',
                    data: memoryData['mem:max'].values
                }, {
                    name: 'Used Memory',
                    data: memoryData['mem:used'].values
                }]
            });

            // Keep style for period button selected after mouse over
            Lugosium.Dashboard.Memory.getElement().find('g.highcharts-button').mouseleave(function () {
                Lugosium.Dashboard.setSelectedButton(Lugosium.Dashboard.Memory.getElement(), period.text);
            });
            Lugosium.Dashboard.setSelectedButton(Lugosium.Dashboard.Memory.getElement(), period.text);
        } catch (e) {
            Lugosium.Dashboard.deleteInterval('memory');
            var message = 'Error, can not create memory chart';
            Lugosium.Dashboard.displayWarning(message, $('#memory-chart'));
            throw e;
        }
    },

    getElement: function()
    {
        return $('#' + Lugosium.Dashboard.Memory.memoryMonitorId);
    }
}


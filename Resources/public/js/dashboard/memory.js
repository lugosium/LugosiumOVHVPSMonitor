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
            if (jQuery('#' + Lugosium.Dashboard.Memory.memoryMonitorId).length == 0) {
                Lugosium.Dashboard.getElement().append('<div id="' + Lugosium.Dashboard.Memory.memoryMonitorId + '"></div>');
            } else {
                jQuery('#' + Lugosium.Dashboard.Memory.memoryMonitorId).empty();
            }
            jQuery('#' + Lugosium.Dashboard.Memory.memoryMonitorId).append(
                '<h3>Memory Monitor is loading</h3>' +
                '<div class="spinner">' +
                '    <div class="bounce1"></div>' +
                '    <div class="bounce2"></div>' +
                '    <div class="bounce3"></div>' +
                '</div>'
            );
            Lugosium.Dashboard.getData(
                Lugosium.Dashboard.Memory.getRestParams(),
                Lugosium.Dashboard.Memory.createVpsMemoryMonitor
            );
        } catch (e) {
            Lugosium.Dashboard.deleteInterval('memory');
            throw e;
        }
    },

    createVpsMemoryMonitor: function(memoryData)
    {
        try {
            // Create container for memory chart
            Lugosium.Dashboard.deleteInterval('memory');
            var period = Lugosium.Dashboard.Memory.periodSettings[Lugosium.Dashboard.Memory.period];

            if (memoryData == false) {
                return;
            }
            jQuery('#' + Lugosium.Dashboard.Memory.memoryMonitorId).empty();
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
            var _updateCallback = function() {
                Lugosium.Dashboard.getData(
                    Lugosium.Dashboard.Memory.getRestParams(),
                    function(memoryData) {
                        if (memoryData == false) {
                            var message = 'Error, can not update the memory chart';
                            Lugosium.Dashboard.displayWarning(message, Lugosium.Dashboard.Memory);

                            return;
                        }
                        var points = {
                            'memused': memoryData['mem:used'].values.reverse().shift(),
                            'memmax': memoryData['mem:max'].values.reverse().shift()
                        };
                        Lugosium.Dashboard.Memory.memoryMonitor.series[0].addPoint(points.memmax, true);
                        Lugosium.Dashboard.Memory.memoryMonitor.series[1].addPoint(points.memused, true);
                    }
                );
            };
            Lugosium.Dashboard.intervals.memory = setInterval(_updateCallback, Lugosium.Dashboard.frequency.update);
        } catch (e) {
            Lugosium.Dashboard.deleteInterval('memory');
            var message = 'Error, can not create memory chart';
            Lugosium.Dashboard.displayWarning(message, Lugosium.Dashboard.Memory);
            throw e;
        }
    },

    getElement: function()
    {
        return $('#' + Lugosium.Dashboard.Memory.memoryMonitorId);
    }
};


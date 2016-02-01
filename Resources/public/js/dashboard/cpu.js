Lugosium.Dashboard.Cpu = {
    cpuMonitorTitle: 'CPU Monitor',

    cpuMonitorId: 'cpu-chart',

    period: 'today',

    periodSettings: {
        lastyear: {text: 'Last Year', tickInterval: null},
        lastmonth: {text: 'Last Month', tickInterval: null},
        lastweek: {text: 'Last Week', tickInterval: 3600*24*1000},
        lastday: {text: 'Yesterday', tickInterval: 3600*1000},
        today: {text: 'Today', tickInterval: 3600*1000}
    },

    cpuMonitor: null,

    rangeButtons: {
        lastYearButton: {
            _titleKey: 'lastyear',
            text: 'Last Year',
            onclick: function() {
                Lugosium.Dashboard.Cpu.setPeriod('lastyear');
            }
        },
        lastMonthButton: {
            _titleKey: 'lastmonth',
            text: 'Last Month',
            onclick: function() {
                Lugosium.Dashboard.Cpu.setPeriod('lastmonth');
            }
        },
        lastWeekButton: {
            _titleKey: 'lastweek',
            text: 'Last Week',
            onclick: function() {
                Lugosium.Dashboard.Cpu.setPeriod('lastweek');
            }
        },
        lastDayButton: {
            _titleKey: 'lastday',
            text: 'Yesterday',
            onclick: function() {
                Lugosium.Dashboard.Cpu.setPeriod('lastday');
            }
        },
        todayButton: {
            _titleKey: 'today',
            text: 'Today',
            onclick: function() {
                Lugosium.Dashboard.Cpu.setPeriod('today');
            }
        }
    },

    setPeriod: function(period)
    {
        Lugosium.Dashboard.Cpu.period = period;
        Lugosium.Dashboard.Cpu.createMonitor();
    },

    getRestParams: function()
    {
        return {
            model: 'ovhVpsMonitor',
            method: 'getVpsMonitorData',
            params: {
                'vpsName': Lugosium.Dashboard.getCurrentVps(),
                'period': Lugosium.Dashboard.Cpu.period
            }
        };
    },

    createMonitor: function()
    {
        try {
            $('#dashboard').append('<div id="cpu-chart"><h3>CPU Monitor is loading</h3>' +
                '<div class="spinner">' +
                '    <div class="bounce1"></div>' +
                '    <div class="bounce2"></div>' +
                '    <div class="bounce3"></div>' +
                '</div>' +
            '</div>');
            var _updateCallback = function() {
                try {
                    var cpuData = Lugosium.Dashboard.getData(Lugosium.Dashboard.Cpu.getRestParams(), Lugosium.Dashboard.Cpu.createVpsCpuMonitor);

                    if (cpuData == false) {
                        return;
                    }
                    var points = {
                        'cpuused': cpuData['cpu:used'].values.reverse().shift(),
                        'cpumax': cpuData['cpu:max'].values.reverse().shift()
                    };
                    Lugosium.Dashboard.Cpu.cpuMonitor.series[0].addPoint(points.cpumax, true);
                    Lugosium.Dashboard.Cpu.cpuMonitor.series[1].addPoint(points.cpuused, true);
                } catch (e) {
                    Lugosium.Dashboard.deleteInterval('cpu');
                    var message = 'Error, can not update the cpu chart';
                    Lugosium.Dashboard.displayWarning(message, Lugosium.Dashboard.Cpu.getElement());
                }
            };
            Lugosium.Dashboard.getData(Lugosium.Dashboard.Cpu.getRestParams(), Lugosium.Dashboard.Cpu.createVpsCpuMonitor);
            Lugosium.Dashboard.intervals.cpu = setInterval(_updateCallback, Lugosium.Dashboard.frequency.update);
        } catch (e) {
            Lugosium.Dashboard.deleteInterval('cpu');
            throw e;
        }
    },

    createVpsCpuMonitor: function(cpuData)
    {
        try {
            // Create container for cpu chart
            Lugosium.Dashboard.deleteInterval('cpu');

            var period = Lugosium.Dashboard.Cpu.periodSettings[Lugosium.Dashboard.Cpu.period];

            if (cpuData == false) {
                return;
            }

            Lugosium.Dashboard.Cpu.cpuMonitor = new Highcharts.Chart({
                chart: {
                    renderTo: Lugosium.Dashboard.Cpu.cpuMonitorId,
                    type: 'area'
                },
                title: {
                    text: Lugosium.Dashboard.Cpu.cpuMonitorTitle
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
                    buttons: Lugosium.Dashboard.Cpu.rangeButtons
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
                    valueSuffix: cpuData['cpu:used'].unit,
                    valueDecimals: 2,
                    shared: true,
                    xDateFormat: '%Y-%m-%d %H:%M:%S'
                },
                series: [{
                    name: 'Max CPU',
                    data: cpuData['cpu:max'].values
                }, {
                    name: 'Used CPU',
                    data: cpuData['cpu:used'].values
                }]
            });

            // Keep style for period button selected after mouse over
            Lugosium.Dashboard.Cpu.getElement().find('g.highcharts-button').mouseleave(function () {
                Lugosium.Dashboard.setSelectedButton(Lugosium.Dashboard.Cpu.getElement(), period.text);
            });
            Lugosium.Dashboard.setSelectedButton(Lugosium.Dashboard.Cpu.getElement(), period.text);
        } catch (e) {
            Lugosium.Dashboard.deleteInterval('cpu');
            var message = 'Error, can not create CPU chart';
            Lugosium.Dashboard.displayWarning(message, $('#cpu-chart'));
            throw e;
        }
    },

    getElement: function()
    {
        return $('#' + Lugosium.Dashboard.Cpu.cpuMonitorId);
    }
}


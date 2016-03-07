if (typeof Lugosium == "undefined") {
    var Lugosium = {};
}

// Initialize Lugosium Dashboard
$(function() {
    if ($('#form_vps').length == 0) {
        $('#dashboard').append($('<div class="alert alert-danger">No VPS...</div>'));
    }
    $('#form_vps').chosen({
        no_results_text: 'No VPS found with',
        placeholder_text_single: 'Choose a VPS'
    }).change(function() {
        Lugosium.Dashboard.createMonitor();
    });

    // Construct dashboard
    if ($('#form_vps').val() != null) {
        Lugosium.Dashboard.createMonitor();
    }
});

Lugosium.Dashboard =
{
    retried: 0,

    monitorId: 'dashboard',

    langLabels: {
        today: 'Today statistics',
        lastday: 'Yesterday statitics',
        lastweek: 'Last week statistics',
        lastmonth: 'Last month statistics',
        lastyear: 'Last year statistics'
    },

    frequency: {
        update: 1000*60*5,
        retry: 2000
    },

    intervals: {
        memory: null,
        cpu: null,
        network: null,
        retry: null
    },

    displayedWarnings: [],

    getCurrentVps: function()
    {
        return $('#form_vps option:selected').text();
    },

    getData: function(params, callback)
    {
        if (typeof params != 'object' || params.model == null
            || params.method == null || params.params == null
        ) {
            throw 'invalid_params';
        }

        $.ajax({
            type: 'GET',
            url: '/lugosium/monitor/rest/' + params.model + '/' + params.method + '/' + JSON.stringify(params.params),
            dataType: 'json'
        }).done(function(data, textStatus, jqXHR) {
            callback(data);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            callback(false);
        });
    },

    deleteInterval: function(index)
    {
        clearInterval(Lugosium.Dashboard.intervals[index]);
        Lugosium.Dashboard.intervals[index] = null;
    },

    createMonitor: function()
    {
        // Empty div if not empty
        Lugosium.Dashboard.getElement().empty();
        $.each(Lugosium.Dashboard.intervals, function(index, interval) {
            if (index == 'retry') {
                return;
            }
            Lugosium.Dashboard.deleteInterval(index);
        });

        Highcharts.setOptions({
            global: {
                timezoneOffset: new Date().getTimezoneOffset(),
                useUTC: true
            },
            lang: Lugosium.Dashboard.langLabels,
            credits: {
                enabled: false,
                href: '//www.lugosium.com',
                text: 'Lugosium Web Development'
            },
            navigation: {
                buttonOptions: {
                    theme: {
                        states: {
                            hover: {
                                fill: 'transparent',
                                'stroke-width': 1,
                                stroke: '#999'
                            },
                            select: {
                                fill: 'transparent'
                            }
                        }
                    }
                }
            },
            title: {
                align: 'left',
                x: 70
            },
            subtitle: {
                align: 'left',
                x: 70
            }
        });

        // Initialize Memory Chart
        try {
            Lugosium.Dashboard.Memory.createMonitor();
            Lugosium.Dashboard.Cpu.createMonitor();
            Lugosium.Dashboard.Network.createMonitor();
        } catch (e) {
            console.log(e);
        }

        if (Lugosium.Dashboard.getElement().find('div.alert').length == 0) {
            Lugosium.Dashboard.deleteInterval('retry');
        }
    },

    setSelectedButton: function(container, title)
    {
        if (title == null || !(title.length > 0)) {
            throw 'bad_title';
        }

        if (container.length == 0) {
            throw 'bad_container';
        }
        var currentButton = container.find("text:contains('" + title  + "')");

        if (currentButton.length == 0 || currentButton.children('text') == 0) {
            Lugosium.Dashboard.displayWarning('Not able to set text in bold', Lugosium.Dashboard, 'errTextBold');
        } else {
            currentButton.css('font-weight', 'bold');
        }

        return;
    },

    displayWarning: function(message, dashboardElement, warningId)
    {
        if (typeof dashboardElement == 'undefined' || dashboardElement.length == 0) {
            var container = Lugosium.Dashboard.getElement();
        } else {
            var container = dashboardElement.getElement();
        }

        if (warningId != null && jQuery.inArray(warningId, Lugosium.Dashboard.displayedWarnings) >= 0) {
            return;
        }
        container.find('div.alert').empty();
        var warningDiv = $('<div class="alert alert-warning" style="margin-bottom: 0;"></div>');
        var refreshLink = $.parseHTML(', <a onClick="Lugosium.Dashboard.createMonitor();" style="cursor: pointer;">Refresh?</a>');
        warningDiv.append(message);
        warningDiv.append(refreshLink);
        warningDiv.append($('<br>'));
        container.prepend(warningDiv);

        if (warningId != null) {
            Lugosium.Dashboard.displayedWarnings.push(warningId);
        }

        if (Lugosium.Dashboard.intervals['retry'] == null) {
            var _retry = function () {
                Lugosium.Dashboard.retried++;

                // Stop retrying if necessary
                if (Lugosium.Dashboard.retried >= 3) {
                    Lugosium.Dashboard.retried = 0;
                    Lugosium.Dashboard.deleteInterval('retry');
                } else {
                    Lugosium.Dashboard.displayedWarnings = [];
                    dashboardElement.createMonitor();
                }
            };
            Lugosium.Dashboard.intervals['retry'] = setInterval(_retry, Lugosium.Dashboard.frequency.retry);
        }
    },

    getElement: function()
    {
        return $('#' + Lugosium.Dashboard.monitorId);
    }
};

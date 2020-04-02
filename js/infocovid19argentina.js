/**
 **     Author Carlos Flores
 **     https://www.linkedin.com/in/carlos-hector-flores-it-professional/
 **     
 **     Data from https://github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data
 **
 **/
class InfoCovid19Argentina {
    constructor({datasource=0, timelineId=null, barchartId=null, percentageId=null, lastDateId=null, datasourceDescriptionId=null}) {
        this.indexDatasource = datasource
        this.timelineId = timelineId
        this.barchartId = barchartId
        this.percentageId = percentageId
        this.lastDateId = lastDateId
        this.datasourceDescriptionId = datasourceDescriptionId
        this.datasource = [
            {
                confirmedUrl: "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv",
                deathUrl: "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv",
                description: "Estos datos pueden tener una demora de hasta 24hs en actualizarse con respecto a los datos oficiales del Ministerio de Salud."
            },
            {
                confirmedUrl: "https://7452cdb5-83c6-4b4b-a158-efe94aa00b34.mock.pstmn.io/argentina/time_series_covid19_confirmed",
                deathUrl: "https://7452cdb5-83c6-4b4b-a158-efe94aa00b34.mock.pstmn.io/argentina/time_series_covid19_deaths",
                description: "Estos datos pueden contener errores ya que son actualizados manualmente para reducir la demora con respecto a los datos oficiales del Ministerio de Salud."

            }
        ]
        this.totalInfo = {
            categories: ["x"],
            confirmed: ["Confirmados"],
            death: ["Fallecidos"],
            estimated: ["Estimados"]
        }

        this._init()
    }

    _init() {
        const timelineBind = "#" + this.timelineId
        const barchartBind = "#" + this.barchartId
        const percentageBind = "#" + this.percentageId
        this.timeline = null
        this.barchart = null
        this.percentage = null
        this.country = "Argentina"

        this.timeline = c3.generate({
            bindto: timelineBind,
            data: {
                x : 'x',
                columns: [
                    this.totalInfo.categories,
                    this.totalInfo.confirmed,
                    this.totalInfo.death,
                    this.totalInfo.estimated
                ],
                colors: {
                    Estimados: '#9E9E9E'
                },
                hide: ['Estimados']
            },
            axis: {
                x: {
                    tick: {
                        multiline: false
                    },
                    label: 'A\u00F1o 2020',
                    type: 'category',
                    categories: this.totalInfo.categories
                },
                y: {
                    label: 'Casos'
                }
            },
            grid: {
                x: {
                    show: true
                },
                y: {
                    show: true
                }
            },
            zoom: {
                enabled: false
            }
        });
        
        this.barchart = c3.generate({
            bindto: barchartBind,
            data: {
                x : 'x',
                columns: [
                    this.totalInfo.categories,
                    this.totalInfo.confirmed,
                    this.totalInfo.death
                ],
                type: 'bar'
            },
            bar: {
                width: {
                    ratio: 0.5 // this makes bar width 50% of length between ticks
                }
            },
            axis: {
                x: {
                    tick: {
                        multiline: false
                    },
                    label: 'A\u00F1o 2020',
                    type: 'category',
                    categories: this.totalInfo.categories
                },
                y: {
                    label: 'Casos'
                }
            },
            grid: {
                x: {
                    show: true
                },
                y: {
                    show: true
                }
            },
            zoom: {
                enabled: false
            }
        });

        this.percentage = c3.generate({
            bindto: percentageBind,
            data: {
                columns: [
                    ["No Fallecidos"],
                    this.totalInfo.death
                ],
                type : 'pie'
            },
            pie: {
                label: {
                    threshold: 0.01,
                    format: function (value, ratio, id) {
                        return d3.format(".1%")(ratio) + " (" + value + ")";
                    }
                }
            }
        });
    }

    _getConfirmedInfo(callback) {
        const confirmedUrl = this.datasource[this.indexDatasource].confirmedUrl
        let data = null
        const self = this

        $.ajax({
            url: confirmedUrl,
            async: false,
            success: function (csvd) {
                data = $.csv.toArrays(csvd);
            },
            dataType: "text",
            complete: function () {
                const result = self._dataProcessor(data)
                result.info.unshift(self.totalInfo.confirmed[0])

                self.totalInfo.confirmed = result.info
                /*if(self.totalInfo.categories.length == 1)*/ self.totalInfo.categories = result.categories

                callback()
            }
        });
    }

    _getDeathsInfo(callback) {
        const deathUrl = this.datasource[this.indexDatasource].deathUrl;
        let data = null
        const self = this

        $.ajax({
            url: deathUrl,
            async: false,
            success: function (csvd) {
                data = $.csv.toArrays(csvd);
            },
            dataType: "text",
            complete: function () {
                const result = self._dataProcessor(data)
                result.info.unshift(self.totalInfo.death[0])

                self.totalInfo.death = result.info
                /*if(self.totalInfo.categories.length == 1)*/ self.totalInfo.categories = result.categories;

                callback()
            }
        });
    }

    _dataProcessor(data) {
        const index = data.findIndex((element) => element[1] == this.country)
        const info = data[index]
        info.splice(0, 4)
        info.splice(1, 40)

        let categories = data[0]
        categories.splice(0, 4)
        categories.splice(0, 40)
        categories = categories.map(function(i){
            const m = i.split("/")[0]
            const d = i.split("/")[1]

            return d + "/" + m
        })
        categories.unshift("x")

        return {info: info, categories: categories}
    }

    buildAll() {
        const self = this
        this._getConfirmedInfo(() => self.render())
        this._getDeathsInfo(() => self.render())
    }

    render() {
        const lastDateBind = "#" + this.lastDateId
        const lastDate = this._getLastDate()
        $(lastDateBind).text(lastDate)

        const dsBind = "#" + this.datasourceDescriptionId
        $(dsBind).text(this.datasource[this.indexDatasource].description)

        this.renderTimeline()
        this.renderBarchart()
        this.renderPercentage()
    }

    renderTimeline() {
        const categories = this.totalInfo.categories
        const confirmed = this.totalInfo.confirmed
        const death = this.totalInfo.death
        const estimated = this._getEstimatedCases()


        this.timeline.load({
            columns: [
                categories,
                confirmed,
                death,
                estimated
            ]
        });
    }

    renderBarchart() {
        const categories = this.totalInfo.categories
        const confirmed = this._getNewCasesConfirmed()
        const death = this._getNewCasesDeath()

        this.barchart.load({
            columns: [
                categories,
                confirmed,
                death
            ]
        });
    }

    renderPercentage() {
        const totalConfirmed = this.totalInfo.confirmed.length == 1 ? 0 : this.totalInfo.confirmed[this.totalInfo.confirmed.length-1]
        const totalDeaths = this.totalInfo.death.length == 1 ? 0 : this.totalInfo.death[this.totalInfo.death.length-1]

        this.percentage.load({
            columns: [
                ["No Fallecidos", totalConfirmed-totalDeaths],
                [this.totalInfo.death[0], totalDeaths]
            ]
        });
    }

    _getLastDate() {
        if(this.totalInfo.categories.length == 1) {
            return ""
        } 
        
        const partialDate = this.totalInfo.categories[this.totalInfo.categories.length-1]
        const fullDate = partialDate + "/2020"

        return fullDate
    }

    _getNewCasesConfirmed() {
        if(this.totalInfo.confirmed.length == 1) return this.totalInfo.confirmed
        
        const newCasesConfirmed = new Array("Confirmados", 0)
        for (var i = 2; i < this.totalInfo.confirmed.length; i++) {
            const value = this.totalInfo.confirmed[i] - this.totalInfo.confirmed[i-1]
            newCasesConfirmed.push(value)
        }

        return newCasesConfirmed
    }

    _getNewCasesDeath() {
        if(this.totalInfo.death.length == 1) return this.totalInfo.death
        
        const newCasesDeath = new Array("Fallecidos", 0)
        for (var i = 2; i < this.totalInfo.death.length; i++) {
            const value = this.totalInfo.death[i] - this.totalInfo.death[i-1]
            newCasesDeath.push(value)
        }

        return newCasesDeath
    }

    _getEstimatedCases() {
        const estimatedCases = new Array("Estimados")
        if(this.totalInfo.death.length == 1) return estimatedCases
        
        for (var i = 1; i < this.totalInfo.death.length; i++) {
            // the number of cases is estimated assuming a mortality rate of 1.5%
            const value = Math.trunc(this.totalInfo.death[i]/0.015) 
            estimatedCases.push(value)
        }

        return estimatedCases
    }
}

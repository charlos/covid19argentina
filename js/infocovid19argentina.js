/**
 **     Author Carlos Flores
 **     https://www.linkedin.com/in/carlos-hector-flores-it-professional/
 **     
 **     Data from https://github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data
 **
 **/
class InfoCovid19Argentina {
    constructor({timelineId=null, percentageId=null, lastDateId=null}) {
        this.timelineId = timelineId
        this.percentageId = percentageId
        this.lastDateId = lastDateId
        this.totalInfo = {
            categories: ["x"],
            confirmed: ["Confirmados"],
            death: ["Fallecidos"]
        }

        this._init()
    }

    _init() {
        const timelineBind = "#" + this.timelineId
        const percentageBind = "#" + this.percentageId
        this.timeline = null
        this.percentage = null
        this.country = "Argentina"

        this.timeline = c3.generate({
            bindto: timelineBind,
            data: {
                x : 'x',
                columns: [
                    this.totalInfo.categories,
                    this.totalInfo.confirmed,
                    this.totalInfo.death
                ]
            },
            axis: {
                x: {
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
            }
        });
    }

    _getConfirmedInfo(callback) {
        const confirmedUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv";
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
                
                self.totalInfo.confirmed = self.totalInfo.confirmed.concat(result.info);
                if(self.totalInfo.categories.length == 1) self.totalInfo.categories = result.categories;

                callback()
            }
        });
    }

    _getDeathsInfo(callback) {
        const deathUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv";
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
                
                self.totalInfo.death = self.totalInfo.death.concat(result.info);
                if(self.totalInfo.categories.length == 1) self.totalInfo.categories = result.categories;

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

    buildTimeline() {
        const self = this
        this._getConfirmedInfo(() => self.render())
        this._getDeathsInfo(() => self.render())
    }

    render() {
        const lastDateBind = "#" + this.lastDateId
        const lastDate = this._getLastDate()
        $(lastDateBind).text(lastDate)
        
        this.renderTimeline()
        this.renderPercentage()
    }

    renderTimeline() {
        this.timeline.load({
            columns: [
                this.totalInfo.categories,
                this.totalInfo.confirmed,
                this.totalInfo.death
            ]
        });
    }

    renderPercentage() {
        const totalConfirmed = this.totalInfo.confirmed.length == 1 ? 0 : this.totalInfo.confirmed[this.totalInfo.confirmed.length-1]
        const totalDeaths = this.totalInfo.death.length == 1 ? 0 : this.totalInfo.death[this.totalInfo.death.length-1]

        this.percentage.load({
            columns: [
                ["No Fallecidos", totalConfirmed],
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

}

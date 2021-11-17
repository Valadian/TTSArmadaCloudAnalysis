dfgames = null
factions = null
koModel = null
function AnalysisModel(df){
    this.df = ko.observable(df)
    this.commanders = ko.observableArray([])
    this.factions = ko.observableArray([])
    this.selectedCommanders = ko.observableArray([])
    this.selectedFactions = ko.observableArray([])
    this.selectedPlayers = ko.observableArray([])
    this.ranked = ko.observable(false)
    this.groupby = ko.observable("")
    this.selectedFactions.subscribe(function(selectedFactions){
        if (selectedFactions.length==0){
            this.commanders(dfgames['commander'].unique().values.sort())
        } else {
            filter = dfgames['faction'].isna()
            for( var i in selectedFactions){
                filter = filter.or(dfgames['faction'].eq(selectedFactions[i]))
            }
            this.commanders(dfgames.loc({rows:filter})['commander'].unique().values.sort())
        }
        this.selectedCommanders([])
    
    },this)
    this.df_filtered_byfaction = ko.computed(function(){
        filtered = this.df()
        if (this.selectedFactions().length>0){
            filter = filtered['faction'].isna()
            for( var i in this.selectedFactions()){
                filter = filter.or(filtered['faction'].eq(this.selectedFactions()[i]))
            }
            filtered = filtered.loc({rows:filter})
        }
        return filtered
    },this)
    this.df_filtered_bycmdr = ko.computed(function(){
        filtered = this.df_filtered_byfaction()
        if (this.selectedCommanders().length>0){
            filter = filtered['commander'].isna()
            for( var i in this.selectedCommanders()){
                filter = filter.or(filtered['commander'].eq(this.selectedCommanders()[i]))
            }
            filtered = filtered.loc({rows:filter})
        }
        return filtered
    },this)
    this.df_filtered_byplayer = ko.computed(function(){
        filtered = this.df_filtered_bycmdr()
        if (this.selectedPlayers().length>0){
            filter = filtered['name'].isna()
            for( var i in this.selectedPlayers()){
                filter = filter.or(filtered['name'].eq(this.selectedPlayers()[i]))
            }
            filtered = filtered.loc({rows:filter})
        }
        return filtered
    },this)
    this.df_filtered =  ko.computed(function(){
        filtered = this.df_filtered_byplayer()
        if(this.ranked()){
            filtered = filtered.loc({rows:filtered['ranked'].eq("True")})
        }
        return filtered
    },this)
    this.df_first =  ko.computed(function(){
        return this.df_filtered().loc({rows:this.df_filtered()['first'].eq("True")})
    },this)
    this.df_second =  ko.computed(function(){
        return this.df_filtered().loc({rows:this.df_filtered()['first'].ne("True")})
    },this)
    this.groupby_metrics = ko.computed(function(){
        if (this.groupby()==""){
            return []
        } else {
            means = this.df_filtered().groupby([this.groupby()]).agg({'points':'mean'}).values
            count_values = this.df_filtered().groupby([this.groupby()]).agg({'points':'count'})['points_count'].values
            return means.map(function(e, i) {
                return [e[0], e[1], count_values[i]];
            }).sort((a, b) => b[1]- a[1]);
        }
    },this)
    this.numberOfGames = ko.computed(function(){
        return this.df_filtered().$index.length
    },this)
    this.meanMoV = ko.computed(function(){
        return this.df_filtered()['MoV'].mean()
    },this)
    this.players = ko.computed(function(){
        return this.df_filtered_bycmdr()['name'].unique().values.sort((a, b) => String(a).localeCompare(String(b), undefined, {sensitivity: 'base'}))
    },this)
    this.pointshist = ko.computed(function(){
        var trace1 = {}
        if (this.df_first()['points']){
            var trace1 = {
                name: 'First',
                x: this.df_first()['points'].values,
                type: 'histogram',
                histnorm: 'probability',
                // cumulative: {enabled: true},
                opacity:0.6,
                marker: {
                    color: '#d4af37',
                    // pattern: {
                    //     bgcolor: 'transparent'
                    // }
                },
                xbins: {start:0.5,size:1,end:10.5},
                cumulative: {enabled: true}
            }
        }
        var trace2 = {}
        if (this.df_second()['points']){
            var trace2 = {
                name: 'Second',
                x: this.df_second()['points'].values,
                type: 'histogram',
                histnorm: 'probability',
                // cumulative: {enabled: true},
                opacity:0.6,
                marker: {
                    color: '#C0C0C0'
                },
                xbins: {start:0.5,size:1,end:10.5},
                // cumulative: {enabled: true}
                hoverlabel: {
                    bgcolor: '#30303080'
                },
                cumulative: {enabled: true}
            }
        }
        // var trace3 = {
        //     name: 'Second',
        //     x: this.df_second()['points'].values,
        //     type: 'histogram',
        //     // cumulative: {enabled: true},
        //     opacity:0.6,
        //     marker: {
        //         color: 'green'
        //     },
        //     xbins: {start:0.5,size:1,end:10.5},
        //     cumulative: {enabled: true}
        // }
        var layout = {
            // bargap: 0.05, 
            bargroupgap: 0.05, 
            // barmode: "overlay",
            title: "Tournament Points", 
            xaxis: {title: "Points"}, 
            yaxis: {title: "Probability"},
            plot_bgcolor:"transparent",
            paper_bgcolor:"transparent",
            font: {
                color: "white"
            },
            hoverlabel: { bgcolor: '#000' }
        }
        var config = {
            showEditInChartStudio: true,
        }
        Plotly.newPlot('plot_hist',[trace1,trace2],layout,config)
        //this.filtered()['points'].plot("plot_hist").hist()
    },this)
}


dfd.read_csv("2021_10_28_ttsarmada_cloud.csv")
.then(df => {
    dfgames = df
    var moralo = dfgames['commander'].ne("Moralo Eval (22)")
    var bossk = dfgames['commander'].ne("Bossk (23)")
    var nocmdr = dfgames['commander'].ne("")
    dfgames = dfgames.loc({rows:moralo.and(bossk).and(nocmdr)})
    dfgames['name'].apply(s => String(s), {inplace:true})//Doesn't work?
    koModel = new AnalysisModel(dfgames)
    // koModel.numberOfGames(dfgames.$index.length)
    koModel.commanders(dfgames['commander'].unique().values.sort())
    koModel.factions(dfgames['faction'].unique().values.sort())

    ko.applyBindings(koModel);
    // var select = document.getElementById("commander")
    // select.add(new Option("<All Commanders>"))
    // for(var i in commanders.values){
    //     select.add(new Option(commanders.values[i]))
    // }
    // factions = dfgames['faction'].unique()
    
    // var select = document.getElementById("faction")
    // select.add(new Option("<All Factions>"))
    // for(var i in factions.values){
    //     select.add(new Option(factions.values[i]))
    // }
    
    // df.plot("plot_div1").scatter({ x: "MoV", y: "squads" })
}).catch(err => {
    console.log(err);
})
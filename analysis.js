dfgames = null
factions = null
koModel = null
function AnalysisModel(df){
    this.df = ko.observable(df)
    this.commanders = ko.observableArray([])
    this.factions = ko.observableArray([])
    this.tournamentCodes = ko.observableArray([])
    this.selectedCommanders = ko.observableArray([])
    this.selectedFactions = ko.observableArray([])
    this.selectedPlayers = ko.observableArray([])
    this.selectedTournamentCodes = ko.observableArray([])
    this.selectedCards = ko.observableArray([])
    this.ships_byname = ko.observable()
    this.ships = ko.observableArray([])
    this.selectedShips = ko.observable("")
    this.ranked = ko.observable("")
    this.groupby = ko.observable("")
    this.subgroup = ko.observable({})
    this.homeurl = ko.computed(function(){
        return location.protocol + '//' + location.host + location.pathname
    },this)
    this.url = ko.computed(function(){
        let data = {}
        if (this.selectedFactions().length>0){
            data['selectedFactions'] = this.selectedFactions()
        }
        if (this.selectedCommanders().length>0){
            data['selectedCommanders'] = this.selectedCommanders()
        }
        if (this.selectedTournamentCodes().length>0){
            data['selectedTournamentCodes'] = this.selectedTournamentCodes()
        }
        if (this.selectedPlayers().length>0){
            data['selectedPlayers'] = this.selectedPlayers()
        }
        if (this.selectedCards().length>0){
            data['selectedCards'] = this.selectedCards()
        }
        if (this.ranked()!=''){
            data['ranked'] = this.ranked()
        }
        if (this.groupby()!=''){
            data['groupby'] = this.groupby()
        }
        if (this.selectedShips()!='' && this.groupby()=='shiptype'){
            data['selectedShips'] = this.selectedShips()
        }
        if (Object.keys(this.subgroup()).length>0 && this.groupby()=='shiptype'){
            data['subgroup'] = this.subgroup()
        }
        return location.protocol + '//' + location.host + location.pathname + (Object.keys(data).length>0?"?data="+btoa(JSON.stringify(data)):"");
    },this)
    this.cursorFocus = function(elem) {
        var x, y;
        // More sources for scroll x, y offset.
        if (typeof(window.pageXOffset) !== 'undefined') {
            x = window.pageXOffset;
            y = window.pageYOffset;
        } else if (typeof(window.scrollX) !== 'undefined') {
            x = window.scrollX;
            y = window.scrollY;
        } else if (document.documentElement && typeof(document.documentElement.scrollLeft) !== 'undefined') {
            x = document.documentElement.scrollLeft;
            y = document.documentElement.scrollTop;
        } else {
            x = document.body.scrollLeft;
            y = document.body.scrollTop;
        }
      
        elem.focus();
      
        window.scrollTo(x, y);
        if (typeof x !== 'undefined') {
            // In some cases IE9 does not seem to catch instant scrollTo request.
            setTimeout(function() { window.scrollTo(x, y); }, 10);
        }
    }
    this.copyurl = function(){
        if(typeof(event)=="undefined" || typeof(event.toElement)=="undefined"){ //|| typeof(element.value)=="undefined"
            return;
        }
        target = document.getElementById('url')
        if(typeof(target)=="undefined" || typeof(target.value)=="undefined"){
            return;
        }
        this.cursorFocus(target)
        target.setSelectionRange(0, target.value.length);

        // copy the selection
        var succeed;
        try {
              succeed = document.execCommand("copy");
              if(succeed){
                //   $.notify({
                //     // options
                //     message: 'Link Copied to Clipboard',
                //     url: self.shareLink(),
                //     target: '_blank'
                //   },{
                //     // settings
                //     type: 'success',
	            //     delay: 3000,
                //     animate: {
                //        enter: 'animated fadeInDown',
                //        exit: 'animated fadeOutUp'
                //     },
                //     placement: {
                //         from: "top",
                //         align: "center"
                //     },
                //   });
              }
        } catch(e) {
            succeed = false;
        }
    }
    this.subgroup_entries = ko.computed(function(){
        return Object.entries(this.subgroup())
    },this)
    this.subgroup_desc = ko.computed(function(){
        return this.subgroup_entries().map((p)=>p[1]+" x "+p[0]).join(", ")
    },this)
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
    this.df_filtered_bytournament = ko.computed(function(){
        filtered = this.df_filtered_bycmdr()
        if (filtered.$index.length>0 && this.selectedTournamentCodes().length>0){
            filter = new dfd.Series(filtered.values.map(r=>false))
            // filter = filtered['tournamentCode'].isna()
            for( var i in this.selectedTournamentCodes()){
                
                filter = filter.or(new dfd.Series(filtered.loc({columns:['tournamentCode']}).values.map(r=>r[0]==this.selectedTournamentCodes()[i])))
            }
            filtered = filtered.loc({rows:filter})
        }
        return filtered
    },this)
    this.df_filtered_byplayer = ko.computed(function(){
        filtered = this.df_filtered_bytournament()
        if (this.selectedPlayers().length>0){
            filter = filtered['name'].isna()
            for( var i in this.selectedPlayers()){
                filter = filter.or(filtered['name'].eq(this.selectedPlayers()[i]))
            }
            filtered = filtered.loc({rows:filter})
        }
        return filtered
    },this)
    this.df_filtered_bycard = ko.computed(function(){
        filtered = this.df_filtered_byplayer()
        if (this.selectedCards().length>0){
            filter = filtered['name'].isna()
            for( var card of this.selectedCards()){
                filter = filter.or(filtered[card].gt(0))
            }
            filtered = filtered.loc({rows:filter})
        }
        return filtered
    },this)
    this.df_filtered =  ko.computed(function(){
        filtered = this.df_filtered_bycard()
        if(this.ranked()){
            if (filtered.$index.length>0){
                filtered = filtered.loc({rows:filtered['ranked'].eq("True")})
            }
        }
        return filtered
    },this)
    this.df_filtered_bysubgroup =  ko.computed(function(){
        df = this.df_filtered()
        if(df.$index.length>0 && Object.keys(this.subgroup()).length>0){
            filter = df['points'].apply((x)=>true) //all true
            for(var key in this.subgroup()){
                filter = filter.and(df[key].eq(this.subgroup()[key]))
            }
            df = df.loc({rows:filter})
        }
        return df
    },this)
    this.df_first =  ko.computed(function(){
        if(this.df_filtered_bysubgroup().$index.length>0){
            return this.df_filtered_bysubgroup().loc({rows:this.df_filtered_bysubgroup()['first'].eq("True")})
        } else{
            return []
        }
    },this)
    this.df_second =  ko.computed(function(){
        if(this.df_filtered_bysubgroup().$index.length>0){
            return this.df_filtered_bysubgroup().loc({rows:this.df_filtered_bysubgroup()['first'].ne("True")})
        } else{
            return []
        }
    },this)
    this.shiptype_groupby = ko.computed(function(){
        if (this.selectedShips()==""){
            return []
        }
        return this.ships_byname()[this.selectedShips()].cols()
    }, this)
    this.groupby_metrics = ko.computed(function(){
        if (this.groupby()==""){
            return []
        } else if (this.groupby()=="shiptype"){
            if (this.selectedShips()==""){
                return []
            }
            if (this.df_filtered().$index.length==0){
                return []
            }
            var agg = df_groupby(this.df_filtered(),this.ships_byname()[this.selectedShips()].cols()).agg({'points':['count','mean']})
            var countmean = agg.values
            var names = agg.$index
            return names.map(function(e, i){
                pairing = JSON.parse(e)
                nonzero_pairing_array = Object.entries(pairing).filter(([k,v]) => v>0)
                description = nonzero_pairing_array.map((p)=>p[1]+" x "+p[0]).join(",\n")
                if(description==""){
                    description="all others"
                }
                return [description, countmean[i][1],countmean[i][0],pairing];
            }).sort((a, b) => b[2]- a[2]) //1 = score //2 = count
        } else if (this.groupby()=="squads"){
            let df = this.df_filtered()
            if (df.$index.length==0){
                return []
            }
            var ranges = [["None",-1,0],["Minimal (0-40]",0,40],["Light (40-80]",40,80],["Moderate (80-100]",80,100],["Full (100-130]",100,130],["Max (130-134]",130,134]]
            var filters = ranges.map(r => df['squads'].gt(r[1]).and(df['squads'].le(r[2])))
            var dfs = filters.map(filter => df.loc({rows:filter}))
            return ranges.map((r, i) => [r[0], dfs[i].$index.length>0?dfs[i]['points'].mean():0, dfs[i].$index.length, {'squads':'('+r[1]+","+r[2]+"]"}])
        } else {
            means = this.df_filtered().groupby([this.groupby()]).agg({'points':'mean'}).values
            count_values = this.df_filtered().groupby([this.groupby()]).agg({'points':'count'})['points_count'].values
            return means.map(function(e, i) {
                var pairing = {}
                pairing[e[0]] = 1
                return [e[0], e[1], count_values[i], pairing];
            }).sort((a, b) => b[1]- a[1]);
        }
    },this)
    this.groupby_metrics_max = ko.computed(function(){
        if (this.groupby_metrics().length>0) {
            return Math.max(...this.groupby_metrics().map(r => r[1]))
        } else {
            return 0
        }
    }, this)
    this.groupby_metrics_min = ko.computed(function(){
        if (this.groupby_metrics().length>0) {
            return Math.min(...this.groupby_metrics().map(r => r[1]))
        } else {
            return 0
        }
    }, this)
    this.groupby_metrics_mid = ko.computed(function(){
        return (this.groupby_metrics_max()+this.groupby_metrics_min())/2
    }, this)
    this.cardmetrics = ko.observableArray([])
    this.cardmetrics_threshold = ko.observable(0.5)
    this.cardmetrics_filtered = ko.computed(function(){
        var count = this.df_filtered_bysubgroup().$index.length
        return this.cardmetrics().filter(r => (r[2]>=(1-this.cardmetrics_threshold())*count))
    },this)
    this.all_cards = ko.computed(function(){
        return this.df().$columns.filter(c => c.startsWith("VS:")).map(c => c.substring(3)).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    },this)
    this.cards = ko.computed(function(){
        return this.df_filtered_bysubgroup().$columns.filter(c => c.startsWith("VS:")).map(c => c.substring(3)).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    },this)
    this.common_cards = function(){
        document.getElementById("card-metrics-loading").classList.remove("d-none")
        document.getElementById("calc-card-metrics").classList.add("d-none")
        setTimeout(() => {
            cards = this.cards() //this.df_filtered_bysubgroup().$columns.filter(c => c.startsWith("VS:")).map(c => c.substring(3))
            matches = cards.map(c => this.df_filtered_bysubgroup()[c].gt(0).sum())
            scores = cards.map(c => {
                rows = this.df_filtered_bysubgroup().loc({rows:this.df_filtered_bysubgroup()[c].gt(0)})
                if(rows.$index.length>0){
                    return rows['points'].mean()
                } else {
                    return 0
                }
            })
            cards = cards.map((e, i) => [e, scores[i],matches[i]]).filter(c => c[2]>0).sort((a,b)=>b[2]-a[2])
            //this.cardmetrics(cards)
            document.getElementById("card-metrics-loading").classList.add("d-none")
            document.getElementById("calc-card-metrics").classList.remove("d-none")
            this.cardmetrics(cards)
        }, 100)
    }//,this)
    this.nemesismetrics = ko.observableArray([])
    this.nemesis_threshold = ko.observable(90)
    this.nemesismetrics_filtered = ko.computed(function(){
        if (this.df_filtered_bysubgroup().$index.length==0){
            return []
        }
        var mean = this.df_filtered_bysubgroup()['points'].mean()
        return this.nemesismetrics().filter(r => (r[2]>=(100-this.nemesis_threshold())) && (+r[1]<+mean))
    },this)
    this.nemesis_cards = function(){
        document.getElementById("nemesis-loading").classList.remove("d-none")
        document.getElementById("calc-nemesis").classList.add("d-none")
        setTimeout(() => {
            cards = this.df_filtered_bysubgroup().$columns.filter(c => c.startsWith("VS:"))
            matches = cards.map(c => this.df_filtered_bysubgroup()[c].gt(0).sum())
            scores = cards.map(c => {
                rows = this.df_filtered_bysubgroup().loc({rows:this.df_filtered_bysubgroup()[c].gt(0)})
                if(rows.$index.length>0){
                    return rows['points'].mean()
                } else {
                    return 0
                }
            })
            cards = cards.map((e, i) => [e, scores[i],matches[i]]).filter(c => c[2]>0).sort((a,b)=>a[1]-b[1])
            document.getElementById("nemesis-loading").classList.add("d-none")
            document.getElementById("calc-nemesis").classList.remove("d-none")
            this.nemesismetrics(cards)
        }, 100)
    }
    this.calculate_metric_color = function(v){
        var min = 4.5 //this.groupby_metrics_min()
        var mid = 5.5 //this.groupby_metrics_mid()
        var max = 6.5 //this.groupby_metrics_max()
        if(min==mid){
            return "rgb(255,255,0)"
        }
        var r =  parseInt(255*Math.max(0,Math.min(1,  1-(v-mid)/(max-mid) )))
        var g =  parseInt(255*Math.max(0,Math.min(1,  (v-min)/(mid-min)   )))
        return "rgb("+r+","+g+",0)"
    }
    this.numberOfGames = ko.computed(function(){
        return this.df_filtered().$index.length
    },this)
    this.meanMoV = ko.computed(function(){
        if(this.df_filtered().$index.length>0){
            return this.df_filtered()['MoV'].mean()
        } else {
            return 0
        }
    },this)
    this.meanPoints = ko.computed(function(){
        if(this.df_filtered().$index.length>0){
            return this.df_filtered()['points'].mean()
        } else {
            return 0
        }
    },this)
    this.players = ko.computed(function(){
        return this.df_filtered_bycmdr()['name'].unique().values.sort((a, b) => String(a).localeCompare(String(b), undefined, {sensitivity: 'base'}))
    },this)
    this.pointshist = ko.computed(function(){
        var trace1 = {
            name: 'First',
            x: (this.df_first()['points'] ? this.df_first()['points'].values: []),
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
        var trace2 = {
            name: 'Second',
            x: (this.df_second()['points'] ? this.df_second()['points'].values: []),
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
            xaxis: {
                title: "Points",
                fixedrange: true,
                range: [0,10.5]}, 
            yaxis: {fixedrange: true},
            // yaxis: {title: "Probability"},
            plot_bgcolor:"transparent",
            paper_bgcolor:"transparent",
            font: {
                color: "white"
            },
            hoverlabel: { bgcolor: '#000' },
            legend: {
                x: 0,
                y: 1,
                // bgcolor: '#303030',
            },
            margin: {
                b: 40,
                l: 40,
                r: 20,
                t: 40,
            },
            shapes: [{
                type: 'line',
                x0: (this.df_second()['points'] ? this.df_second()['points'].mean(): 0),
                x1: (this.df_second()['points'] ? this.df_second()['points'].mean(): 0),
                y0: 0,
                y1: 1,
                yref: 'paper',
                line: {
                    color: '#C0C0C0',
                    width: 5,
                    dash: 'dot'
                },
            },{
                type: 'line',
                x0: (this.df_first()['points'] ? this.df_first()['points'].mean(): 0),
                x1: (this.df_first()['points'] ? this.df_first()['points'].mean(): 0),
                y0: 0,
                y1: 1,
                yref: 'paper',
                line: {
                    color: '#d4af37',
                    width: 5,
                    dash: 'dot'
                },
            }]
        }
        var config = {
            // showEditInChartStudio: true,
            'modeBarButtonsToRemove': ['sendDataToCloud']
        }
        Plotly.newPlot('plot_hist',[trace1,trace2],layout,config)
        //this.filtered()['points'].plot("plot_hist").hist()
    },this)
}
ship_filters = {
    "SSD":["Star Dreadnought Command Prototype (220)","Star Dreadnought Assault Prototype (250)"],
    "ISD":["Imperial I-class Star Destroyer (110)","Imperial II-class Star Destroyer (120)","Imperial Star Destroyer Kuat Refit (112)","Imperial Star Destroyer Cymoon 1 Refit (112)"],
    "Onager":["Onager-class Testbed (96)","Onager-class Star Destroyer (110)"],
    //"Onager w/titles":["Onager-class Testbed (96)","Onager-class Star Destroyer (110)","Cataclysm (5)"],
    "Dictor":["Interdictor Combat Refit (93)","Interdictor Suppression Refit (90)"],
    "VSD":["Victory I-class Star Destroyer (73)","Victory II-class Star Destroyer (85)"],
    // "VSD w/titles":["Victory I-class Star Destroyer (73)","Victory II-class Star Destroyer (85)","Dominator (12)","Harrow (3)"],
    "GSD":["Gladiator I-class Star Destroyer (56)","Gladiator II-class Star Destroyer (62)"],
    // "GSD w/titles":["Gladiator I-class Star Destroyer (56)","Gladiator II-class Star Destroyer (62)","Demolisher (10)"],
    "Quasar":["Quasar Fire I-class Cruiser-Carrier (54)","Quasar Fire II-class Cruiser-Carrier (61)"],
    "Arq":["Arquitens-class Light Cruiser (54)","Arquitens-class Command Cruiser (59)"],
    "Raider":["Raider I-class Corvette (44)","Raider II-class Corvette (48)"],
    "Goz":["Gozanti-class Cruisers (23)","Gozanti-class Assault Carriers (28)"],
    "Starhawk":["Starhawk-class Battleship Mark I (140)","Starhawk-class Battleship Mark II (150)"],
    "MC80":["MC80 Command Cruiser (106)","MC80 Assault Cruiser (114)"],
    "MC80L":["MC80 Star Cruiser (96)","MC80 Battle Cruiser (103)"],
    "MC75":["MC75 Ordnance Cruiser (100)","MC75 Armored Cruiser (104)"],
    "AF":["Assault Frigate Mark II B (72)","Assault Frigate Mark II A (81)"],
    "MC30":["MC30c Torpedo Frigate (63)","MC30c Scout Frigate (69)"],
    "Reb Pelta":["Modified Pelta-class Assault Ship (56)","Modified Pelta-class Command Ship (60)"],
    "Neb":["Nebulon-B Support Refit (51)","Nebulon-B Escort Frigate (57)"],
    "CR90":["CR90 Corvette B (39)","CR90 Corvette A (44)"],
    "Hammer":["Hammerhead Torpedo Corvette (36)","Hammerhead Scout Corvette (41)"],
    "GR-75":["GR-75 Medium Transports (18)","GR-75 Combat Retrofits (24)"],
    "Venator":["Venator I-class Star Destroyer (90)","Venator II-class Star Destroyer (100)"],
    "Acclamator":["Acclamator I-class Assault Ship (66)","Acclamator II-class Assault Ship (71)"],
    "Rep Pelta":["Pelta-class Medical Frigate (49)","Pelta-class Transport Frigate (45)"],
    "Consular":["Consular-class Armed Cruiser (37)","Consular-class Charger c70 (45)"],
    "Providence":["Providence-class Carrier (105)","Providence-class Dreadnought (105)"],
    "Recusant":["Recusant-class Light Destroyer (85)","Recusant-class Support Destroyer (90)"],
    "Munificent":["Munificent-class Comms Frigate (70)","Munificent-class Star Frigate (73)"],
    "Hardcell":["Hardcell-class Transport (47)","Hardcell-class Battle Refit (52)"],

}

df_groupby = function(df, keys){
    results = {}
    for(var key of keys){
        results[key] = {}
        results[key].unique = []
        if (!(key in df)){
            console.error("'"+key+"' not in dataframe!")
        } else {
            for(val of df[key].unique().values){
                map = {}
                map[key]=val
                results[key].unique.push(map)
            }
        }
    }
    pairings = null
    for(var key of keys){
        if(pairings == null){
            pairings = results[key].unique
        } else {
            pairings = pairings.flatMap(map => {
                //return {...map, ...results[key].unique}
                return results[key].unique.map(othermap => {return {...map, ...othermap};})
            })
        }
    }
    groupbyobj = {groups: [],df: df}
    groupbyobj.agg = function(aggdict){
        index = []
        rows = []
        for(var group of this.groups){
            index.push(group.name)
            row = {}
            for(var key in aggdict){
                if (!Array.isArray(aggdict[key])){
                    aggdict[key] = [aggdict[key]]
                }
                for(var metric_func of aggdict[key]){
                    var filtered = this.df.loc({rows:group.filter})
                    var column = filtered[key]
                    var metric = column[metric_func]()
                    row[key+":"+metric_func]=metric
                }
            }
            rows.push(row)
        }
        return new dfd.DataFrame(rows, {index:index})
    }
    
    for(var pairing of pairings){
        filter = df['points'].apply((x)=>true) //all true
        for(var key in pairing){
            filter = filter.and(df[key].eq(pairing[key]))
        }
        matches = df.loc({rows:filter})
        if(matches.$index.length>0){
            group = {}
            group.name = JSON.stringify(pairing)
            group.filter = filter
            group.count = matches.$index.length
            groupbyobj.groups.push(group)
        }
    }
    return groupbyobj
    // console.log(pairings)
}
ko.options.deferUpdates = true;

dfd.read_csv("2021_10_28_ttsarmada_cloud.csv")
.then(df => {
    dfgames = df
    var moralo = dfgames['commander'].ne("Moralo Eval (22)")
    var bossk = dfgames['commander'].ne("Bossk (23)")
    var nocmdr = dfgames['commander'].ne("")
    dfgames = dfgames.loc({rows:moralo.and(bossk).and(nocmdr)})
    dfgames['name'].apply(s => String(s), {inplace:true})//Doesn't work?
    dfgames.fillna(['False',''],{columns:['ranked','tournamentCode']})
    koModel = new AnalysisModel(dfgames)
    shipdict = {}
    for(var ship in ship_filters){
        shipdict[ship] = {
            name: ko.observable(ship),
            cols: ko.observableArray(ship_filters[ship])
        }
        koModel.ships.push(shipdict[ship])
    }
    koModel.ships_byname(shipdict)
    // koModel.numberOfGames(dfgames.$index.length)
    koModel.commanders(dfgames['commander'].unique().values.sort())
    koModel.factions(dfgames['faction'].unique().values.sort())
    koModel.tournamentCodes(dfgames.loc({columns:['tournamentCode']}).values.filter((v, i, a) => v[0]!=null && v[0].length<25).map(r=>String(r[0])).filter((v, i, a) => a.indexOf(v) === i).sort())


    document.getElementById("loading").classList.remove("d-flex")
    document.getElementById("loading").classList.add("d-none")
    document.getElementById("scores").classList.remove("invisible")
    document.getElementById("statistics").classList.remove("invisible")
    document.getElementById("cardmetrics").classList.remove("invisible")
    document.getElementById("nemesis").classList.remove("invisible")

    
    ko.applyBindings(koModel);

    setTimeout(function() {
        
        const urlParams = new URLSearchParams(window.location.search);
        let data64 = urlParams.get('data')
        if(data64){
            let datastr = atob(data64)
            let data = JSON.parse(datastr)

            if('selectedFactions' in data){
                koModel['selectedFactions'](data['selectedFactions'])
            }

            setTimeout(function() {
                for(var key of Object.keys(data)){
                    if(key!='selectedFactions'){
                        koModel[key](data[key])
                    }
                }
            },100)
        }
    },100)


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
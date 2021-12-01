dfgames = null
factions = null
koModel = null

MIN_GAMES = 7
MIN_ELO = 900
ELO_EXCEPTION = 1200
function AnalysisModel(df,dfplayers){
    this.df = ko.observable(df)
    this.dfplayers = ko.observable(dfplayers)
    this.min_games = ko.observable(MIN_GAMES)
    this.min_elo = ko.observable(MIN_ELO)
    this.elo_exception = ko.observable(ELO_EXCEPTION)
    this.varsity_only = ko.observable('')
    this.stats_filter = ko.observable('')
    this.dfplayers_filtered = ko.computed(function(){
        let df = this.dfplayers()
        let exp_filt = df['games'].ge(+this.min_games())
        let weak_filt = df['elo'].ge(+this.min_elo())
        let win_filt = df['elo'].gt(+this.elo_exception())
        return df.loc({rows:(exp_filt.or(win_filt,{inplace:true})).and(weak_filt,{inplace:true})})
    },this)
    this.df_varsity = ko.computed(function(){
        let df = this.df()
        let varsity_players = this.dfplayers_filtered()['name'].values
        let p1 = df['name'].isin(varsity_players)
        let p2 = df['opposing_name'].isin(varsity_players)
        return df.loc({rows:p1.and(p2,{inplace:true})})
    },this)
    this.commanders = ko.observableArray([])
    this.factions = ko.observableArray([])
    this.tournamentCodes = ko.observableArray([])
    this.selectedCommanders = ko.observableArray([])
    this.selectedFactions = ko.observableArray([])
    this.selectedPlayers = ko.observableArray([])
    this.selectedTournamentCodes = ko.observableArray([])

    this.selectedCards = ko.observableArray([])
    this.selectedcards_op = ko.observable("or")
    this.selectedcards_not = ko.observable("")
    
    this.opposingCards = ko.observableArray([])
    this.opposingcards_op = ko.observable("or")
    this.opposingcards_not = ko.observable("")
    
    this.ships_byname = ko.observable()
    this.ships = ko.observableArray([])
    this.selectedShips = ko.observable("")
    this.ranked = ko.observable("")
    this.firstsecond = ko.observable("")
    this.groupby = ko.observable("")
    this.groupby_opposing = ko.observable("")

    this.groupby_filter_column = ko.observable("")
    this.groupby_filter = ko.observable("")

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
        if (this.selectedcards_op()!="or"){
            data['selectedcards_op'] = this.selectedcards_op()
        }
        if (this.selectedcards_not()){
            data['selectedcards_not'] = this.selectedcards_not()
        }
        if (this.opposingCards().length>0){
            data['opposingCards'] = this.opposingCards()
        }
        if (this.opposingcards_op()!="or"){
            data['opposingcards_op'] = this.opposingcards_op()
        }
        if (this.opposingcards_not()){
            data['opposingcards_not'] = this.opposingcards_not()
        }
        
        if (this.min_games()!=MIN_GAMES){
            data['min_games'] = this.min_games()
        }
        if (this.min_elo()!=MIN_ELO){
            data['min_elo'] = this.min_elo()
        }
        if (this.elo_exception()!=ELO_EXCEPTION){
            data['elo_exception'] = this.elo_exception()
        }
        if (this.varsity_only()!=""){
            data['varsity_only'] = this.varsity_only()
        }

        if (this.ranked()!=''){
            data['ranked'] = this.ranked()
        }
        if (this.firstsecond()!=''){
            data['firstsecond'] = this.firstsecond()
        }
        if (this.groupby()!=''){
            data['groupby'] = this.groupby()
        }
        if (this.stats_filter()!=''){
            data['stats_filter'] = this.stats_filter()
        }
        if (this.groupby_opposing()!=''){
            data['groupby_opposing'] = this.groupby_opposing()
        }
        if (this.groupby_filter_column()!=''){
            data['groupby_filter_column'] = this.groupby_filter_column()
        }
        if (this.groupby_filter()!=''){
            data['groupby_filter'] = this.groupby_filter()
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
        var input = document.getElementById("url");
        input.focus();
        input.select();
        document.execCommand('Copy');
        
        if ( document.selection ) {
            document.selection.empty();
        } else if ( window.getSelection ) {
            window.getSelection().removeAllRanges();
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
            // filter = dfgames['faction'].isna()
            // for( var i in selectedFactions){
            //     filter = filter.or(dfgames['faction'].eq(selectedFactions[i]),{inplace:true})
            // }
            filter = dfgames['faction'].isin(this.selectedFactions())
            this.commanders(dfgames.loc({rows:filter})['commander'].unique().values.sort())
        }
        this.selectedCommanders([])
    
    },this)
    this.df_filtered_byfaction = ko.computed(function(){
        filtered = this.df()
        if(this.varsity_only()=="true"){
            filtered = this.df_varsity()
        }
        if (this.selectedFactions().length>0){
            // filter = filtered['faction'].isna()
            // for( var i in this.selectedFactions()){
            //     filter = filter.or(filtered['faction'].eq(this.selectedFactions()[i]))
            // }
            filter = filtered['faction'].isin(this.selectedFactions())
            filtered = filtered.loc({rows:filter})
        }
        return filtered
    },this)
    this.df_filtered_bycmdr = ko.computed(function(){
        filtered = this.df_filtered_byfaction()
        if (this.selectedCommanders().length>0){
            // filter = filtered['commander'].isna()
            // for( var i in this.selectedCommanders()){
            //     filter = filter.or(filtered['commander'].eq(this.selectedCommanders()[i]))
            // }
            filter = filtered['commander'].isin(this.selectedCommanders())
            filtered = filtered.loc({rows:filter})
        }
        return filtered
    },this)
    this.df_filtered_bytournament = ko.computed(function(){
        filtered = this.df_filtered_bycmdr()
        if (filtered.$index.length>0 && this.selectedTournamentCodes().length>0){
            // filter = new dfd.Series(filtered.values.map(r=>false))
            // filter = filtered['tournamentCode'].isna()
            // for( var i in this.selectedTournamentCodes()){
                
            //     filter = filter.or(new dfd.Series(filtered.loc({columns:['tournamentCode']}).values.map(r=>r[0]==this.selectedTournamentCodes()[i])))
            // }
            
            filter = filtered['tournamentCode'].isin(this.selectedTournamentCodes())
            filtered = filtered.loc({rows:filter})
        }
        return filtered
    },this)
    this.df_filtered_byplayer = ko.computed(function(){
        filtered = this.df_filtered_bytournament()
        if (this.selectedPlayers().length>0){
            // filter = filtered['name'].isna()
            // for( var i in this.selectedPlayers()){
            //     filter = filter.or(filtered['name'].eq(this.selectedPlayers()[i]))
            // }
            filter = filtered['name'].isin(this.selectedPlayers())
            filtered = filtered.loc({rows:filter})
        }
        return filtered
    },this)
    this.df_filtered_bycard = ko.computed(function(){
        filtered = this.df_filtered_byplayer()
        if (this.selectedCards().length>0){
            filter = filtered['name'].apply((v)=>false)
            if(this.selectedcards_not()){
                if (this.selectedcards_op()=="and"){
                    for( var card of this.selectedCards()){
                        filter = filter.or(filtered[card].eq(0),{inplace:true})
                    }
                } else {
                    filter = filter.or(true,{inplace:true})
                    for( var card of this.selectedCards()){
                        filter = filter.and(filtered[card].eq(0),{inplace:true})
                    }
                }
            } else {
                if (this.selectedcards_op()=="or"){
                    for( var card of this.selectedCards()){
                        filter = filter.or(filtered[card].gt(0),{inplace:true})
                    }
                } else {
                    filter = filter.or(true,{inplace:true})
                    for( var card of this.selectedCards()){
                        filter = filter.and(filtered[card].gt(0),{inplace:true})
                    }
                }
            }
            filtered = filtered.loc({rows:filter})
        }
        if (this.opposingCards().length>0){
            filter = filtered['name'].apply((v)=>false)
            if(this.opposingcards_not()){
                if (this.opposingcards_op()=="and"){
                    for( var card of this.opposingCards()){
                        filter = filter.or(filtered["VS:"+card].eq(0),{inplace:true})
                    }
                } else {
                    filter = filter.or(true,{inplace:true})
                    for( var card of this.opposingCards()){
                        filter = filter.and(filtered["VS:"+card].eq(0),{inplace:true})
                    }
                }
            } else {
                if (this.opposingcards_op()=="or"){
                    for( var card of this.opposingCards()){
                        filter = filter.or(filtered["VS:"+card] /*.gt(0)*/,{inplace:true})
                    }
                } else {
                    filter = filter.or(true)
                    for( var card of this.opposingCards()){
                        filter = filter.and(filtered["VS:"+card] /*.gt(0)*/,{inplace:true})
                    }
                }
            }
            filtered = filtered.loc({rows:filter})
        }
        return filtered
    },this)
    this.df_filtered =  ko.computed(function(){
        filtered = this.df_filtered_bycard()
        if (filtered.$index.length==0){
            return filtered
        }
        if(this.ranked()=="true"){
            filtered = filtered.loc({rows:filtered['ranked']/*.eq("True")*/})
        }
        if (filtered.$index.length==0){
            return filtered
        }
        if(this.firstsecond()=="first"){
            filtered = filtered.loc({rows:filtered['first']/*.eq("True")*/})
        }
        if(this.firstsecond()=="second"){
            filtered = filtered.loc({rows:filtered['first'].not()/*.eq("False")*/})
        }
        return filtered
    },this)
    this.df_filtered_bysubgroup =  ko.computed(function(){
        df = this.df_filtered()
        if(df.$index.length>0 && Object.keys(this.subgroup()).length>0){
            filter = df['points'].apply((x)=>true) //all true
            for(var key in this.subgroup()){
                filter = filter.and(df[key].eq(this.subgroup()[key]),{inplace:true})
            }
            df = df.loc({rows:filter})
        }
        return df
    },this)
    this.df_filtered_bygroupby_filter =  ko.computed(function(){
        df = this.df_filtered_bysubgroup()
        if(df.$index.length>0 && this.groupby_filter()!="" && this.groupby_filter_column()!="" ){
            filter = df[this.groupby_filter_column()].eq(this.groupby_filter())
            df = df.loc({rows:filter})
        }
        return df
    },this)
    this.df_plot = ko.computed(function(){
        return this.df_filtered_bygroupby_filter()
    },this)
    this.df_first =  ko.computed(function(){
        if(this.df_plot().$index.length>0){
            return this.df_plot().loc({rows:this.df_plot()['first']/*.eq("True")*/})
        } else{
            return []
        }
    },this)
    this.df_second =  ko.computed(function(){
        if(this.df_plot().$index.length>0){
            return this.df_plot().loc({rows:this.df_plot()['first'].not()/*.ne("True")*/})
        } else{
            return []
        }
    },this)
    this.shiptype_groupby = ko.computed(function(){
        if (this.selectedShips()==""){
            return []
        }
        if(this.groupby_opposing()=="opposing_"){
            return this.ships_byname()[this.selectedShips()].cols().map(s => "VS:"+s)
        } else {
            return this.ships_byname()[this.selectedShips()].cols()
        }
    }, this)
    this.common_toggle_visible = ko.computed(function(){
        return this.groupby()!="" && this.groupby_metrics().length>10
    },this)
    this.groupby_metrics = ko.computed(function(){
        if (this.df_filtered().$index.length==0){
            return []
        }
        if (this.groupby()==""){
            return []
        } else if (this.groupby()=="shiptype"){
            if (this.selectedShips()==""){
                return []
            }
            // var agg = this.df_filtered().groupby(this.shiptype_groupby()).agg({'points':['count','mean']})
            // var win = this.df_filtered().groupby(this.shiptype_groupby()).agg({'win':'mean'})['win:mean'].values
            // var winbig = this.df_filtered().groupby(this.shiptype_groupby()).agg({'winbig':'mean'})['winbig:mean'].values
            // var losebig = this.df_filtered().groupby(this.shiptype_groupby()).agg({'losebig':'mean'})['losebig:mean'].values
            
            agg_dict = {'points':['count','mean'],'win':'mean','winbig':'mean','losebig':'mean'}
            var agg = this.df_filtered().groupby(this.shiptype_groupby()).agg(agg_dict)
            var countmean = agg.values
            var names = agg.$index
            return names.map(function(e, i){
                pairing = JSON.parse(e)
                nonzero_pairing_array = Object.entries(pairing).filter(([k,v]) => v>0)
                description = nonzero_pairing_array.map((p)=>p[1]+" x "+p[0]).join(",\n")
                if(description==""){
                    description="all others"
                }
                //name, mean, count, win, bigwin, bigloss, data
                return [description, agg['points:mean'].values[i], agg['points:count'].values[i], agg['win:mean'].values[i],agg['winbig:mean'].values[i],agg['losebig:mean'].values[i],pairing];
            }).sort((a, b) => b[2]- a[2]) //1 = score //2 = count
        } else if (this.groupby()=="squads"){
            let df = this.df_filtered()
            if (df.$index.length==0){
                return []
            }
            var ranges = [["None",-1,0],["Minimal (0-45]",0,45],["Light (45-66]",45,66],["Moderate (66-100]",66,100],["Full (100-126]",100,126],["Max (126-134]",126,134]]
            var filters = ranges.map(r => df[this.groupby_opposing()+'squads'].gt(r[1]).and(df[this.groupby_opposing()+'squads'].le(r[2]),{inplace:true}))
            var dfs = filters.map(filter => df.loc({rows:filter}))
            
            //name, mean, count, win, bigwin, bigloss, data
            return ranges.map((r, i) => [r[0], 
                                         dfs[i].$index.length>0?dfs[i]['points'].mean():0, 
                                         dfs[i].$index.length, 
                                         dfs[i].$index.length>0?dfs[i]['win'].mean():0,
                                         dfs[i].$index.length>0?dfs[i]['winbig'].mean():0,
                                         dfs[i].$index.length>0?dfs[i]['losebig'].mean():0, 
                                         {[this.groupby_opposing()+'squads']:'('+r[1]+","+r[2]+"]"}])
        } else {
            let df = this.df_filtered()
            if (df.$index.length==0){
                return []
            }
            let key = this.groupby_opposing()+this.groupby()
            if(this.groupby()=="objective"){
                key = this.groupby()
            }
            agg_dict = {'points':['count','mean'],'win':'mean','winbig':'mean','losebig':'mean'}
            let agg = this.df_filtered().groupby(key).agg(agg_dict)
            // let means = this.df_filtered().groupby([key]).agg({'points':'mean'}).values
            // var win = this.df_filtered().groupby([key]).agg({'i_win':'mean'})['i_win_mean'].values
            // var winbig = this.df_filtered().groupby([key]).agg({'i_winbig':'mean'})['i_winbig_mean'].values
            // var losebig = this.df_filtered().groupby([key]).agg({'i_losebig':'mean'})['i_losebig_mean'].values
            // let count_values = this.df_filtered().groupby([key]).agg({'points':'count'})['points_count'].values
            // var win = this.df_filtered().groupby([key]).agg({'win':'mean'})['win_mean'].values
            results = agg.$index.map(function(e, i) {
                var pairing = {}
                pairing[e] = 1
                //name, mean, count, win, bigwin, bigloss, data
                return [e, agg['points:mean'].values[i], agg['points:count'].values[i], agg['win:mean'].values[i],agg['winbig:mean'].values[i],agg['losebig:mean'].values[i],pairing];
            })
            if(["activations","activation_advantage",'deployment_advantage'].includes(this.groupby())){
                results = results.sort((a, b) => b[0]- a[0]);
            } else {
                results = results.sort((a, b) => b[1]- a[1]);
            }
            return results
        }
    },this)
    this.groupby_metrics_filtered = ko.computed(function(){
        if(this.stats_filter()==""){
            var count = this.df_filtered().$index.length
            var groups = this.groupby_metrics().length
            if (this.common_toggle_visible()){
                var mingroupsize = 8 //Math.min(8,count/groups/4)
                return this.groupby_metrics().filter(row => row[2]>=mingroupsize)
            } else {
                return this.groupby_metrics()
            }
        } else {
            return this.groupby_metrics()
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
    this.all_cards = ko.computed(function(){
        return this.df().$columns.filter(c => c.startsWith("VS:")).map(c => c.substring(3)).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    },this)
    this.cards = ko.computed(function(){
        return this.df_filtered_bysubgroup().$columns.filter(c => c.startsWith("VS:")).map(c => c.substring(3)).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    },this)
    this.cardmetrics = ko.observableArray([])
    this.common_cards = function(){
        document.getElementById("card-metrics-loading").classList.remove("d-none")
        document.getElementById("calc-card-metrics").classList.add("d-none")
        setTimeout(() => {
            cards = this.cards() //this.df_filtered_bysubgroup().$columns.filter(c => c.startsWith("VS:")).map(c => c.substring(3))
            matches = cards.map(c => this.df_plot()[c].gt(0).sum())
            scores = cards.map(c => {
                rows = this.df_plot().loc({rows:this.df_plot()[c].gt(0)})
                if(rows.$index.length>0){
                    return rows['points'].mean()
                } else {
                    return 0
                }
            })
            cards = cards.map((e, i) => [e, scores[i],matches[i]]).filter(c => c[2]>0).sort((a,b)=>b[2]-a[2])
            this.cardmetrics(cards)
            document.getElementById("card-metrics-loading").classList.add("d-none")
            document.getElementById("calc-card-metrics").classList.remove("d-none")
            // return cards
        }, 100)
    }
    this.cardmetrics_threshold = ko.observable(0.5)
    this.cardmetrics_filtered = ko.computed(function(){
        var count = this.df_plot().$index.length
        return this.cardmetrics().filter(r => (r[2]>=(1-this.cardmetrics_threshold())*count))
    },this)
    this.cardmetrics_hidden = ko.computed(function(){
        return this.cardmetrics().length - this.cardmetrics_filtered().length
    },this)
    this.nemesismetrics = ko.observableArray([])
    this.nemesis_cards = function(){
        document.getElementById("nemesis-loading").classList.remove("d-none")
        document.getElementById("calc-nemesis").classList.add("d-none")
        setTimeout(() => {
            cards = this.df_plot().$columns.filter(c => c.startsWith("VS:"))
            matches = cards.map(c => this.df_plot()[c].gt(0).sum())
            scores = cards.map(c => {
                rows = this.df_plot().loc({rows:this.df_plot()[c].gt(0)})
                if(rows.$index.length>0){
                    return rows['points'].mean()
                } else {
                    return 0
                }
            })
            var mean = this.df_plot()['points'].mean()
            cards = cards.map((e, i) => [e, scores[i],matches[i]]).filter(c => c[2]>0).filter(c => (+c[1]<+mean)).sort((a,b)=>a[1]-b[1])
            this.nemesismetrics(cards)
            document.getElementById("nemesis-loading").classList.add("d-none")
            document.getElementById("calc-nemesis").classList.remove("d-none")
            
            // return cards
        }, 100)
    }
    this.nemesis_threshold = ko.observable(90)
    this.nemesismetrics_filtered = ko.computed(function(){
        if (this.df_plot().$index.length==0){
            return []
        }
        // var mean = this.df_plot()['points'].mean()
        return this.nemesismetrics().filter(r => (r[2]>=(100-this.nemesis_threshold())))// && (+r[1]<+mean))
    },this)
    this.nemesismetric_hidden = ko.computed(function(){
        return this.nemesismetrics().length - this.nemesismetrics_filtered().length
    },this)
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
    this.calculate_win_color = function(v){
        var min = .4 //this.groupby_metrics_min()
        var mid = .5 //this.groupby_metrics_mid()
        var max = .6 //this.groupby_metrics_max()
        if(min==mid){
            return "rgb(255,255,0)"
        }
        var r =  parseInt(255*Math.max(0,Math.min(1,  1-(v-mid)/(max-mid) )))
        var g =  parseInt(255*Math.max(0,Math.min(1,  (v-min)/(mid-min)   )))
        return "rgb("+r+","+g+",0)"
    }
    this.calculate_bigwin_color = function(v){
        var min = .1 //this.groupby_metrics_min()
        var mid = .35 //this.groupby_metrics_mid()
        var max = .6 //this.groupby_metrics_max()
        if(min==mid){
            return "rgb(255,255,0)"
        }
        var r =  parseInt(255*Math.max(0,Math.min(1,  1-(v-mid)/(max-mid) )))
        var g =  parseInt(255*Math.max(0,Math.min(1,  (v-min)/(mid-min)   )))
        return "rgb("+r+","+g+",0)"
    }
    this.calculate_bigloss_color = function(v){
        var min = .1 //this.groupby_metrics_min()
        var mid = .2 //this.groupby_metrics_mid()
        var max = .3 //this.groupby_metrics_max()
        if(min==mid){
            return "rgb(255,255,0)"
        }
        var g =  parseInt(255*Math.max(0,Math.min(1,  1-(v-mid)/(max-mid) )))
        var r =  parseInt(255*Math.max(0,Math.min(1,  (v-min)/(mid-min)   )))
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
    this.toggle_groupby_subgroup = function(data){
        if (JSON.stringify(this.subgroup()) == JSON.stringify(data[6])){
            this.subgroup({})
        } else {
            this.subgroup(data[6])
        }
    }
    this.toggle_groupby_filter = function(data){
        if(this.groupby()==this.groupby_filter_column() && this.groupby_filter()==data[0]){

            this.groupby_filter_column('');
            this.groupby_filter('')
        } else {
            this.groupby_filter_column(this.groupby());
            this.groupby_filter(data[0])
        }
    }
    // {
    //     if($root.groupby()==$root.groupby_filter_column && $root.groupby_filter()==$data[0]){

    //         $root.groupby_filter_column('');
    //         $root.groupby_filter('')
    //     } else {
    //         $root.groupby_filter_column($root.groupby());
    //         $root.groupby_filter($data[0])
    //     }
    // }
    this.is_assault_objective = function(name){
        obj =  ['Advanced Gunnery','Blockade Run','Close-Range Intel Scan','Ion Storm','Marked for Destruction','Most Wanted','Opening Salvo','Precision Strike','Rift Assault','Station Assault','Surprise Attack','Targeting Beacons']
        return obj.includes(name)
    }
    this.is_defense_objective = function(name){
        obj = ['Abandoned Mining Facility','Asteroid Tactics','Capture the VIP','Contested Outpost','Fighter Ambush','Fire Lanes','Fleet Ambush','Fleet in Being','Hyperspace Assault','Jamming Barrier','Planetary Ion Cannon','Rift Ambush']
        return obj.includes(name)
    }
    this.is_navigation_objective = function(name){
        obj = ['Dangerous Territory','Doomed Station','Hyperspace Migration','Infested Fields','Intel Sweep','Minefields','Navigational Hazards','Salvage Run','Sensor Net','Solar Corona','Superior Positions','Volatile Deposits']
        return obj.includes(name)
    }
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
        setTimeout(
        () => Plotly.newPlot('plot_hist',[trace1,trace2],layout,config),500)
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
loadData = function(){
    ko.options.deferUpdates = true;
    games_promise = DataFrame.read_csv_async("2021_11_27_ttsarmada_cloud.csv")
    players_promise = DataFrame.read_csv_async("2021_11_27_ttsarmada_cloud_players.csv")
    Promise.all([games_promise,players_promise])
    .then((results) => {
        dfgames = results[0]
        dfplayers = results[1]

        koModel = new AnalysisModel(dfgames,dfplayers)
        shipdict = {}
        for(var ship in ship_filters){
            shipdict[ship] = {
                name: ko.observable(ship),
                cols: ko.observableArray(ship_filters[ship])
            }
            koModel.ships.push(shipdict[ship])
        }
        koModel.ships_byname(shipdict)
        koModel.commanders(dfgames['commander'].unique().values.sort())
        koModel.factions(dfgames['faction'].unique().values.sort())
        koModel.tournamentCodes(dfgames['tournamentCode'].values.filter((v, i, a) => v[0]!=null && v[0].length<25).filter((v, i, a) => a.indexOf(v) === i).sort()) //.map(r=>String(r[0]))


        document.getElementById("loading").classList.remove("d-flex")
        document.getElementById("loading").classList.add("d-none")
        document.getElementById("filter").classList.remove("invisible")
        document.getElementById("groupby").classList.remove("invisible")
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

    }).catch(err => {
        console.log(err);
    })
}

document.addEventListener("DOMContentLoaded", function(event) { 
    loadData()
  });
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
        df = this.dfplayers()
        exp_filt = df['games'].ge(+this.min_games())
        weak_filt = df['elo'].ge(+this.min_elo())
        win_filt = df['elo'].gt(+this.elo_exception())
        return df.loc({rows:(exp_filt.or(win_filt)).and(weak_filt)})
    },this)
    this.df_varsity = ko.computed(function(){
        df = this.df()
        varsity_players = this.dfplayers_filtered()['name'].values
        p1 = df['name'].apply(n => varsity_players.includes(n))
        p2 = df['opposing_name'].apply(n => varsity_players.includes(n))
        return df.loc({rows:p1.and(p2)})
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
        if(this.varsity_only()=="true"){
            filtered = this.df_varsity()
        }
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
            if(this.selectedcards_not()){
                if (this.selectedcards_op()=="and"){
                    for( var card of this.selectedCards()){
                        filter = filter.or(filtered[card].eq(0))
                    }
                } else {
                    filter = filter.or(true)
                    for( var card of this.selectedCards()){
                        filter = filter.and(filtered[card].eq(0))
                    }
                }
            } else {
                if (this.selectedcards_op()=="or"){
                    for( var card of this.selectedCards()){
                        filter = filter.or(filtered[card].gt(0))
                    }
                } else {
                    filter = filter.or(true)
                    for( var card of this.selectedCards()){
                        filter = filter.and(filtered[card].gt(0))
                    }
                }
            }
            filtered = filtered.loc({rows:filter})
        }
        if (this.opposingCards().length>0){
            filter = filtered['name'].isna()
            if(this.opposingcards_not()){
                if (this.opposingcards_op()=="and"){
                    for( var card of this.opposingCards()){
                        filter = filter.or(filtered["VS:"+card].eq(0))
                    }
                } else {
                    filter = filter.or(true)
                    for( var card of this.opposingCards()){
                        filter = filter.and(filtered["VS:"+card].eq(0))
                    }
                }
            } else {
                if (this.opposingcards_op()=="or"){
                    for( var card of this.opposingCards()){
                        filter = filter.or(filtered["VS:"+card].gt(0))
                    }
                } else {
                    filter = filter.or(true)
                    for( var card of this.opposingCards()){
                        filter = filter.and(filtered["VS:"+card].gt(0))
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
            filtered = filtered.loc({rows:filtered['ranked'].eq("True")})
        }
        if (filtered.$index.length==0){
            return filtered
        }
        if(this.firstsecond()=="first"){
            filtered = filtered.loc({rows:filtered['first'].eq("True")})
        }
        if(this.firstsecond()=="second"){
            filtered = filtered.loc({rows:filtered['first'].eq("False")})
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
            return this.df_plot().loc({rows:this.df_plot()['first'].eq("True")})
        } else{
            return []
        }
    },this)
    this.df_second =  ko.computed(function(){
        if(this.df_plot().$index.length>0){
            return this.df_plot().loc({rows:this.df_plot()['first'].ne("True")})
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
            var agg = df_groupby(this.df_filtered(),this.shiptype_groupby()).agg({'points':['count','mean']})
            var win = df_groupby(this.df_filtered(),this.shiptype_groupby()).agg({'i_win':'mean'})['i_win:mean'].values
            var winbig = df_groupby(this.df_filtered(),this.shiptype_groupby()).agg({'i_winbig':'mean'})['i_winbig:mean'].values
            var losebig = df_groupby(this.df_filtered(),this.shiptype_groupby()).agg({'i_losebig':'mean'})['i_losebig:mean'].values
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
                return [description, countmean[i][1],countmean[i][0],win[i],winbig[i],losebig[i],pairing];
            }).sort((a, b) => b[2]- a[2]) //1 = score //2 = count
        } else if (this.groupby()=="squads"){
            let df = this.df_filtered()
            if (df.$index.length==0){
                return []
            }
            var ranges = [["None",-1,0],["Minimal (0-40]",0,40],["Light (40-80]",40,80],["Moderate (80-100]",80,100],["Full (100-130]",100,130],["Max (130-134]",130,134]]
            var filters = ranges.map(r => df[this.groupby_opposing()+'squads'].gt(r[1]).and(df[this.groupby_opposing()+'squads'].le(r[2])))
            var dfs = filters.map(filter => df.loc({rows:filter}))
            
            //name, mean, count, win, bigwin, bigloss, data
            return ranges.map((r, i) => [r[0], 
                                         dfs[i].$index.length>0?dfs[i]['points'].mean():0, 
                                         dfs[i].$index.length, 
                                         dfs[i].$index.length>0?dfs[i]['i_win'].mean():0,
                                         dfs[i].$index.length>0?dfs[i]['i_winbig'].mean():0,
                                         dfs[i].$index.length>0?dfs[i]['i_losebig'].mean():0, 
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
            let means = this.df_filtered().groupby([key]).agg({'points':'mean'}).values
            var win = this.df_filtered().groupby([key]).agg({'i_win':'mean'})['i_win_mean'].values
            var winbig = this.df_filtered().groupby([key]).agg({'i_winbig':'mean'})['i_winbig_mean'].values
            var losebig = this.df_filtered().groupby([key]).agg({'i_losebig':'mean'})['i_losebig_mean'].values
            let count_values = this.df_filtered().groupby([key]).agg({'points':'count'})['points_count'].values
            // var win = this.df_filtered().groupby([key]).agg({'win':'mean'})['win_mean'].values
            return means.map(function(e, i) {
                var pairing = {}
                pairing[e[0]] = 1
                //name, mean, count, win, bigwin, bigloss, data
                return [e[0], e[1], count_values[i], win[i],winbig[i],losebig[i],pairing];
            }).sort((a, b) => b[1]- a[1]);
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
    this.cardmetrics = ko.observableArray([])
    this.cardmetrics_threshold = ko.observable(0.5)
    this.cardmetrics_filtered = ko.computed(function(){
        var count = this.df_plot().$index.length
        return this.cardmetrics().filter(r => (r[2]>=(1-this.cardmetrics_threshold())*count))
    },this)
    this.cardmetrics_hidden = ko.computed(function(){
        return this.cardmetrics().length - this.cardmetrics_filtered().length
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
            //this.cardmetrics(cards)
            document.getElementById("card-metrics-loading").classList.add("d-none")
            document.getElementById("calc-card-metrics").classList.remove("d-none")
            this.cardmetrics(cards)
        }, 100)
    }//,this)
    this.nemesismetrics = ko.observableArray([])
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
games_promise = dfd.read_csv("2021_11_26_ttsarmada_cloud.csv")
players_promise = dfd.read_csv("2021_11_24_ttsarmada_cloud_players.csv")
Promise.all([games_promise,players_promise])
.then((results) => {
    dfgames = results[0]
    dfplayers = results[1]
    // var moralo = dfgames['commander'].ne("Moralo Eval (22)")
    // var bossk = dfgames['commander'].ne("Bossk (23)")
    // var nocmdr = dfgames['commander'].ne("")
    // var Ackbar28 = dfgames['commander'].ne("Admiral Raddus (28)")
    // var notnull = dfgames['commander'].values.map(v => v!=null)
    // dfgames = dfgames.loc({rows:moralo.and(bossk).and(nocmdr).and(Ackbar28).and(notnull)})
    // dfgames['name'].apply(s => String(s), {inplace:true})//Doesn't work?
    // dfgames.fillna(['False',''],{columns:['ranked','tournamentCode']})
    let i_win = dfgames['win'].apply(w => (w=="True"?1:0))
    dfgames.addColumn({column:'i_win', values:i_win, inplace:true})
    let i_winbig = dfgames['points'].apply(w => (w>=8?1:0))
    dfgames.addColumn({column:'i_winbig', values:i_winbig, inplace:true})
    let i_losebig = dfgames['points'].apply(w => (w<=3?1:0))
    dfgames.addColumn({column:'i_losebig', values:i_losebig, inplace:true})

    // for (key in ship_filters){
    //     let archcnt = dfgames['points'].apply(p => 0)
    //     let archcnt_vs = dfgames['points'].apply(p => 0)
    //     for (ship of ship_filters[key]){
    //         archcnt = archcnt.add(dfgames[ship])
    //         archcnt_vs = archcnt.add(dfgames["VS:"+ship])
    //     }
    //     dfgames.addColumn({column:key,values:archcnt,inplace:true})
    //     dfgames.addColumn({column:key+"_VS",values:archcnt_vs,inplace:true})
    // }
    // shiptypes = dfgames.loc({columns:Object.keys(ship_filters)})
    // archtypes = shiptypes.values.map((r) => {
    //     arch = {}
    //     for (var i in r){
    //         if (r[i]>0){
    //             arch[shiptypes.$columns[i]] = r[i]
    //         }
    //     }
    //     archstr = ""
    //     for (var key in arch){
    //         if(archstr.length>0){
    //             archstr+=", "
    //         }
    //         if(arch[key]>1){
    //             archstr += arch[key]+" x "
    //         }
    //         archstr+=key
    //     }
    //     // return JSON.stringify(arch)
    //     return archstr
    // })
    // dfgames.addColumn({column:'archtype', values:archtypes, inplace:true})


    // opposing_shiptypes = dfgames.loc({columns:Object.keys(ship_filters).map(s => s+"_VS")})
    // opposing_archtypes = opposing_shiptypes.values.map((r) => {
    //     arch = {}
    //     for (var i in r){
    //         if (r[i]>0){
    //             arch[shiptypes.$columns[i].replace("_VS","")] = r[i]
    //         }
    //     }
    //     return JSON.stringify(arch)
    // })
    // dfgames.addColumn({column:'opposing_archtype', values:opposing_archtypes, inplace:true})

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
    // koModel.numberOfGames(dfgames.$index.length)
    koModel.commanders(dfgames['commander'].unique().values.sort())
    koModel.factions(dfgames['faction'].unique().values.sort())
    koModel.tournamentCodes(dfgames.loc({columns:['tournamentCode']}).values.filter((v, i, a) => v[0]!=null && v[0].length<25).map(r=>String(r[0])).filter((v, i, a) => a.indexOf(v) === i).sort())


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

function timeIt(func,name,log){
    var startTime = performance.now()
    for(var i =0;i<1;i++){
        func()
    }
    var endTime = performance.now()
    if(log){
        console.log(func())
    }
    console.log(`${name} took ${((endTime - startTime)/1).toFixed(4)} milliseconds`)
}
function testMine(){
    timeIt(() => mydf.values,'mydf.values')
    timeIt(() => mydf['name'].values,'mydf.series.values')
    timeIt(() => mydf['activations'].mean(),'mydf.series.mean',true)
    timeIt(() => {
        filter = mydf['activations'].eq(3)
        df = mydf.loc({rows:filter})
        return df['activations'].mean()
        
    },'mydf.filtered.series.mean',true)
}
function testDanfo(){
    timeIt(() => dfgames.values,'danfo.values')
    timeIt(() => dfgames['name'].values,'danfo.series.values')
    timeIt(() => dfgames['activations'].mean(),'danfo.series.mean',true)
    timeIt(() => {
        filter = dfgames['activations'].eq(3)
        df = dfgames.loc({rows:filter})
        return df['activations'].mean()
    },'danfo.filtered.series.mean',true)
}
// DataFrame.read_csv_async("2021_11_26_ttsarmada_cloud.csv").then(df => {
//     mydf = df
// })
// function loadCsv(data){
//     parsed = Papa.parse(data, {
//         skipEmptyLines: true
//     })
//     mydf = new DataFrame(parsed.data)
// }
// document.addEventListener("DOMContentLoaded",function() {
//     fetch("2021_11_24_ttsarmada_cloud.csv", { method: 'get' }).then((resp) => resp.text()).then(loadCsv)
// });
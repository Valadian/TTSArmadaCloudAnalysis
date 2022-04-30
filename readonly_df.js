class StandaloneSeries{
    constructor(data){
        this.values = data
    }
    or(other, params) {
        let othervalues = other
        if (other instanceof StandaloneSeries || other instanceof Series){
            othervalues = other.values
        }
        let isscalar = !Array.isArray(othervalues)
        if (params && params['inplace']){
            for (var i in this.values){
                this.values[i] = this.values[i] || (isscalar?othervalues:othervalues[i])
            }
            return this 
        } else {
            return new StandaloneSeries(this.values.map((e,i)=> e||othervalues[i]))
        }
    }
    and(other, params) {
        let othervalues = other
        if (other instanceof StandaloneSeries || other instanceof Series){
            othervalues = other.values
        }
        let isscalar = !Array.isArray(othervalues)
        if (params && params['inplace']){
            for (var i in this.values){
                this.values[i] = this.values[i] && (isscalar?othervalues:othervalues[i])
            }
            return this 
        } else {
            return new StandaloneSeries(this.values.map((e,i)=> e&&othervalues[i]))
        }
    }
    apply(func, params){
        let othervalues = other
        if (other instanceof StandaloneSeries || other instanceof Series){
            othervalues = other.values
        }
        if (params && params['inplace']){
            for (var i in this.values){
                this.values[i] = func(this.values[i])
            }
            return this 
        } else {
            return new StandaloneSeries(this.values.map(func))
        }
    }
    sum(){
        return this.values.reduce((a, b) => (a + b),0)
    }
    mean(){
        return this.values.reduce((a, b) => (a + b),0) / this.values.length;
    }
}
class Series {
    constructor(data,idx, i_col,skip_dtype_determination){
        this._i_col = i_col
        this._all_values = data
        this._values_cached = null
        this._index = idx
        if(!skip_dtype_determination){
            if (this._areNumbers()){
                this.astype(Number)
            }
            if (this._areBools()){
                this.astype((v)=>v=="True")
            }
        }
    }
    get values(){
        if (this._values_cached == null){
            this._values_cached = this._index.map(i => this._all_values[i][this._i_col])
        }
        return this._values_cached
    }
    *uncached_values(){
        for(var i of this._index){
            yield this._all_values[i][this._i_col]
        }
    }
    apply(func){
        return new StandaloneSeries(this.values.map(func))
    }
    not(){
        return new StandaloneSeries(this.values.map(v => !v))
    }
    eq(comp){
        return new StandaloneSeries(this.values.map(v => v == comp))
    }
    ge(comp){
        return new StandaloneSeries(this.values.map(v => v >= comp))
    }
    gt(comp){
        return new StandaloneSeries(this.values.map(v => v > comp))
    }
    le(comp){
        return new StandaloneSeries(this.values.map(v => v <= comp))
    }
    lt(comp){
        return new StandaloneSeries(this.values.map(v => v < comp))
    }
    sum(){
        return this.values.reduce((a, b) => (a + b),0)
    }
    count(){
        return this._index.length
    }
    mean(){
        return this.values.reduce((a, b) => (a + b),0) / this.values.length;
    }
    unique(){
        return new StandaloneSeries(this.values.filter((v, i, a) => a.indexOf(v) === i))
    }
    isin(searchArray){
        return new StandaloneSeries(this.values.map((v)=> searchArray.includes(v)))
    }
    includes(searchElement){
        for (var v of this.uncached_values()){
            if (v==searchElement){
                return true
            }
        }
        return false
    }
    _areNumbers(){
        for (var v of this.uncached_values()){
            if (isNaN(Number(v))){
                return false
            }
        }
        return true
    }
    _areBools(){
        for (var v of this.uncached_values()){
            if (v!="True" && v!="False" && v!==true && v!==false){
                return false
            }
        }
        return true
    }
    astype(type){
        for(var i of this._index){
            this._all_values[i][this._i_col] = type(this._all_values[i][this._i_col])
        }
        return this
    }
    _set_index(index){
        this._index = index
        this._values_cached = null
    }
    loc(params){
        if("rows" in params){
            filter = params['rows']
        }
        // TODO: Support column filters
        // if("columns" in params){
        //     filter = params['columns']
        // }
        if (filter instanceof StandaloneSeries || filter instanceof Series){
            filter = filter.values
        }
        if (!Array.isArray(filter)){
            filter = [filter]
        }
        if(params['inplace']){
            this._index = this._index.filter((e,i) => filter[i])
            this._values_cached = null
        } else {
            copy = this.clone()
            copy.loc({rows:filter,inplace:true})
        }
    }
    clone(){
        copy = new Series(this._all_values,this._index,this._i_col)
        copy._index = this._index
        copy._values_cached = this._values_cached
    }
}

class DataFrame {
    constructor(data, columns, idx, col_idx, skip_dtype_determination) {
        this.$rows = data
        this.$columns = columns
        if(col_idx==null){
            this.$col_index = Object.assign({}, ...this.$columns.map((e,i) => ({[e]: i})))
        } else {
            this.$col_index = col_idx
        }

        if(idx==null){
            this.$index = data.map((e,i) => i)
        } else {
            this.$index = idx
        }
        this.$cols = this.$columns.map((e,i) => new Series(data,this.$index,i,skip_dtype_determination))
        for(var i in this.$columns){
            let key = this.$columns[i]
            this[key] = this.$cols[i]
        }
        this.$rows_filtered = null
        this._filtered = false
    }
    // constructor(raw_data) {
    //     let header = raw_data[0]
    //     this.columns = header.slice(1)
    //     this.$col_index = Object.assign({}, ...this.columns.map((e,i) => ({[e]: i})))

    //     let data = raw_data.slice(1)
    //     this.index = data.map(r => r[0])
    //     let rowdata = data.map(r => r.slice(1))
    //     this.$cols = this.columns.map((e,i) => new Series(rowdata.map(r => r[i])))
    //     for(var i in this.columns){
    //         let key = this.columns[i]
    //         this[key] = this.$cols[i]
    //     }
    //     this.$rows = this.index.map((e,i) => this.$cols.map(c => c.values[i]))
    //     this.$rows_filtered = null
    //     this._filtered = false
    // }
    loc(params){
        let filter = params.rows
        if (filter instanceof StandaloneSeries || filter instanceof Series){
            filter = filter.values
        }
        let tgt = this
        if(!params['inplace']){
            tgt = new DataFrame(this.$rows,this.$columns, this.$index, this.$col_index, true)
        }
        tgt.$index = tgt.$index.filter((e,i) => filter[i])
        for(var col of tgt.$cols){
            col._set_index(tgt.$index)
        }
        tgt.$rows_filtered = null
        return tgt
    }
    get values(){
        if(this._filtered){
            if(this.$rows_filtered==null){
                this.$rows_filtered = this.$index.map(i => this.$rows[i])
            }
            return this.$rows_filtered
        } else {
            return this.$rows
        }
    }
    cols(){
        return this.$cols
    }
    clone(){
        return new DataFrame(this.$rows,this.$columns, this.$index, this.$col_index, true)
    }
    groupby(keys){
        if(!Array.isArray(keys)){
            keys = [keys]
        }
        let results = {}
        for(var key of keys){
            results[key] = {}
            results[key].unique = []
            if (!this.$columns.includes(key)){
                console.error("'"+key+"' not in dataframe!")
            } else {
                for(var val of this[key].unique().values){
                    let map = {}
                    map[key]=val
                    results[key].unique.push(map)
                }
            }
        }
        let pairings = null
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
        let groupbyobj = new GroupByObj([],this)//{groups: [],df: this}
        
        for(var pairing of pairings){
            let filter = this['points'].apply((x)=>true) //all true
            for(var key in pairing){
                filter = filter.and(this[key].eq(pairing[key]),{inplace:true})
            }
            let matches = this.loc({rows:filter})
            if(matches.$index.length>0){
                let group = {}
                if(keys.length==1){
                    group.name = Object.values(pairing)[0]
                } else {
                    group.name = JSON.stringify(pairing)
                }
                group.filter = filter
                group.count = matches.$index.length
                groupbyobj.groups.push(group)
            }
        }
        return groupbyobj
        // console.log(pairings)
    }
    
    static read_csv_async(path){
        return fetch(path, { method: 'get' }).then((resp) => resp.text()).then(text =>{
            let parsed = Papa.parse(text, {
                skipEmptyLines: true
            })
            let columns = parsed.data[0].slice(1)
            // index = parsed.slice(1).map(r => r[0])
            let data = parsed.data.slice(1).map(r => r.slice(1))
            return new DataFrame(data, columns)
        })
    }
}
class GroupByObj{
    constructor(groups, df){
        this.groups = groups
        this.df = df
    }
    agg(aggdict){
        let index = []
        let rows = {}
        let cols = []
        for(var group of this.groups){
            index.push(group.name)
            let row = []
            for(var key in aggdict){
                if (!Array.isArray(aggdict[key])){
                    aggdict[key] = [aggdict[key]]
                }
                for(var metric_func of aggdict[key]){
                    var filtered = this.df.loc({rows:group.filter})
                    var column = filtered[key]
                    var metric = column[metric_func]()
                    //row[key+":"+metric_func]=metric
                    row.push(metric)
                    if(!cols.includes(key+":"+metric_func)){
                        cols.push(key+":"+metric_func)
                    }
                }
            }
            rows[group.name] = row
        }
        return new DataFrame(rows, cols, index)//TODO: string index is a problem
    }
}

//Test Automation
// function timeIt(func,name,log,setup){
//     ITERATIONS = 100
//     data = []
//     if(setup){
//         for(var i=0;i<ITERATIONS;i++){
//             data[i]=setup()
//         }
//     }
//     var startTime = performance.now()
//     for(var i =0;i<ITERATIONS;i++){
//         func(data[i])
//     }
//     var endTime = performance.now()
//     if(log){
//         console.log(func(data[0]))
//     }
//     console.log(`${name} took ${((endTime - startTime)/ITERATIONS).toFixed(4)} milliseconds`)
// }
// function testMine(){
//     timeIt((df) => df.values,               'mydf.values',       false,()=> mydf.clone())
//     timeIt((df) => df['name'].values,       'mydf.series.values',false,()=> mydf.clone())
//     timeIt((df) => df['activations'].mean(),'mydf.series.mean',  true, ()=> mydf.clone())
//     // timeIt(() => mydf['activations'].mean_nocache(),'mydf.series.mean_nocache',true)
//     // timeIt(() => mydf['activations'].mean_nocache_gen(),'mydf.series.mean_nocache_gen',true)
//     timeIt((df) => {
//         filter = df['activations'].eq(3).or(df['activations'].eq(4))
//         df = df.loc({rows:filter})
//         return df['activations'].mean()
        
//     },'mydf.filtered.series.mean',true,()=> mydf.clone())
//     timeIt((df) => {
//         filter = df['activations'].eq(3).or(df['activations'].eq(4),{inplace:true})
//         df.loc({rows:filter,inplace:true})
//         return df['activations'].mean()
        
//     },'mydf.filtered_inplace.series.mean',true,()=> mydf.clone())
// }
// function testDanfo(){
//     timeIt(() => dfgames.values,'danfo.values')
//     timeIt(() => dfgames['name'].values,'danfo.series.values')
//     timeIt(() => dfgames['activations'].mean(),'danfo.series.mean',true)
//     timeIt(() => {
//         filter = dfgames['activations'].eq(3).or(dfgames['activations'].eq(4))
//         df = dfgames.loc({rows:filter})
//         return df['activations'].mean()
//     },'danfo.filtered.series.mean',true)
// }
class Series {
    constructor(data,idx, i_col,skip_dtype_determination){
        this._i_col = i_col
        this._all_values = data
        this._values_cached = null
        this._index = idx
        if(!skip_dtype_determination && this.areNumbers()){
            this.astype(Number)
        }
    }
    get values(){
        if (this._values_cached == null){
            this._values_cached = this._index.map(i => this._all_values[i][this._i_col])
        }
        return this._values_cached
    }
    eq(comp){
        return this.values.map(v=>v==comp)
    }
    sum(){
        return this.values.reduce((a, b) => (a + b))
    }
    mean(){
        return this.values.reduce((a, b) => (a + b)) / this.values.length;
    }
    areNumbers(){
        return this._index.map(i => this._all_values[i][this._i_col]).reduce((a,b) => a && !isNaN(Number(b)), true)
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
        if(params.inplace){
            this._index = this._index.filter((e,i) => params.rows[i])
            this._values_cached = null
        } else {
            copy = this.clone()
            copy.loc({rows:params.rows,inplace:true})
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
        this.columns = columns
        if(col_idx==null){
            this.$col_index = Object.assign({}, ...this.columns.map((e,i) => ({[e]: i})))
        } else {
            this.$col_index = col_idx
        }

        if(idx==null){
            this.index = data.map((e,i) => i)
        } else {
            this.index = idx
        }
        this.$cols = this.columns.map((e,i) => new Series(data,this.index,i,skip_dtype_determination))
        for(var i in this.columns){
            let key = this.columns[i]
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
        let tgt = this
        if(!params.inplace){
            tgt = new DataFrame(this.$rows,this.columns, this.index, this.$col_index, true)
        }
        tgt.index = tgt.index.filter((e,i) => params.rows[i])
        for(var col of tgt.$cols){
            col._set_index(tgt.index)
        }
        tgt.$rows_filtered = null
        return tgt
    }
    get values(){
        if(this._filtered){
            if(this.$rows_filtered==null){
                this.$rows_filtered = this.index.map(i => this.$rows[i])
            }
            return this.$rows_filtered
        } else {
            return this.$rows
        }
    }
    
    static read_csv_async(path){
        return fetch("2021_11_24_ttsarmada_cloud.csv", { method: 'get' }).then((resp) => resp.text()).then(text =>{
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
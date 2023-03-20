<template>
    <div class="grapes-data" v-if="html">
        
        <div class="output-data">
            <input type="radio" value="html" v-model="selected" />
            HTML: {{ htmlSize }}</div>
        <div class="output-data">
            <input type="radio" value="css" v-model="selected" />
            CSS: {{ cssSize }}</div>
        <div class="output-data">
            <input type="radio" value="raw" v-model="selected" />
            Raw Project JSON: {{ projSize }}</div>
        <div class="output-data">
            <input type="radio" value="trim" v-model="selected" />
            Trimmed Project JSON: {{ trimSize }}</div>
        <div class="output-data">
            <input type="radio" value="splittpl" v-model="selected" />
            Split JSON Template: {{ tplSize }}</div>
        <div class="output-data">
            <input type="radio" value="splitlqd" v-model="selected" />
            Split JSON Liquid: {{ lqdSize }}</div>

    </div>
</template>

<script>
    import grapesjs from 'grapesjs'
    
    const grapes = grapesjs.init({headless: true})
    const fields = ['stylable','unstylable','stylable-required','_undoexc']
    function trimData(obj) { 
        if(obj.pages) {
            obj.pages.forEach(page => trimData(page))
            if(obj.styles)
                delete obj.styles
        }
        else if (obj.frames && obj.frames.length) {
            obj.frames.forEach(frame => trimData(frame))
        }
        else {
            fields.forEach( i => { if(i in obj) delete obj[i]; }); 

            if(obj.component) { 
                trimData(obj.component) 
            } else if (obj.components) { 
                obj.components.forEach(o => trimData(o))
            }
        }
    }

    function splitTemplate(input, splitLiquid) {
        splitLiquid = splitLiquid || {count: 0}

        if(input.pages) {
            console.log('Before split', input)
            input.pages.forEach(page => splitTemplate(page, splitLiquid))
            //Split data
            delete splitLiquid.count;
            const output = {
                data: input,
                liquid: splitLiquid
            }
            console.log('Output', output)
            return output
        }
        else if(input.frames) {
            input.frames.forEach(frame => splitTemplate(frame, splitLiquid))
        }
        else if(input.component) {
            splitTemplate(input.component, splitLiquid)
        }
        else if(input.components) {
            input.components.forEach(component => splitTemplate(component, splitLiquid))
        }
        
        if(input.type == "textnode" && input.content && input.content.match(/\{[\{%]/g)) {
            input.type = "liquid"
            const label = "t"+splitLiquid.count
            splitLiquid[label] = input.content;
            splitLiquid.count++;
            input.content = "{{"+label+"}}"
        }
    }

    export default {
        name: 'Grapes',
        data() {
            return {
                selvalue: null
            }
        },
        computed: {
            selected: {
                get(){
                    return this.selvalue
                },
                set(value) {
                    this.selvalue = value
                    this.$emit('update:modelValue', this.view)
                }
            },
            view() {
                switch(this.selected) {
                    case 'html': return this.html;
                    case 'css': return this.css;
                    case 'raw': return this.projData;
                    case 'trim': return this.trimmedData;
                    case 'splittpl': return this.splitData && this.splitData.data ? this.splitData.data : {}
                    case 'splitlqd': return this.splitData && this.splitData.liquid ? this.splitData.liquid : {}
                }
            },
            projData() {
                grapes.setComponents(this.html)
                grapes.setStyle(this.css)
                return grapes.getProjectData()
            },
            projSize() { return this.projData ? JSON.stringify(this.projData).length : 0 },
            trimmedData(){
                const cloned = this.projData ? JSON.parse(JSON.stringify(this.projData)) : {}
                console.log('Before: ', cloned)
                trimData(cloned)
                console.log('After: ', cloned)
                return cloned || {}
            },
            trimSize() { return this.trimmedData ? JSON.stringify(this.trimmedData).length : 0 },
            clonedData() {
                return this.trimmedData ? JSON.parse(JSON.stringify(this.trimmedData)) : {}
            },
            splitData() {
                return splitTemplate(this.clonedData)
            },
            tplSize() { return this.splitData && this.splitData.data ? JSON.stringify(this.splitData.data).length : 0},
            lqdSize() { return this.splitData && this.splitData.data ? JSON.stringify(this.splitData.liquid).length : 0},
            htmlSize(){ return this.html.length },
            cssSize() { return this.css.length },
        },
        props: {
            html: 'string',
            css: 'string',
            modelValue: [String, Object]
        },
        emits: ['update:modelValue']
    }
</script>
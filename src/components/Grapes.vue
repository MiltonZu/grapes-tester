<template>
    <div class="grapes-columns">
        <div class="grapes-info">
            <h1>Size in bytes</h1>
            <subheader>Select any type to see the output</subheader>
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
            <div class="grapes-render" v-if="html || css">
                <h2>Sample data for Render</h2>
                <div class="grapes-sample-data">
                    <button @click="type = 'char'">Random Characters</button>
                    <button @click="type = 'para'">Random Ipsum Paragraph</button>
                    <JsonViewer :value="fakeData" boxed sort></JsonViewer>
                    <button @click="testSpeed">Test Render Types</button>

                    <div class="results" v-if="results && results.length">
                        <div v-for="result in results">
                            {{ result.name }} : {{ result.duration }}ms
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="view" class="grapes-output">
            <h1>Output</h1>
            <div class="grapes-output-box">
                <div class="grapes-output-json" v-if="isJson">
                    <JsonViewer :value="view" :expand-depth="1" copyable boxed sort></JsonViewer>
                </div>
                <div class="grapes-sample-data" v-else>
                    <code>{{ view }}</code>
                </div>
            </div>                
        </div>
    </div>
</template>

<style scoped>
    .grapes-columns {
        display:flex;
        flex-direction: row;
        width:100%;
    }

    .grapes-info {
        max-width:50%;
        min-width:200px;
    }

    .grapes-data, .grapes-output {
        flex-shrink: 1;
    }

    .grapes-output-box, .grapes-data {
        padding:15px;
    }

    .grapes-sample-data {
        padding:20px;
    }

    .grapes-sample-data button {
        padding:5px;
        margin:5px 0;
    }

    .grapes-sample-data button:first-child {
        margin-right:5px;
    }
</style>

<script>
    import grapesjs from 'grapesjs'
    import {faker} from '@faker-js/faker'
    import Mustache from 'mustache'
    import moment from 'moment'
    
    const grapes = grapesjs.init({headless: true})
    const renderer = grapesjs.init({headless: true})
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
            input.pages.forEach(page => splitTemplate(page, splitLiquid))
            //Split data
            delete splitLiquid.count;
            const output = {
                tpl: input,
                liquid: splitLiquid
            }
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

    function timeExecution(name, input, func) {
        const start = moment()
        func(input);
        const end = moment()
        const diff = end.diff(start, 'miliseconds', true)
        return {name, duration: diff}
    }

    function mustacheRender({template, data}) {
        Mustache.render(template, data);
    }

    function processRecurse(component, data) {
        if(component.type == "liquid" ) {
            component.type = "text"
            component.content = component.content in data ? data[component.content] : component.content;
        }

        if(component.components) {
            component.components.forEach(comp => processRecurse(comp, data))
        }
    }

    function processData({template, data}) {
        if(template.pages) {
            template.pages.forEach(page => page.frames.forEach(frame => processRecurse(frame, data)))
        }
    }

    function grapesRender(input) {
        processData(input)
        renderer.loadProjectData(input.template)
        renderer.getHtml();
    }

    function cloneObject(input) {
        return input !== null ? JSON.parse(JSON.stringify(input)) : null;
    }

    function regexRender(input) {
        const keys = Object.keys(input.data)
        keys.forEach(key => input.template.replace(key, input.data[key]) )
    }

    export default {
        name: 'Grapes',
        
        data() {
            return {
                selvalue: null,
                isJson: false,
                type: 'char',
                results: []
            }
        },
        methods: {
            testSpeed() {
                const htmlParams = {template: ""+this.html, data: this.fakeData}

                this.results = [
                    timeExecution('Regex', htmlParams, regexRender),
                    timeExecution('Mustache', htmlParams, mustacheRender),
                    timeExecution('Grapes', {template: cloneObject(this.splitData.tpl), data: this.fakeData}, grapesRender),
                ]
            }
        },
        computed: {
            selected: {
                get(){
                    return this.selvalue
                },
                set(value) {
                    this.selvalue = value
                }
            },
            view() {
                if(!this.html) return null;
                switch(this.selected) {
                    case 'html': this.isJson = false; return this.html;
                    case 'css': this.isJson = false; return this.css;
                    case 'raw': this.isJson = true; return this.projData;
                    case 'trim': this.isJson = true; return this.trimmedData;
                    case 'splittpl': this.isJson = true; return this.splitData && this.splitData.tpl ? this.splitData.tpl : {}
                    case 'splitlqd': this.isJson = true; return this.splitData && this.splitData.liquid ? this.splitData.liquid : {}
                    default: return null;
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
                trimData(cloned)
                return cloned || {}
            },
            trimSize() { return this.trimmedData ? JSON.stringify(this.trimmedData).length : 0 },
            clonedData() {
                return this.trimmedData ? JSON.parse(JSON.stringify(this.trimmedData)) : {}
            },
            splitData() {
                return splitTemplate(this.clonedData)
            },
            fakeData() {
                const faked = {};
                const randomSize = Math.random()*1000%100+10
                if (this.splitData) 
                    Object.keys(this.splitData.liquid).forEach(key=>faked[key] = this.type == 'char' ? faker.datatype.string(randomSize) : faker.lorem.paragraph(5) )
                return faked
            },
            tplSize() { return this.splitData && this.splitData.tpl ? JSON.stringify(this.splitData.tpl).length : 0},
            lqdSize() { return this.splitData && this.splitData.liquid ? JSON.stringify(this.splitData.liquid).length : 0},
            htmlSize(){ return this.html.length },
            cssSize() { return this.css.length },
        },
        props: {
            html: 'string',
            css: 'string',
        }
    }
</script>
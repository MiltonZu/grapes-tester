<template>
    <div class="split">
        <div class="input-box">
            <h1>Input</h1>
            <h2>Source HTML:</h2>
            <textarea v-model.lazy="htmlSource"></textarea>
            <h2>Source CSS:</h2>
            <textarea v-model.lazy="cssSource"></textarea>
        </div>
        <div class="selection-box">
            <h1>Size in bytes</h1>
            <Grapes :html="htmlSource" :css="cssSource" v-model="output" />
        </div>
        <div class="output-box" v-if="output">
            <h1>Output</h1>
            <div v-if="isString">
                {{ output }}
            </div>
            <div v-if="isJson">
                <JsonViewer :value="output" :expand-depth="1" copyable boxed sort></JsonViewer>
            </div>
            
        </div>
    </div>
</template>

<script>
    import Grapes from './Grapes.vue'
    import JsonViewer from 'vue-json-viewer'
    export default {
        components: {
            Grapes,
            JsonViewer
        },
        data() {
            return {
                htmlSource: '',
                cssSource: '',
                output: null,
            }
        },
        computed: {
            isJson() { return this.output && typeof(this.output) == "object" },
            isString() { return this.output && typeof(this.output) == "string"  } 
        }

    }
</script>

<style>
    textarea { min-width:400px; min-height:250px; }
    .split {
        width:100%;
        display:flex;
        flex-direction: row;
        flex-flow: row;
        flex-wrap: nowrap;
        align-content:stretch
    }
    .selection-box { flex-shrink:1; flex-basis:max-content; padding: 0 10px; }
    .input-box { flex-shrink:1; flex-basis:max-content; }
    .output-box { flex-grow:2; flex-basis:max-content; }

    .split > div {
        overflow-y:auto;
        max-height:100%;
    }
</style>
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
            <Grapes :html="htmlSource" :css="cssSource" />
        </div>
    </div>
</template>

<script>
    import Grapes from './Grapes.vue'
    export default {
        components: {
            Grapes,
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
            isString() { return this.output && typeof(this.output) == "string" && this.output.length  } 
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
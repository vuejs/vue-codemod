<!-- ported from https://github.com/surmon-china/vue-codemirror -->

<template>
<div class="vue-codemirror">
  <textarea ref="textarea"></textarea>
</div>
</template>

<script>
import { markRaw } from 'vue'
export default {
  data() {
    return {
      content: '',
      cm: null
    }
  },
  props: {
    code: String,
    value: String,
    marker: Function,
    height: {
      type: [Number, String],
      default: '100%'
    },
    options: {
      type: Object,
      default: () => ({})
    },
    events: {
      type: Array,
      default: () => ([])
    }
  },
  watch: {
    options: {
      deep: true,
      handler(options) {
        for (const key in options) {
          this.cm.setOption(key, options[key])
        }
      }
    },
    code(newVal) {
      this.handerCodeChange(newVal)
    },
    value(newVal) {
      this.handerCodeChange(newVal)
    },
    height(v) {
      this.cm.setSize(null, v)
    }
  },
  methods: {
    initialize() {
      this.cm = markRaw(CodeMirror.fromTextArea(this.$refs.textarea, this.options))
      this.cm.setSize(null, this.height)
      this.cm.setValue(this.code || this.value || this.content)
      this.cm.on('change', cm => {
        this.content = cm.getValue()
        if (this.$emit) {
          this.$emit('input', this.content)
          this.$emit('update:code', this.content)
        }
      })
      const allEvents = [
        'scroll',
        'changes',
        'beforeChange',
        'cursorActivity',
        'keyHandled',
        'inputRead',
        'electricInput',
        'beforeSelectionChange',
        'viewportChange',
        'swapDoc',
        'gutterClick',
        'gutterContextMenu',
        'focus',
        'blur',
        'refresh',
        'optionChange',
        'scrollCursorIntoView',
        'update'
      ]
      .forEach(event => {
        this.cm.on(event, (...args) => {
          this.$emit(event, ...args)
          const lowerCaseEvent = event.replace(/([A-Z])/g, '-$1').toLowerCase()
          if (lowerCaseEvent !== event) {
            this.$emit(lowerCaseEvent, ...args)
          }
        })
      })
      this.$emit('ready', this.cm)
      this.refresh()
    },
    refresh() {
      this.$nextTick(() => {
        this.cm.refresh()
      })
    },
    destroy() {
      const element = this.cm.doc.cm.getWrapperElement()
      element && element.remove && element.remove()
    },
    handerCodeChange(newVal) {
      const cm_value = this.cm.getValue()
      if (newVal !== cm_value) {
        const scrollInfo = this.cm.getScrollInfo()
        this.cm.setValue(newVal)
        this.content = newVal
        this.cm.scrollTo(scrollInfo.left, scrollInfo.top)
      }
    }
  },
  mounted() {
    this.initialize()
  },
  unmounted() {
    this.destroy()
  }
}
</script>

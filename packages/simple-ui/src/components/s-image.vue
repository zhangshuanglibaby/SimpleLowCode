<script lang="ts">
import { defineComponent } from 'vue-demi'
// defineProps<{
//   src: string
// }>()

export default defineComponent({
  props: {
    src: {
      type: String
    }
  },
  data () {
    return {
      value: 1111
    }
  },
  mounted () {
    console.log(this.value)
  }
})
</script>

<template>
  <img :src="src" class="s-image" />
</template>

<style scoped>
.s-image {
  width: 200px;
  height: 300px;
  margin: 0 auto;
}
</style>

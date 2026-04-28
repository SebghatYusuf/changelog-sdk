<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ChangelogManager } from 'changelog-sdk/vue'

const route = useRoute()

const props = defineProps({
  basePath: { type: String, default: '/changelog' },
})

const params = computed(() => {
  const raw = route.params.route
  if (Array.isArray(raw)) return { route: raw }
  if (typeof raw === 'string') return { route: [raw] }
  return { route: [] }
})

const searchParams = computed(() => {
  const resolved = {}
  for (const [key, value] of Object.entries(route.query)) {
    if (Array.isArray(value)) {
      resolved[key] = value.join(',')
    } else if (typeof value === 'string') {
      resolved[key] = value
    }
  }
  return resolved
})
</script>

<template>
  <ChangelogManager :params="params" :search-params="searchParams" :base-path="basePath" />
</template>

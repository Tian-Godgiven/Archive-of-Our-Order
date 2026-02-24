<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div
        v-if="visible"
        :class="[
          'fixed inset-0 z-50 flex items-center justify-center',
          dark
            ? 'bg-black/90 backdrop-blur-sm'
            : 'bg-black/40 backdrop-blur-md'
        ]"
        @click="emit('close')"
      >
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean;
  dark?: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();
</script>

<style scoped>
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.2s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
</style>

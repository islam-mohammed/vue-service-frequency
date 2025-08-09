<script setup lang="ts">
import { ref } from 'vue';
import ServiceFrequency from './components/ServiceFrequency.vue';

const scheduleConfig = ref<string>();

const configs = {
  fortnightly: '{"frequency":"Fortnightly"}',
  custom: '{"frequency":"Custom","days":["monday","wednesday"],"timeWindows":"09:00-12:00"}',
  customWithExactTime: '{"frequency":"Custom","days":["friday"],"exactTime":"14:30"}',
  weekly: '{"frequency":"Weekly"}'
};
</script>

<template>
  <div class="p-8 bg-gray-50 min-h-screen">
    <header class="mb-10 text-center">
      <h1 class="text-4xl font-extrabold text-gray-800">Service Frequency Configuration</h1>
      <p class="text-gray-600 mt-2">A component for setting recurring service schedules.</p>
    </header>

    <div class="max-w-2xl mx-auto">
      <div class="mb-8 p-4 border rounded-lg bg-white shadow-sm">
        <h2 class="text-xl font-semibold mb-3 text-gray-700">Test Presets</h2>
        <p class="text-sm text-gray-500 mb-4">Click a button to load a pre-defined configuration into the component.</p>
        <div class="flex flex-wrap gap-3">
          <button @click="scheduleConfig = undefined" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">Default (undefined)</button>
          <button @click="scheduleConfig = configs.fortnightly" class="px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors">Fortnightly</button>
          <button @click="scheduleConfig = configs.custom" class="px-4 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors">Custom (Mon/Wed, Time Window)</button>
          <button @click="scheduleConfig = configs.customWithExactTime" class="px-4 py-2 bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 transition-colors">Custom (Fri, Exact Time)</button>
          <button @click="scheduleConfig = configs.weekly" class="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors">Weekly</button>
        </div>
      </div>

      <ServiceFrequency :schedule-config="scheduleConfig" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-vue-next';
import { useServiceFrequency } from '@/composables/useServiceFrequency';

const props = defineProps({
  scheduleConfig: {
    type: String,
    required: false,
  },
});

const {
  frequency,
  customDays,
  specifyTimeWindows,
  timeWindows,
  timeWindowError,
  setExactTime,
  exactTime,
  exactTimeError,
  frequencyOptions,
  scheduleOutput,
  addTimeRange,
  removeTimeRange,
} = useServiceFrequency(toRef(props, 'scheduleConfig'));
</script>

<template>
  <div class="space-y-8">
    <Card>
      <CardHeader>
        <CardTitle>Service Frequency</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup v-model="frequency" class="grid gap-2">
          <div v-for="option in frequencyOptions" :key="option.value" class="flex items-center space-x-2">
            <RadioGroupItem :id="option.value" :value="option.value" />
            <Label :for="option.value">{{ option.label }}</Label>
          </div>
        </RadioGroup>

        <!-- Custom Frequency Section -->
        <div v-if="frequency === 'Custom'" class="grid gap-4 mt-4 pt-4 border-t">
          <h3 class="font-semibold">Custom Schedule</h3>

          <!-- Day Checkboxes -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div v-for="(value, day) in customDays" :key="day" class="flex items-center space-x-2">
              <Checkbox :id="day" v-model="customDays[day as keyof typeof customDays]" />
              <Label :for="day" class="capitalize">{{ day }}</Label>
            </div>
          </div>

          <!-- Time Window -->
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Checkbox id="specifyTimeWindows" v-model="specifyTimeWindows" />
              <Label for="specifyTimeWindows">Specify time window(s)</Label>
            </div>
            <div v-if="specifyTimeWindows" class="space-y-4">
              <div v-for="(range, index) in timeWindows" :key="index" class="space-y-1">
                <div class="flex items-center gap-2">
                  <Input v-model="range.start" type="time" placeholder="HH:mm" :class="{ 'border-red-500': timeWindowError[index] }" />
                  <span>-</span>
                  <Input v-model="range.end" type="time" placeholder="HH:mm" :class="{ 'border-red-500': timeWindowError[index] }" />
                  <Button variant="ghost" size="icon" @click="removeTimeRange(index)">
                    <X class="h-4 w-4" />
                  </Button>
                </div>
                <p v-if="timeWindowError[index]" class="text-red-500 text-sm">{{ timeWindowError[index] }}</p>
              </div>
              <Button variant="outline" @click="addTimeRange">Add time range</Button>
            </div>
          </div>

          <!-- Exact Time -->
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Checkbox id="setExactTime" v-model="setExactTime" />
              <Label for="setExactTime">Set exact time</Label>
            </div>
            <div v-if="setExactTime">
              <Input
                v-model="exactTime"
                type="time"
                placeholder="e.g. 13:30"
                :class="{ 'border-red-500': exactTimeError }"
              />
              <p v-if="exactTimeError" class="text-red-500 text-sm mt-1">{{ exactTimeError }}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <div class="mt-8">
      <h3 class="text-lg font-semibold">Generated JSON Output</h3>
      <pre class="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-sm">{{ scheduleOutput }}</pre>
    </div>
  </div>
</template>

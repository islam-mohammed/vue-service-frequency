<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

interface CustomDays {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

const props = defineProps({
  scheduleConfig: {
    type: String,
    required: false,
  },
});

const frequency = ref('Fortnightly');

const customDays = ref<CustomDays>({
  monday: false,
  tuesday: false,
  wednesday: false,
  thursday: false,
  friday: false,
  saturday: false,
  sunday: false,
});
const specifyTimeWindows = ref(false);
const timeWindows = ref('');
const timeWindowError = ref('');
const setExactTime = ref(false);
const exactTime = ref('');
const exactTimeError = ref('');

const frequencyOptions = [
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Fortnightly', label: 'Fortnightly' },
  { value: 'Every 4 weeks', label: 'Every 4 weeks' },
  { value: 'None', label: 'None' },
  { value: 'Custom', label: 'Custom' },
];

const scheduleOutput = computed(() => {
  const output: {
    frequency: string;
    days?: string[];
    timeWindows?: string;
    exactTime?: string;
  } = {
    frequency: frequency.value,
  };

  if (frequency.value === 'Custom') {
    output.days = Object.entries(customDays.value)
      .filter(([, selected]) => selected)
      .map(([day]) => day);

    if (timeWindows.value) {
      output.timeWindows = timeWindows.value;
    }

    if (exactTime.value) {
      output.exactTime = exactTime.value;
    }
  }

  return JSON.stringify(output, null, 2);
});

function updateStateFromConfig(configString: string | undefined) {
  if (!configString) {
    frequency.value = 'Fortnightly';
    Object.keys(customDays.value).forEach(day => {
      customDays.value[day as keyof CustomDays] = false;
    });
    specifyTimeWindows.value = false;
    timeWindows.value = '';
    setExactTime.value = false;
    exactTime.value = '';
    return;
  }

  try {
    const config = JSON.parse(configString);
    frequency.value = config.frequency || 'Fortnightly';

    if (config.frequency === 'Custom') {
      const days = config.days || [];
      Object.keys(customDays.value).forEach(day => {
        customDays.value[day as keyof CustomDays] = days.includes(day);
      });

      if (config.timeWindows) {
        specifyTimeWindows.value = true;
        timeWindows.value = config.timeWindows;
      } else {
        specifyTimeWindows.value = false;
        timeWindows.value = '';
      }

      if (config.exactTime) {
        setExactTime.value = true;
        exactTime.value = config.exactTime;
      } else {
        setExactTime.value = false;
        exactTime.value = '';
      }
    }
  } catch (error) {
    console.error("Failed to parse scheduleConfig prop:", error);
    frequency.value = 'Fortnightly';
  }
}

onMounted(() => {
  updateStateFromConfig(props.scheduleConfig);
});

watch(() => props.scheduleConfig, (newConfig) => {
  updateStateFromConfig(newConfig);
});

watch(specifyTimeWindows, (newValue) => {
  if (!newValue) {
    timeWindows.value = '';
    timeWindowError.value = '';
  }
});

watch(setExactTime, (newValue) => {
  if (!newValue) {
    exactTime.value = '';
    exactTimeError.value = '';
  }
});

watch(timeWindows, (newValue) => {
  timeWindowError.value = '';
  if (!newValue) return;

  const ranges = newValue.split(',').map(r => r.trim());
  const timeRangeRegex = /^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$/;

  for (const range of ranges) {
    if (!range) continue;
    const match = range.match(timeRangeRegex);
    if (!match) {
      timeWindowError.value = 'Invalid format. Use HH:mm-HH:mm, separated by commas.';
      return;
    }

    const [, startH, startM, endH, endM] = match;
    const startTime = parseInt(startH, 10) * 60 + parseInt(startM, 10);
    const endTime = parseInt(endH, 10) * 60 + parseInt(endM, 10);

    if (startTime >= endTime) {
      timeWindowError.value = `End time must be after start time for range "${range}".`;
      return;
    }
  }
});

watch(exactTime, (newValue) => {
  exactTimeError.value = '';
  if (!newValue) return;

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(newValue)) {
    exactTimeError.value = 'Invalid format. Use HH:mm.';
  }
});
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
              <Checkbox :id="day" v-model="customDays[day as keyof CustomDays]" />
              <Label :for="day" class="capitalize">{{ day }}</Label>
            </div>
          </div>

          <!-- Time Window -->
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Checkbox id="specifyTimeWindows" v-model="specifyTimeWindows" />
              <Label for="specifyTimeWindows">Specify time window(s)</Label>
            </div>
            <div v-if="specifyTimeWindows">
              <Input
                v-model="timeWindows"
                placeholder="e.g. 06:30-07:30, 15:00-17:00"
                :class="{ 'border-red-500': timeWindowError }"
              />
              <p v-if="timeWindowError" class="text-red-500 text-sm mt-1">{{ timeWindowError }}</p>
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

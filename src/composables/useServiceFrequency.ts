import { ref, watch, onMounted, computed, unref } from 'vue';
import type { MaybeRef } from 'vue';

interface CustomDays {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export function useServiceFrequency(scheduleConfig: MaybeRef<string | undefined>) {
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
  const timeWindows = ref<{ start: string, end: string }[]>([]);
  const timeWindowError = ref<string[]>([]);
  const setExactTime = ref(false);
  const exactTime = ref('');
  const exactTimeError = ref('');
  const customDayError = ref('');

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

      if (timeWindows.value.length > 0) {
        output.timeWindows = timeWindows.value
          .map(range => `${range.start}-${range.end}`)
          .join(',');
      }

      if (exactTime.value) {
        output.exactTime = exactTime.value;
      }
    }

    return JSON.stringify(output, null, 2);
  });

  function addTimeRange() {
    timeWindows.value.push({ start: '', end: '' });
  }

  function removeTimeRange(index: number) {
    timeWindows.value.splice(index, 1);
    timeWindowError.value.splice(index, 1);
  }

  function updateStateFromConfig(configString: string | undefined) {
    if (!configString) {
      frequency.value = 'Fortnightly';
      Object.keys(customDays.value).forEach(day => {
        customDays.value[day as keyof CustomDays] = false;
      });
      specifyTimeWindows.value = false;
      timeWindows.value = [];
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
          timeWindows.value = config.timeWindows.split(',').map((rangeStr: string) => {
            const [start, end] = rangeStr.trim().split('-');
            return { start: start || '', end: end || '' };
          });
        } else {
          specifyTimeWindows.value = false;
          timeWindows.value = [];
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
    updateStateFromConfig(unref(scheduleConfig));
  });

  watch(() => unref(scheduleConfig), (newConfig) => {
    updateStateFromConfig(newConfig);
  });

  watch(specifyTimeWindows, (newValue) => {
    if (newValue) {
      setExactTime.value = false;
    }
    if (!newValue) {
      timeWindows.value = [];
      timeWindowError.value = [];
    }
  });

  watch(setExactTime, (newValue) => {
    if (newValue) {
      specifyTimeWindows.value = false;
    }
    if (!newValue) {
      exactTime.value = '';
      exactTimeError.value = '';
    }
  });

  watch(timeWindows, (newValue) => {
    const newErrors: string[] = [];
    if (!newValue) {
      timeWindowError.value = newErrors;
      return;
    }

    newValue.forEach((range, index) => {
      newErrors[index] = ''; // Default to no error
      if (!range.start || !range.end) return;

      const startTime = parseInt(range.start.split(':')[0], 10) * 60 + parseInt(range.start.split(':')[1], 10);
      const endTime = parseInt(range.end.split(':')[0], 10) * 60 + parseInt(range.end.split(':')[1], 10);

      if (startTime >= endTime) {
        newErrors[index] = 'End time must be after start time.';
        return;
      }
    });
    timeWindowError.value = newErrors;
  }, { deep: true });

  watch([frequency, customDays], () => {
    if (frequency.value === 'Custom') {
      const isAnyDaySelected = Object.values(customDays.value).some(day => day);
      customDayError.value = isAnyDaySelected ? '' : 'Please select at least one day for a custom schedule.';
    } else {
      customDayError.value = '';
    }
  }, { deep: true });

  return {
    frequency,
    customDayError,
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
  };
}

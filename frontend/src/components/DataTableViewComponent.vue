<template>
  <Card class="shadow-md">
    <template #content>
      <div v-if="internalLoading && rows.length === 0" class="text-center py-8">
        <ProgressBar mode="indeterminate" class="mb-4" />
        <p class="text-gray-600">Загрузка данных...</p>
      </div>

      <div v-else>
        <div v-if="rows.length === 0" class="text-center py-8">
          <i class="pi pi-info-circle text-4xl text-gray-400 mb-4"></i>
          <p class="text-gray-600">
            {{ searchQuery ? 'По вашему запросу ничего не найдено' : 'Нет данных для отображения' }}
          </p>
        </div>

        <div v-else class="overflow-x-auto">
          <DataTable
            :value="rows"
            :paginator="false"
            :scrollable="true"
            scroll-height="600px"
            class="p-datatable-sm"
            striped-rows
            show-gridlines
            removable-sort
            responsive-layout="scroll"
          >
            <Column
              v-for="header in headers"
              :key="header"
              :field="header"
              :header="header"
              :sortable="true"
              class="min-w-[150px]"
            >
              <template #body="{ data }">
                <div class="p-2 truncate max-w-[300px]" :title="data[header]">
                  {{ data[header] }}
                </div>
              </template>
            </Column>
          </DataTable>

          <div v-if="pagination" class="mt-4 flex justify-between items-center">
            <span class="text-sm text-gray-600">
              Показано {{ ((pagination.page - 1) * pagination.pageSize) + 1 }} - 
              {{ Math.min(pagination.page * pagination.pageSize, pagination.total) }} 
              из {{ pagination.total.toLocaleString() }}
            </span>
            <Paginator
              :first="(pagination.page - 1) * pagination.pageSize"
              :rows="pagination.pageSize"
              :total-records="pagination.total"
              @page="onPageChange"
              template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            />
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { csvService } from '../services/api';

const props = defineProps({
  fileId: {
    type: String,
    required: true
  },
  headers: {
    type: Array,
    required: true
  },
  searchQuery: {
    type: String,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['loading-change']);

const rows = ref([]);
const pagination = ref(null);
const currentPage = ref(1);
const pageSize = ref(50);
const internalLoading = ref(false);

const loadData = async (page = 1) => {
  if (!props.fileId) return;

  internalLoading.value = true;
  emit('loading-change', true);

  try {
    const response = await csvService.getRows(
      props.fileId,
      page,
      pageSize.value,
      props.searchQuery
    );

    rows.value = response.rows;
    pagination.value = response.pagination;
    currentPage.value = page;
  } catch (error) {
    console.error('Error loading data:', error);
    rows.value = [];
    pagination.value = null;
  } finally {
    internalLoading.value = false;
    emit('loading-change', false);
  }
};

const onPageChange = (event) => {
  const newPage = Math.floor(event.first / event.rows) + 1;
  loadData(newPage);
};

watch(() => props.searchQuery, () => {
  currentPage.value = 1;
  loadData();
}, { immediate: false });

watch(() => props.fileId, () => {
  if (props.fileId) {
    loadData();
  }
}, { immediate: true });

onMounted(() => {
  if (props.fileId) {
    loadData();
  }
});
</script>

<style scoped>
:deep(.p-datatable .p-datatable-thead > tr > th) {
  position: sticky;
  top: 0;
  z-index: 1;
  background: white;
}

:deep(.p-datatable-tbody > tr > td) {
  padding: 0.5rem;
}
</style>


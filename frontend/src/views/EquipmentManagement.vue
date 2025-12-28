<template>
  <div class="equipment-management">
    <van-nav-bar title="设备管理" left-text="返回" @click-left="goBack">
      <template #title>
        <div style="display: flex; align-items: center;">
          <van-icon name="setting-o" style="margin-right: 8px;" />
          设备管理
        </div>
      </template>
    </van-nav-bar>
    
    <div class="page-header">
      <h1>设备管理</h1>
      <van-button type="primary" @click="openAddDialog">新增设备</van-button>
    </div>

    <!-- 设备列表 -->
    <div class="equipment-list">
      <!-- 设备分类筛选 -->
      <div class="filter-section">
        <van-dropdown-menu>
          <van-dropdown-item 
            v-model="categoryFilter" 
            :options="equipmentCategories" 
            placeholder="选择设备分类"
            @change="onCategoryFilterChange"
          />
        </van-dropdown-menu>
      </div>
      
      <van-search
        v-model="searchQuery"
        placeholder="搜索设施设备名称或型号"
        @search="onSearch"
        @input="onSearch"
        style="margin-bottom: 16px;"
      />

      <van-cell-group>
        <van-cell
          v-for="equipment in filteredEquipment"
          :key="equipment.id"
          :title="equipment.name"
          :label="`分类: ${equipment.category} | 型号: ${equipment.model} | 位置: ${equipment.location} | 状态: ${equipment.status === 'normal' ? '正常' : equipment.status === 'faulty' ? '故障' : '维护中'}`"
          is-link
          @click="showEditDialog(equipment)"
        >
          <template #right-icon>
            <van-button type="danger" size="small" icon="delete-o" @click.stop="confirmDelete(equipment.id)">
              删除
            </van-button>
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <!-- 新增/编辑设备对话框 -->
    <van-dialog
      v-model="dialogVisible"
      :title="currentEquipment.id ? '编辑设备' : '新增设备'"
      @confirm="handleConfirm"
      @cancel="resetForm"
    >
      <div class="dialog-content">
        <div class="form-item">
          <label>设施设备名称</label>
          <input v-model="currentEquipment.name" placeholder="请输入设施设备名称" />
        </div>
        <div class="form-item">
          <label>设备型号</label>
          <input v-model="currentEquipment.model" placeholder="请输入设备型号" />
        </div>
        <div class="form-item">
          <label>设备位置</label>
          <input v-model="currentEquipment.location" placeholder="请输入设备位置" />
        </div>
        <div class="form-item">
          <label>设备分类</label>
          <select v-model="currentEquipment.category">
            <option v-for="category in equipmentCategories" :key="category.value" :value="category.value">{{ category.text }}</option>
          </select>
        </div>
        <div class="form-item">
          <label>设备状态</label>
          <select v-model="currentEquipment.status">
            <option value="normal">正常</option>
            <option value="faulty">故障</option>
            <option value="maintenance">维护中</option>
          </select>
        </div>
      </div>
    </van-dialog>

    <!-- 删除确认对话框 -->
    <van-dialog
      v-model="showDeleteDialog"
      title="确认删除"
      @confirm="handleDelete"
      @cancel="showDeleteDialog = false"
    >
      <p>确定要删除该设备吗？</p>
    </van-dialog>
  </div>
</template>

<script>
import { getEquipmentList, createEquipment, updateEquipment, deleteEquipment } from '../api/equipment'
import { Dialog, Toast, Icon } from 'vant'

export default {
  name: 'EquipmentManagement',
  components: {
    Icon
  },
  data() {
    return {
      equipmentList: [],
      searchQuery: '',
      categoryFilter: '',
      dialogVisible: false,
      showDeleteDialog: false,
      currentEquipment: {
        id: null,
        name: '',
        model: '',
        location: '',
        category: '其他',
        status: 'normal'
      },
      deleteId: null,
      equipmentCategories: [
        { text: '全部分类', value: '' },
        { text: '股道龙门吊', value: '股道龙门吊' },
        { text: '堆场龙门吊', value: '堆场龙门吊' },
        { text: '堆高机', value: '堆高机' },
        { text: '正面吊', value: '正面吊' },
        { text: '集卡', value: '集卡' },
        { text: '车辆', value: '车辆' },
        { text: '远控室设备', value: '远控室设备' },
        { text: '其他', value: '其他' }
      ]
    }
  },
  computed: {
    filteredEquipment() {
      let filtered = this.equipmentList
      
      // 按设备分类筛选
      if (this.categoryFilter) {
        filtered = filtered.filter(item => item.category === this.categoryFilter)
      }
      
      // 按搜索关键词筛选
      if (this.searchQuery) {
        filtered = filtered.filter(item => 
          item.name.includes(this.searchQuery) || 
          item.model.includes(this.searchQuery)
        )
      }
      
      return filtered
    }
  },
  mounted() {
    this.loadEquipmentList()
  },
  methods: {
    async loadEquipmentList() {
      try {
        const response = await getEquipmentList()
        this.equipmentList = response.data
        console.log('设备列表加载成功:', this.equipmentList)
      } catch (error) {
        console.error('加载设备列表失败:', error)
        if (error.response) {
          console.error('错误状态码:', error.response.status)
          console.error('错误响应:', error.response.data)
        } else if (error.request) {
          console.error('请求已发送但未收到响应:', error.request)
        } else {
          console.error('请求配置错误:', error.message)
        }
        Toast.fail('加载设备列表失败')
      }
    },
    onSearch() {
      // 搜索已在computed中处理
    },
    onCategoryFilterChange() {
      // 分类筛选已在computed中处理
    },
    openAddDialog() {
      this.currentEquipment = {
        id: null,
        name: '',
        model: '',
        location: '',
        category: '其他',
        status: 'normal'
      }
      this.dialogVisible = true
    },
    showEditDialog(equipment) {
      this.currentEquipment = { ...equipment }
      this.dialogVisible = true
    },
    confirmDelete(id) {
      this.deleteId = id
      this.showDeleteDialog = true
    },
    resetForm() {
      this.currentEquipment = {
        id: null,
        name: '',
        model: '',
        location: '',
        category: '其他',
        status: 'normal'
      }
      this.dialogVisible = false
      this.showDeleteDialog = false
      this.deleteId = null
    },
    async handleConfirm() {
      try {
        if (!this.currentEquipment.name || !this.currentEquipment.model || !this.currentEquipment.location) {
          Toast.fail('请填写完整信息')
          return
        }

        if (this.currentEquipment.id) {
          // 编辑设备
          await updateEquipment(this.currentEquipment.id, this.currentEquipment)
          Toast.success('设备更新成功')
        } else {
          // 新增设备
          await createEquipment(this.currentEquipment)
          Toast.success('设备新增成功')
        }

        this.loadEquipmentList()
        this.resetForm()
      } catch (error) {
        console.error('操作失败:', error)
        Toast.fail('操作失败，请重试')
      }
    },
    async handleDelete() {
      try {
        await deleteEquipment(this.deleteId)
        Toast.success('设备删除成功')
        this.loadEquipmentList()
        this.resetForm()
      } catch (error) {
        console.error('删除失败:', error)
        Toast.fail('删除失败，请重试')
      }
    },
    goBack() {
      if (window.history.length > 1) {
        this.$router.back()
      } else {
        this.$router.push('/home')
      }
    }
  }
}
</script>

<style scoped>
.equipment-management {
  padding: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  margin: 0;
  color: #333;
}

.equipment-list {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.filter-section {
  margin-bottom: 16px;
}
</style>
<template>
  <div class="repair-request-container">
    <van-nav-bar title="设备报修" @click-left="goBack">
      <template #left>
        <van-button type="default" size="small" text>返回</van-button>
      </template>
    </van-nav-bar>
    
    <van-form @submit="onSubmit">
      <van-field
        v-model="form.equipment_name"
        name="equipment_id"
        placeholder="请选择设备"
        label="设施设备名称"
        required
        readonly
        clickable
        @click="showEquipmentPicker = true"
        :rules="[{ required: true, message: '请选择设备' }]"
      />
      
      <!-- 设备分类选择器 -->
      <van-field
        v-model="selectedCategory"
        name="category"
        label="设备分类"
        readonly
        clickable
        @click="showCategoryPicker = true"
      >
        <template #input>
          <van-tag type="primary" v-if="selectedCategory">{{ selectedCategory }}</van-tag>
          <span v-else style="color: #969799;">请选择设备分类</span>
        </template>
      </van-field>
      
      <!-- 设备分类选择器弹窗 -->
      <van-popup
        v-model="showCategoryPicker"
        position="bottom"
        round
      >
        <div class="picker-container">
          <div class="picker-header">
            <van-button type="default" size="small" @click="showCategoryPicker = false">取消</van-button>
            <span class="picker-title">请选择设备分类</span>
            <van-button type="primary" size="small" @click="confirmCategorySelection">确定</van-button>
          </div>
          <van-picker
            ref="categoryPicker"
            :columns="equipmentCategoryOptions"
            @change="onCategoryChange"
          />
        </div>
      </van-popup>
      
      <!-- 设备选择器 -->
      <van-popup
        v-model="showEquipmentPicker"
        position="bottom"
        round
        :style="{ height: '80%' }"
      >
        <div class="picker-header">
          <div class="picker-title">选择设备</div>
          <van-button @click="showEquipmentPicker = false" type="default" size="small">关闭</van-button>
        </div>
        
        <!-- 设备分类筛选 -->
        <div class="category-filter">
          <van-field
            v-model="selectedCategory"
            :placeholder="`当前分类：${selectedCategory || '全部'}`"
            readonly
            clickable
            @click="showCategoryPicker = true"
          >
            <template #button>
              <van-button size="mini" type="default" @click="clearCategoryFilter" v-if="selectedCategory">清除</van-button>
            </template>
          </van-field>
        </div>
        
        <van-cell-group>
          <van-cell
            v-for="(equipment, index) in filteredEquipmentList"
            :key="equipment.id"
            :title="equipment.name"
            :value="`${equipment.model} - ${equipment.location}`"
            @click="selectEquipment(equipment, index)"
            :clickable="true"
          />
        </van-cell-group>
      </van-popup>
      <van-field
        v-model="form.fault_description"
        name="fault_description"
        type="textarea"
        placeholder="请描述故障情况"
        label="故障描述"
        rows="4"
        required
        :rules="[{ required: true, message: '请描述故障情况' }]"
      />
      
      <div class="upload-section">
        <van-uploader
          v-model="fileList"
          :max-count="5"
          :after-read="onRead"
          @delete="onDelete"
          multiple
        />
      </div>
      
      <div style="margin: 24px;">
        <van-button type="primary" block native-type="submit" :loading="loading">
          提交报修
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script>
import { createRepairRequest } from '../api/repair'
import { getEquipmentList } from '../api/equipment'
import { Toast } from 'vant'

export default {
  name: 'RepairRequest',
  data() {
    return {
      form: {
        equipment_id: '',
        equipment_name: '',
        fault_description: ''
      },
      fileList: [],
      files: [],
      loading: false,
      // 设备选择相关
      showEquipmentPicker: false,
      showCategoryPicker: false,
      selectedEquipmentIndex: 0,
      selectedCategory: '',
      equipmentList: [],
      equipmentColumns: [],
      selectedCategoryIndex: 0,
      equipmentCategoryOptions: [
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
    filteredEquipmentList() {
      if (!this.selectedCategory) {
        return this.equipmentList
      }
      return this.equipmentList.filter(item => item.category === this.selectedCategory)
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
        this.equipmentColumns = this.equipmentList.map(item => `${item.name} (${item.model}) - ${item.location}`)
      } catch (error) {
        console.error('加载设备列表失败:', error)
        Toast.fail('加载设备列表失败')
      }
    },
    
    onCategoryChange(picker, value, index) {
      this.selectedCategoryIndex = index
    },
    
    confirmCategorySelection() {
      const selectedOption = this.equipmentCategoryOptions[this.selectedCategoryIndex]
      this.selectedCategory = selectedOption.value
      // 重置设备选择
      this.form.equipment_id = ''
      this.form.equipment_name = ''
      this.showCategoryPicker = false
    },
    
    clearCategoryFilter() {
      this.selectedCategory = ''
      this.selectedCategoryIndex = 0
      // 重置设备选择
      this.form.equipment_id = ''
      this.form.equipment_name = ''
    },
    onEquipmentConfirm(value, index) {
      if (this.equipmentList.length > 0 && typeof index === 'number') {
        const selectedEquipment = this.equipmentList[index]
        this.form.equipment_id = selectedEquipment.id
        this.form.equipment_name = selectedEquipment.name
      }
      this.showEquipmentPicker = false
    },
    
    selectEquipment(equipment, index) {
      this.form.equipment_id = equipment.id
      this.form.equipment_name = equipment.name
      this.showEquipmentPicker = false
    },
    onRead(file) {
      // 将文件添加到files数组
      this.files.push(file.file)
    },
    onDelete(file, detail) {
      // 从files数组中删除文件
      this.files.splice(detail.index, 1)
    },
    goBack() {
      // 使用更可靠的导航方式，先尝试返回，如果失败则导航到首页
      if (window.history.length > 1) {
        this.$router.back()
      } else {
        this.$router.push('/home')
      }
    },
    async onSubmit(values) {
      try {
        this.loading = true
        await createRepairRequest(this.form, this.files)
        
        Toast.success('报修成功')
        
        // 重置表单
        this.form = {
          equipment_id: '',
          equipment_name: '',
          fault_description: ''
        }
        this.fileList = []
        this.files = []
        this.selectedEquipmentIndex = 0
        
        // 返回首页
        this.$router.push('/home')
      } catch (error) {
        console.error(error)
        Toast.fail(error.response?.data?.message || '报修失败')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.repair-request-container {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.upload-section {
  margin: 0 15px;
  padding: 10px;
  background-color: #fff;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #fff;
  border-bottom: 1px solid #ebedf0;
}

.picker-title {
  font-size: 16px;
  font-weight: bold;
}

.category-filter {
  padding: 10px 15px;
  background-color: #fff;
  border-bottom: 1px solid #ebedf0;
}
</style>

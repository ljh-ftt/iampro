<template>
  <div class="repair-list-container">
    <van-nav-bar title="派工单" left-text="返回" @click-left="goBack">
      <template #title>
        <div style="display: flex; align-items: center;">
          <van-icon name="orders-o" style="margin-right: 8px;" />
          派工单
        </div>
      </template>
    </van-nav-bar>
    
    <van-tabs v-model="activeTab">
      <van-tab title="待处理">
        <van-list
          v-model="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
          :immediate-check="false"
        >
          <van-cell
            v-for="item in pendingRepairs"
            :key="item.id"
            :title="`设备：${item.Equipment.name}`"
            :value="`状态：${getStatusText(item.status)}`"
            @click="handleRepair(item)"
          >
            <template #right-icon>
              <van-button 
                type="primary" 
                size="small"
                :disabled="item.status === 'completed'"
              >
                {{ item.status === 'completed' ? '已完成' : '处理' }}
              </van-button>
            </template>
          </van-cell>
        </van-list>
      </van-tab>
      <van-tab title="已完成">
        <!-- 搜索区域 -->
        <div class="search-section">
          <van-search
            v-model="searchQuery"
            placeholder="请输入故障名称搜索"
            @search="onSearch"
            @clear="onClear"
            shape="round"
          />
          
          <div class="date-range-section">
            <van-cell-group>
              <van-field
                v-model="startDate"
                placeholder="开始日期"
                label="开始日期"
                readonly
                is-link
                @click="showStartDatePicker = true"
              />
              <van-field
                v-model="endDate"
                placeholder="结束日期"
                label="结束日期"
                readonly
                is-link
                @click="showEndDatePicker = true"
              />
            </van-cell-group>
          </div>
          
          <div class="search-actions">
            <van-button type="primary" size="small" @click="onSearch">搜索</van-button>
            <van-button size="small" @click="onClear">清空</van-button>
          </div>
        </div>
        
        <van-list
          v-model="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
          :immediate-check="false"
        >
          <van-cell
            v-for="item in filteredCompletedRepairs"
            :key="item.id"
            :title="`设备：${item.Equipment.name}`"
            :value="`状态：${getStatusText(item.status)}`"
            @click="handleRepair(item)"
          >
            <template #right-icon>
              <van-button size="small">查看</van-button>
            </template>
          </van-cell>
        </van-list>
      </van-tab>
    </van-tabs>
    
    <!-- 维修处理对话框 -->
    <van-popup v-model="showRepairDialog" position="bottom" :style="{ height: '80%' }">
      <div class="repair-dialog-header">
        <h3>{{ currentRepair?.status === 'completed' ? '派工单详情' : '处理派工单' }}</h3>
        <van-icon name="cross" size="24" @click="showRepairDialog = false" />
      </div>
      
      <div class="repair-info">
        <van-cell-group>
          <van-cell title="设施设备名称" :value="currentRepair?.Equipment?.name" />
          <van-cell title="设备型号" :value="currentRepair?.Equipment?.model" />
          <van-cell title="设备位置" :value="currentRepair?.Equipment?.location" />
          <van-cell title="报修人" :value="currentRepair?.reporter?.name" />
          <van-cell title="报修时间" :value="formatDate(currentRepair?.created_at)" />
          <van-cell title="故障描述" :value="currentRepair?.fault_description" />
          
          <!-- 已完成工单显示更多详情 -->
          <template v-if="currentRepair?.status === 'completed'">
            <van-cell title="处理人" :value="currentRepair?.repair_records?.[0]?.repairman?.name || '未知'" />
            <van-cell title="处理时间" :value="formatDate(currentRepair?.repair_records?.[0]?.completed_at)" />
            <van-cell title="处理结果" :value="currentRepair?.repair_records?.[0]?.status === 'completed' ? '已解决' : '未解决'" />
            <van-cell title="解决方案" :value="currentRepair?.repair_records?.[0]?.solution_description" />
            <van-cell title="移交说明" :value="currentRepair?.repair_records?.[0]?.transfer_note || '无'" />
            <van-cell title="出工人员" :value="currentRepair?.repair_records?.[0]?.work_personnel || '无'" />
            <van-cell title="班次处理记录" :value="currentRepair?.repair_records?.[0]?.shift_processing_log || '无'" />
          </template>
          
          <!-- 未完成工单也显示之前的处理记录 -->
          <template v-else-if="currentRepair?.repair_records?.[0]">
            <van-cell title="处理人" :value="currentRepair?.repair_records?.[0]?.repairman?.name || '未知'" />
            <van-cell title="处理时间" :value="formatDate(currentRepair?.repair_records?.[0]?.created_at)" />
            <van-cell title="处理状态" :value="currentRepair?.repair_records?.[0]?.status === 'transferred' ? '未解决' : '其他'" />
            <van-cell title="移交说明" :value="currentRepair?.repair_records?.[0]?.transfer_note || '无'" />
            <van-cell title="出工人员" :value="currentRepair?.repair_records?.[0]?.work_personnel || '无'" />
            <van-cell title="班次处理记录" :value="currentRepair?.repair_records?.[0]?.shift_processing_log || '无'" />
          </template>
        </van-cell-group>
      </div>
      
      <!-- 未完成工单显示处理表单 -->
      <van-form v-if="currentRepair?.status !== 'completed'" @submit="onCompleteRepair">
        <van-radio-group v-model="repairStatus" direction="horizontal">
          <van-radio name="completed">已解决</van-radio>
          <van-radio name="transferred">未解决</van-radio>
        </van-radio-group>
        
        <van-field
          v-if="repairStatus === 'completed'"
          v-model="repairSolution"
          name="solution"
          type="textarea"
          placeholder="请描述解决情况"
          label="解决方案"
          rows="4"
          required
          :rules="[{ required: true, message: '请描述解决情况' }]"
        />
        
        <van-field
          v-if="repairStatus === 'transferred'"
          v-model="transferNote"
          name="transferNote"
          type="textarea"
          placeholder="请填写移交说明"
          label="移交说明"
          rows="4"
          required
          :rules="[{ required: true, message: '请填写移交说明' }]"
        />
        
        <van-field
          v-model="workPersonnel"
          name="workPersonnel"
          placeholder="请输入出工人员姓名"
          label="出工人员"
        />
        
        <van-field
          v-model="shiftProcessingLog"
          name="shiftProcessingLog"
          type="textarea"
          :placeholder="previousShiftLog ? '在之前记录基础上继续填写...' : '请填写班次处理记录'"
          label="班次处理记录"
          rows="4"
        />
        
        <div class="upload-section">
          <van-uploader
            v-model="repairFileList"
            :max-count="5"
            :after-read="onRepairRead"
            @delete="onRepairDelete"
            multiple
          />
        </div>
        
        <div style="margin: 24px;">
          <van-button type="primary" block native-type="submit" :loading="repairLoading">
            提交
          </van-button>
        </div>
      </van-form>
    </van-popup>
    
    <!-- 日期选择器 -->
    <van-popup v-model="showStartDatePicker" position="bottom">
      <van-datetime-picker
        v-model="startDateValue"
        type="date"
        @confirm="onStartDateConfirm"
        @cancel="showStartDatePicker = false"
      />
    </van-popup>
    
    <van-popup v-model="showEndDatePicker" position="bottom">
      <van-datetime-picker
        v-model="endDateValue"
        type="date"
        @confirm="onEndDateConfirm"
        @cancel="showEndDatePicker = false"
      />
    </van-popup>
  </div>
</template>

<script>
import { getRepairRequests, createRepairRecord } from '../api/repair'
import { Toast, Icon } from 'vant'

export default {
  name: 'RepairList',
  components: {
    Icon
  },
  data() {
    return {
      activeTab: 0,
      pendingRepairs: [],
      completedRepairs: [],
      loading: false,
      finished: false,
      page: 1,
      
      showRepairDialog: false,
      currentRepair: null,
      repairStatus: 'completed',
      repairSolution: '',
      transferNote: '',
      workPersonnel: '',
      shiftProcessingLog: '',
      previousShiftLog: '',
      
      // 搜索相关
      searchQuery: '',
      startDate: '',
      endDate: '',
      startDateValue: new Date(),
      endDateValue: new Date(),
      showStartDatePicker: false,
      showEndDatePicker: false,
      
      repairFileList: [],
      repairFiles: [],
      repairLoading: false
    }
  },
  mounted() {
    this.onLoad()
  },
  methods: {
    async onLoad() {
      try {
        this.loading = true
        const params = {
          status: this.activeTab === 0 ? ['pending', 'transferred'] : 'completed',
          page: this.page
        }
        
        const response = await getRepairRequests(params)
        const data = response.data
        
        if (this.activeTab === 0) {
          this.pendingRepairs = this.page === 1 ? data : [...this.pendingRepairs, ...data]
        } else {
          this.completedRepairs = this.page === 1 ? data : [...this.completedRepairs, ...data]
        }
        
        this.finished = data.length < 10
        this.page++
      } catch (error) {
        console.error(error)
        Toast.fail('获取派工单失败')
      } finally {
        this.loading = false
      }
    },
    
    handleRepair(repair) {
      this.currentRepair = repair
      // 获取之前的班次处理记录
      this.previousShiftLog = this.getPreviousShiftLog()
      this.showRepairDialog = true
    },
    
    onRepairRead(file) {
      this.repairFiles.push(file.file)
    },
    
    onRepairDelete(file, detail) {
      this.repairFiles.splice(detail.index, 1)
    },
    
    async onCompleteRepair() {
      try {
        this.repairLoading = true
        
        // 累计班次处理记录
        const currentShiftLog = this.formatShiftLog()
        const combinedShiftLog = this.previousShiftLog ? 
          `${this.previousShiftLog}\n\n【${this.formatDate(new Date())}】${currentShiftLog}` : 
          currentShiftLog
        
        const data = {
          repair_request_id: this.currentRepair.id,
          status: this.repairStatus,
          solution_description: this.repairStatus === 'completed' ? this.repairSolution : '',
          transfer_note: this.repairStatus === 'transferred' ? this.transferNote : '',
          work_personnel: this.workPersonnel,
          shift_processing_log: combinedShiftLog
        }
        
        await createRepairRecord(data, this.repairFiles)
        
        Toast.success('维修记录提交成功')
        this.showRepairDialog = false
        
        // 重置表单
        this.repairStatus = 'completed'
        this.repairSolution = ''
        this.transferNote = ''
        this.workPersonnel = ''
        this.shiftProcessingLog = ''
        this.previousShiftLog = ''
        this.repairFileList = []
        this.repairFiles = []
        
        // 刷新列表
        this.page = 1
        this.finished = false
        this.onLoad()
      } catch (error) {
        console.error(error)
        Toast.fail('维修记录提交失败')
      } finally {
        this.repairLoading = false
      }
    },
    
    getStatusText(status) {
      const statusMap = {
        pending: '待处理',
        processing: '处理中',
        completed: '已完成',
        transferred: '已移交，后续由下一班次处理'
      }
      return statusMap[status] || status
    },
    
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    },
    goBack() {
      // 使用更可靠的导航方式，先尝试返回，如果失败则导航到首页
      if (window.history.length > 1) {
        this.$router.back()
      } else {
        this.$router.push('/home')
      }
    },
    
    // 格式化班次处理记录
    formatShiftLog() {
      let log = ''
      
      // 添加处理人信息
      if (this.workPersonnel) {
        log += `处理人: ${this.workPersonnel}`
      }
      
      // 添加解决方案或移交说明
      if (this.repairStatus === 'completed' && this.repairSolution) {
        if (log) log += '\n'
        log += `解决方案: ${this.repairSolution}`
      } else if (this.repairStatus === 'transferred' && this.transferNote) {
        if (log) log += '\n'
        log += `移交说明: ${this.transferNote}`
      }
      
      // 添加新的处理记录
      if (this.shiftProcessingLog) {
        if (log) log += '\n'
        log += `处理记录: ${this.shiftProcessingLog}`
      }
      
      return log || '无处理记录'
    },
    
    // 获取之前的班次处理记录
    getPreviousShiftLog() {
      if (this.currentRepair && this.currentRepair.repair_records && this.currentRepair.repair_records.length > 0) {
        // 按创建时间倒序排列，获取最新的记录
        const sortedRecords = this.currentRepair.repair_records.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        )
        const latestRecord = sortedRecords[0]
        
        if (latestRecord.shift_processing_log) {
          return latestRecord.shift_processing_log
        }
      }
      return ''
    },
    
    // 搜索功能
    onSearch() {
      // 搜索是响应式的，computed会自动过滤
      Toast.success('搜索完成')
    },
    
    // 清空搜索
    onClear() {
      this.searchQuery = ''
      this.startDate = ''
      this.endDate = ''
      this.startDateValue = new Date()
      this.endDateValue = new Date()
      Toast.success('已清空搜索条件')
    },
    
    // 开始日期确认
    onStartDateConfirm(value) {
      this.startDate = this.formatDate(value)
      this.showStartDatePicker = false
    },
    
    // 结束日期确认
    onEndDateConfirm(value) {
      this.endDate = this.formatDate(value)
      this.showEndDatePicker = false
    }
  },
  computed: {
    // 过滤已完成派工单
    filteredCompletedRepairs() {
      let filtered = this.completedRepairs
      
      // 按故障名称搜索
      if (this.searchQuery) {
        filtered = filtered.filter(item => 
          item.fault_description && 
          item.fault_description.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      }
      
      // 按日期范围搜索
      if (this.startDate && this.endDate) {
        const startDate = new Date(this.startDate)
        const endDate = new Date(this.endDate)
        endDate.setHours(23, 59, 59, 999) // 设置结束时间为当天的最后一刻
        
        filtered = filtered.filter(item => {
          const itemDate = new Date(item.created_at)
          return itemDate >= startDate && itemDate <= endDate
        })
      }
      
      return filtered
    }
  },
  watch: {
    activeTab() {
      this.page = 1
      this.finished = false
      this.pendingRepairs = []
      this.completedRepairs = []
      this.onLoad()
    }
  }
}
</script>

<style scoped>
.repair-list-container {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.repair-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.repair-info {
  padding: 16px;
  background-color: #fff;
}

.upload-section {
  margin: 0 15px;
  padding: 10px;
  background-color: #fff;
}

.search-section {
  padding: 10px;
  background-color: #fff;
  margin-bottom: 10px;
}

.date-range-section {
  margin: 10px 0;
}

.search-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}
</style>
